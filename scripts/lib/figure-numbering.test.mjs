import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {FigureNumberingError, renumberFigures} from './figure-numbering.mjs';

const run = text => `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`;
const paragraph = (...runs) => `<w:p><w:pPr><w:pStyle w:val="normal1"/></w:pPr>${runs.map(run).join('')}</w:p>`;
const documentOf = (...paragraphs) => `<w:document><w:body>${paragraphs.join('')}</w:body></w:document>`;

const caption = (number, title = 'Map of countries') => paragraph(`Figure ${number}: ${title}`);
const reference = (text, ...more) => paragraph(text, ...more);

const textsOf = xml => [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(match => match[1]);

describe('renumberFigures', () => {
  it('closes the gaps in the captions, in document order', () => {
    const xml = documentOf(caption(1), caption(2), caption(5), caption(6));
    const result = renumberFigures(xml);
    assert.deepEqual(textsOf(result.xml), ['Figure 1: Map of countries', 'Figure 2: Map of countries', 'Figure 3: Map of countries', 'Figure 4: Map of countries']);
    assert.deepEqual(result.gaps, ['3-4']);
    assert.deepEqual(result.renumbered, ['5-6 → 3-4']);
    assert.equal(result.changed, true);
  });

  it('updates "Figure N" and "Figures N and M" references to follow their captions', () => {
    const xml = documentOf(
      caption(1),
      reference('Shown in Figures 5 and 6.'), caption(5), caption(6),
      reference('Shown in Figure 9.'), caption(9),
    );
    const result = renumberFigures(xml);
    assert.deepEqual(textsOf(result.xml), [
      'Figure 1: Map of countries',
      'Shown in Figures 2 and 3.', 'Figure 2: Map of countries', 'Figure 3: Map of countries',
      'Shown in Figure 4.', 'Figure 4: Map of countries',
    ]);
    assert.equal(result.references, 2);
    assert.equal(result.referencesRewritten, 2);
    assert.deepEqual(result.warnings, []);
  });

  it('leaves tags, entities, other numbers and all markup untouched', () => {
    const text = '{Question6[3]} &amp; {Year} since Survey 2022 as shown in Figure 7.';
    const xml = documentOf(reference(text), caption(7));
    const result = renumberFigures(xml);
    assert.equal(result.xml, xml.replaceAll('Figure 7', 'Figure 1'));
  });

  it('leaves a contiguous document byte-identical', () => {
    const xml = documentOf(reference('See Figures 1 and 2.'), caption(1), caption(2));
    const result = renumberFigures(xml);
    assert.equal(result.changed, false);
    assert.equal(result.xml, xml);
    assert.deepEqual(result.gaps, []);
  });

  it('is idempotent', () => {
    const xml = documentOf(reference('See Figures 4 and 8.'), caption(4), caption(8));
    const once = renumberFigures(xml);
    const twice = renumberFigures(once.xml);
    assert.equal(twice.changed, false);
    assert.equal(twice.xml, once.xml);
  });

  it('warns, without failing, when a reference is not followed by its caption', () => {
    const xml = documentOf(caption(1), caption(2), reference('Compare with Figure 1.'), caption(3));
    const result = renumberFigures(xml);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /Figure 1 does not refer to the caption\(s\) right after it/);
  });

  describe('refuses to guess', () => {
    const problemsOf = xml => {
      try {
        renumberFigures(xml);
      } catch (error) {
        assert.ok(error instanceof FigureNumberingError);
        return error.problems;
      }
      assert.fail('expected renumberFigures to throw');
    };

    it('when a figure has two captions', () => {
      assert.match(problemsOf(documentOf(caption(1), caption(1)))[0], /Figure 1 has more than one caption/);
    });

    it('when a reference points at a figure with no caption', () => {
      assert.match(problemsOf(documentOf(reference('See Figure 4.'), caption(1)))[0], /Reference to Figure 4, which has no caption/);
    });

    it('when a caption or a reference is split across runs', () => {
      assert.match(problemsOf(documentOf(paragraph('Figure ', '3: Split caption')))[0], /Caption split across runs/);
      assert.match(problemsOf(documentOf(caption(1), reference('See Fig', 'ure 1.')))[0], /Figure reference split across runs/);
      assert.match(problemsOf(documentOf(caption(1), reference('See Figure ', '1.')))[0], /Figure reference split across runs/);
    });

    it('when a reference lists more than two figures or a range', () => {
      for (const text of ['See Figures 1, 2 and 3.', 'See Figures 1-3.', 'See Figures 1 – 3.', 'See Figures 1 and 2 and 3.']) {
        assert.match(problemsOf(documentOf(reference(text), caption(1), caption(2), caption(3)))[0], /Unsupported figure reference/, text);
      }
    });

    it('when the document has text boxes', () => {
      const xml = documentOf(caption(1)).replace('</w:body>', '<w:txbxContent></w:txbxContent></w:body>');
      assert.match(problemsOf(xml)[0], /text boxes/);
    });
  });
});
