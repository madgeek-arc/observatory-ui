import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import PizZip from 'pizzip';
import { ReportCreationService } from './report-creation.service';

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const EMU_PER_PIXEL = 9525;

// A tag split over three runs, like the highlighted tags in report_template.docx
const SPLIT_TAG_PARAGRAPH =
  '<w:p><w:r><w:t>There is {</w:t></w:r>' +
  '<w:r><w:rPr><w:highlight w:val="yellow"/></w:rPr><w:t>trend</w:t></w:r>' +
  '<w:r><w:t>} in financial strategies</w:t></w:r></w:p>';

const IMAGE_PARAGRAPH = '<w:p><w:r><w:t>{%chart}</w:t></w:r></w:p>';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const pngBytes = (): ArrayBuffer => Uint8Array.from([...PNG_SIGNATURE, 1, 2, 3]).buffer;

const buildTemplate = (paragraph = SPLIT_TAG_PARAGRAPH): ArrayBuffer => {
  const zip = new PizZip();
  zip.file('[Content_Types].xml', XML_HEADER +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Default Extension="png" ContentType="image/png"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>');
  zip.file('word/_rels/document.xml.rels', XML_HEADER +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
  zip.file('word/document.xml', `${XML_HEADER}<w:document ${W_NS}><w:body>${paragraph}</w:body></w:document>`);
  return zip.generate({type: 'arraybuffer'});
};

// Texts of the <w:t> runs that Word would show without their leading or trailing spaces (not counting non-breaking ones)
const runsLosingSpaces = (xml: string): string[] =>
  [...xml.matchAll(/<w:t((?:\s[^>]*)?)>([^<]*)<\/w:t>/g)]
    .filter(([, attrs, text]) => /^[ \t\r\n]|[ \t\r\n]$/.test(text) && !attrs.includes('xml:space="preserve"'))
    .map(([, , text]) => text);

const textOf = (xml: string): string => xml.replace(/<[^>]+>/g, '');

const tick = () => new Promise<void>(resolve => setTimeout(resolve));

// Stops saveAs() from downloading and hands back what it would have saved, as a docx and with its file name
const captureDownload = () => {
  let blob: Blob | undefined;
  let fileName = '';
  spyOn(URL, 'createObjectURL').and.callFake((exported: Blob | MediaSource) => {
    blob = exported as Blob;
    return 'blob:report';
  });
  spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').and.callFake(function (this: HTMLAnchorElement) { // saveAs() clicks a download link
    fileName = this.download;
    return true;
  });

  return async () => {
    await tick(); // saveAs's click is deferred, let it run while the spies are active
    return {zip: new PizZip(await blob!.arrayBuffer()), fileName};
  };
};

describe('ReportCreationService', () => {
  describe('with mocked HTTP', () => {
    let service: ReportCreationService;
    let http: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]});
      service = TestBed.inject(ReportCreationService);
      http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    describe('exportDocWithMultipleImages', () => {
      type ChartImages = Parameters<ReportCreationService['exportDocWithMultipleImages']>[1];
      type StaticImages = Parameters<ReportCreationService['exportDocWithMultipleImages']>[2];

      // Runs the real export against an in-memory template and returns the docx it would have downloaded
      const exportDocx = async (
        {data = {}, chartImages = {}, staticImages, paragraph}:
          { data?: object, chartImages?: ChartImages, staticImages?: StaticImages, paragraph?: string }
      ) => {
        const download = captureDownload();

        const done = service.exportDocWithMultipleImages(data, chartImages, staticImages);
        for (const image of Object.values(staticImages ?? {})) { // fetched one by one, before the template
          http.expectOne(image.path).flush(pngBytes());
          await tick();
        }
        http.expectOne(service.templateUrl).flush(buildTemplate(paragraph));
        await done;

        return download();
      };

      const extent = (width: number, height: number) => `<wp:extent cx="${width * EMU_PER_PIXEL}" cy="${height * EMU_PER_PIXEL}"/>`;

      it('keeps the space after a tag that is split across runs', async () => {
        const {zip} = await exportDocx({data: {trend: 'a decrease'}});
        const xml = zip.file('word/document.xml').asText();

        expect(textOf(xml)).toContain('There is a decrease in financial strategies');
        // Without xml:space="preserve" Word renders "decreasein"
        expect(runsLosingSpaces(xml)).toEqual([]);
      });

      it('names the file report_<timestamp>.docx', async () => {
        const {fileName} = await exportDocx({});

        expect(fileName).toMatch(/^report_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.docx$/);
      });

      describe('images', () => {
        const mediaFiles = (zip: PizZip) => zip.file(/^word\/media\//).map((file: any) => file.name);

        it('embeds a chart image, centered, at its own size', async () => {
          const {zip} = await exportDocx({
            paragraph: IMAGE_PARAGRAPH,
            chartImages: {chart: {buffer: pngBytes(), width: 200, height: 100}}
          });
          const xml = zip.file('word/document.xml').asText();

          expect(mediaFiles(zip)).toEqual(['word/media/image_generated_1.png']);
          expect(Array.from(zip.file('word/media/image_generated_1.png').asUint8Array())).toEqual([...PNG_SIGNATURE, 1, 2, 3]);
          expect(xml).toContain(extent(200, 100));
          expect(xml).toContain('<w:jc w:val="center"/>');
        });

        it('fetches a static image and embeds it at its own size', async () => {
          const {zip} = await exportDocx({
            paragraph: IMAGE_PARAGRAPH,
            staticImages: {chart: {path: 'assets/images/logo.png', width: 50, height: 20}}
          });

          expect(mediaFiles(zip)).toEqual(['word/media/image_generated_1.png']);
          expect(zip.file('word/document.xml').asText()).toContain(extent(50, 20));
        });

        it('falls back to 400x300 when an image has no recorded size', async () => {
          const {zip} = await exportDocx({paragraph: IMAGE_PARAGRAPH, data: {chart: pngBytes()}});

          expect(zip.file('word/document.xml').asText()).toContain(extent(400, 300));
        });

        it('adds nothing for an image tag without data', async () => {
          const {zip} = await exportDocx({paragraph: IMAGE_PARAGRAPH});

          expect(mediaFiles(zip)).toEqual([]);
          expect(zip.file('word/document.xml').asText()).not.toContain('<w:drawing>');
        });
      });

      describe('errors', () => {
        beforeEach(() => spyOn(console, 'error'));

        it('logs and rethrows when the template cannot be loaded', async () => {
          const done = service.exportDocWithMultipleImages({}, {});
          http.expectOne(service.templateUrl).flush(new ArrayBuffer(0), {status: 500, statusText: 'Server Error'});

          await expectAsync(done).toBeRejected();
          expect(console.error).toHaveBeenCalledWith('Export error:', jasmine.anything());
        });

        it('logs and rethrows when the template is not a docx', async () => {
          const done = service.exportDocWithMultipleImages({}, {});
          http.expectOne(service.templateUrl).flush(new ArrayBuffer(8));

          await expectAsync(done).toBeRejected();
          expect(console.error).toHaveBeenCalledWith('Export error:', jasmine.anything());
        });
      });
    });

    describe('preserveWhitespace', () => {
      const preserve = (zip: PizZip) => service['preserveWhitespace'](zip);

      it('marks the text runs of the body, headers and footers', () => {
        const zip = new PizZip();
        zip.file('word/document.xml', '<w:t> a</w:t>');
        zip.file('word/header1.xml', '<w:t>b </w:t>');
        zip.file('word/footer2.xml', '<w:t> c </w:t>');

        preserve(zip);

        expect(zip.file('word/document.xml').asText()).toBe('<w:t xml:space="preserve"> a</w:t>');
        expect(zip.file('word/header1.xml').asText()).toBe('<w:t xml:space="preserve">b </w:t>');
        expect(zip.file('word/footer2.xml').asText()).toBe('<w:t xml:space="preserve"> c </w:t>');
      });

      it('leaves other parts, other elements and runs that already preserve spaces untouched', () => {
        const zip = new PizZip();
        const document = '<w:tbl><w:tc><w:p><w:r><w:tab/><w:t xml:space="preserve"> kept</w:t></w:r></w:p></w:tc></w:tbl>';
        zip.file('word/document.xml', document);
        zip.file('word/styles.xml', '<w:t> style</w:t>');

        preserve(zip);

        expect(zip.file('word/document.xml').asText()).toBe(document);
        expect(zip.file('word/styles.xml').asText()).toBe('<w:t> style</w:t>');
      });
    });

    describe('svgToArrayBuffer', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="red"/></svg>';

      it('renders the svg to a png', async () => {
        const png = new Uint8Array(await service.svgToArrayBuffer(svg, 20, 10));

        expect(Array.from(png.slice(0, PNG_SIGNATURE.length))).toEqual(PNG_SIGNATURE);
      });

      it('revokes the object url it created', async () => {
        const revoke = spyOn(URL, 'revokeObjectURL').and.callThrough();

        await service.svgToArrayBuffer(svg, 20, 10);

        expect(revoke).toHaveBeenCalledTimes(1);
      });

      it('rejects when the svg cannot be loaded', async () => {
        const revoke = spyOn(URL, 'revokeObjectURL').and.callThrough();

        await expectAsync(service.svgToArrayBuffer('not an svg', 20, 10)).toBeRejectedWithError('Failed to load SVG as image');
        expect(revoke).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('with the real report template', () => {
    let service: ReportCreationService;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [provideHttpClient(withXhr())]});
      service = TestBed.inject(ReportCreationService);
    });

    it('renders without errors and keeps the spaces after its tags', async () => {
      const download = captureDownload();

      await service.exportDocWithMultipleImages({Year: '2025'}, {});
      const xml = (await download()).zip.file('word/document.xml').asText();

      expect(textOf(xml)).toContain('in Survey 2025');
      expect(runsLosingSpaces(xml)).toEqual([]);
    }, 20000);
  });
});
