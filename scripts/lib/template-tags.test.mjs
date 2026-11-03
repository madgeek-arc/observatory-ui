import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import PizZip from 'pizzip';
import {loadReportConfig} from './report-config.mjs';
import {checkTemplateTags, extractTags, readTemplateTags, tagsOfDocx, TemplateTagsError} from './template-tags.mjs';

const run = text => `<w:r><w:rPr><w:highlight w:val="yellow"/></w:rPr><w:t>${text}</w:t></w:r>`;
const paragraph = (...runs) => `<w:p><w:pPr><w:pStyle w:val="normal1"/></w:pPr>${runs.map(run).join('')}</w:p>`;
const documentOf = (...paragraphs) => `<w:document><w:body>${paragraphs.join('')}</w:body></w:document>`;

const real = await loadReportConfig();

const chart = (type, title, namedQueries, stats) => ({type, title, namedQueries, stats, data: [], chartSeries: []});
const charts = [
  chart('mapWithPoints', 'Map of countries with a policy', ['Question6', 'Question6.1'], ['Question6', 'Question6.1']),
  chart('stackedBars', 'Trend of the policy', ['Question6', 'Question6.1'], ['Question6']),
  chart('rangeColumns', 'Share of investments', ['Question56', 'Question1'], ['Question56']),
];
const config = {...real, charts, globalKeys: ['Year'], staticImageKeys: ['logoImage']};

const check = (...tags) => checkTemplateTags(tags, config);

describe('extractTags', () => {
  it('finds a tag Word split over several runs', () => {
    const xml = documentOf(paragraph('Policy is ', '{', 'Question6', '[0]', '}', ' since {Year}.'));
    assert.deepEqual(extractTags(xml), {tags: ['Question6[0]', 'Year'], problems: []});
  });

  it('tells image tags from text tags and trims the name', () => {
    const xml = documentOf(paragraph('{%chartImage1}'), paragraph('{ Year }'));
    assert.deepEqual(extractTags(xml).tags, ['%chartImage1', 'Year']);
  });

  it('ignores paragraphs without tags', () => {
    assert.deepEqual(extractTags(documentOf(paragraph('Figure 1: Map of countries'), paragraph('x'))), {tags: [], problems: []});
  });

  it('reports tags the export cannot fill', () => {
    const xml = documentOf(paragraph('{#countries}'), paragraph('Hello {Question6 [0]}'), paragraph('{/countries}'));
    const {tags, problems} = extractTags(xml, 'word/footer1.xml');
    assert.deepEqual(tags, []);
    assert.equal(problems.length, 3);
    assert.match(problems[0], /^word\/footer1\.xml: \{#countries\} is not a tag the export can fill/);
  });

  it('reports a brace that is not part of a tag', () => {
    const {problems} = extractTags(documentOf(paragraph('{Year} and a stray } here')));
    assert.equal(problems.length, 1);
    assert.match(problems[0], /unbalanced brace in "\{Year\} and a stray \} here"/);
  });
});

describe('tagsOfDocx', () => {
  const docx = parts => {
    const zip = new PizZip();
    Object.entries(parts).forEach(([name, xml]) => zip.file(name, xml));
    return zip.generate({type: 'nodebuffer'});
  };

  it('reads the document and the headers and footers', () => {
    const tags = tagsOfDocx(docx({
      'word/document.xml': documentOf(paragraph('{Year}')),
      'word/footer1.xml': documentOf(paragraph('{FiscalYear}')),
      'word/styles.xml': documentOf(paragraph('{NotATag')),
    }));
    assert.deepEqual(tags, ['Year', 'FiscalYear']);
  });

  it('stops with every problem of every part', () => {
    const content = docx({
      'word/document.xml': documentOf(paragraph('{#a}')),
      'word/header1.xml': documentOf(paragraph('{#b}')),
    });
    assert.throws(() => tagsOfDocx(content), error => error instanceof TemplateTagsError && error.problems.length === 2);
  });

  it('stops when the file is not a .docx', () => {
    assert.throws(() => tagsOfDocx(docx({'readme.txt': 'x'}), 'a.docx'), /a\.docx has no word\/document\.xml/);
  });
});

describe('checkTemplateTags', () => {
  const all = [
    'Year', 'Question6', 'Question6.1', 'Question6[0]', 'Question6[3]', 'Question56[6]', 'Question56_invested',
    '%chartImage1', '%chartImage2', '%chartImage3', '%pieChartImage_0_0', '%pieChartImage_0_1', '%logoImage',
  ];

  it('accepts what the charts produce, once per tag, however often the template uses it', () => {
    const result = check(...all, ...all);
    assert.deepEqual(result, {errors: [], warnings: []});
  });

  it('rejects a text tag no chart sets, because the report would print "undefined"', () => {
    const {errors} = check('Question7', 'FiscalYear');
    assert.equal(errors.length, 2);
    assert.match(errors[0], /^\{Question7\} is set by no chart, so the report would print "undefined"$/);
  });

  it('says what a question does get when only the suffix is wrong', () => {
    const {errors} = check('Question6[4]', 'Question56_invested[0]');
    assert.match(errors[0], /^\{Question6\[4\]\} is set by no chart; Question6 only gets Question6, Question6\[0\], Question6\[1\], Question6\[2\], Question6\[3\]/);
    assert.match(errors[1], /\{Question56_invested\[0\]\} is set by no chart; Question56_invested only gets Question56_invested,/);
  });

  it('rejects chart images outside chartsCfg, numbered from 1', () => {
    const {errors} = check('%chartImage0', '%chartImage4', '%chartImage02', '%chartImage1');
    assert.equal(errors.length, 3);
    assert.match(errors[0], /^\{%chartImage0\} is not a chart: chartsCfg has 3 charts, numbered from 1$/);
  });

  it('rejects pie charts the chart does not build, numbered from 0', () => {
    const {errors} = check('%pieChartImage_3_0', '%pieChartImage_1_0', '%pieChartImage_0_2', '%pieChartImage_0_1');
    assert.deepEqual(errors, [
      '{%pieChartImage_3_0} is not a chart: chartsCfg has 3 charts, numbered from 0 here',
      '{%pieChartImage_1_0}: chart 1 (stackedBars) builds no pie charts',
      '{%pieChartImage_0_2}: chart 0 builds 2 pie charts, numbered from 0',
    ]);
  });

  it('rejects an image the export does not provide', () => {
    assert.deepEqual(check('%photo').errors, ['{%photo} is not an image the export provides']);
  });

  it('warns about charts the template does not show, which are still loaded and rendered', () => {
    const {errors, warnings} = check('%chartImage1');
    assert.deepEqual(errors, []);
    assert.equal(warnings.length, 3);
    assert.match(warnings[0], /^chart 2 \(stackedBars\) "Trend of the policy" has no \{%chartImage2\}/);
    assert.match(warnings[1], /^chart 3 \(rangeColumns\)/);
  });

  it('warns about the pie charts that are built and not used', () => {
    const {warnings} = check('%chartImage1', '%chartImage2', '%chartImage3', '%pieChartImage_0_1');
    assert.deepEqual(warnings, ['1 of the 2 pie charts that are built are not in the template']);
  });
});

describe('report_template.docx', () => {
  // The gate for template edits: a tag the report does not fill in makes the export print "undefined" or fail.
  // Charts that the template does not show are only warnings (see npm run docx:tags:check).
  it('has no tag that the report component does not fill in', () => {
    const tags = readTemplateTags(new URL('../../src/assets/docx-templates/report_template.docx', import.meta.url));
    assert.ok(tags.length > 0);
    assert.deepEqual(checkTemplateTags(tags, real).errors, []);
  });
});
