// Renumbers the "Figure N" captions of a Word document in document order and remaps the "Figure N" and
// "Figures N and M" references that point at them. It works on the raw text of word/document.xml and only
// rewrites digits, so every other byte of the document stays as it was.

const PARAGRAPH = /<w:p[ >][\s\S]*?<\/w:p>/g;
const TEXT_RUN = /(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g;
const CAPTION = /^(\s*Figure\s+)(\d+)(\s*[:.])/;
const REFERENCE = /(Figures?\s+)(\d+)(?:(\s*and\s*)(\d+))?/g;
// "Figures 3, 4 and 5", "Figures 3-5", "Figures 3 and 4 and 5": more numbers than REFERENCE would remap
const UNSUPPORTED_REFERENCE = /Figures?\s+\d+(?:\s*(?:,|–|—|-|&|to)\s*\d+|\s*and\s*\d+\s*(?:,|and|–|—|-|&|to)\s*\d+)/;

export class FigureNumberingError extends Error {
  constructor(problems) {
    super(problems.join('\n'));
    this.name = 'FigureNumberingError';
    this.problems = problems;
  }
}

const snippet = text => text.replace(/\s+/g, ' ').trim().slice(0, 70);

function readParagraph(xml) {
  const runs = [...xml.matchAll(TEXT_RUN)].map(match => match[2]);
  const text = runs.join('');
  let caption = null;
  let before = '';
  for (const [index, run] of runs.entries()) {
    if (before.trim() === '' && CAPTION.test(run)) {
      caption = {run: index, number: Number(run.match(CAPTION)[2])};
      break;
    }
    before += run;
  }
  const isCaption = CAPTION.test(text);
  const references = [];
  let splitReferences = false;
  if (!isCaption) {
    const inRuns = runs.flatMap(run => [...run.matchAll(REFERENCE)]);
    const inText = [...text.matchAll(REFERENCE)];
    splitReferences = inRuns.length !== inText.length;
    for (const match of inRuns) {
      references.push([match[2], match[4]].filter(Boolean).map(Number));
    }
  }
  const unsupportedReference = !isCaption && UNSUPPORTED_REFERENCE.test(text);
  return {text, caption, isCaption, splitCaption: isCaption && !caption, references, splitReferences, unsupportedReference};
}

function ranges(numbers) {
  const parts = [];
  for (let i = 0; i < numbers.length; i++) {
    let end = i;
    while (end + 1 < numbers.length && numbers[end + 1] === numbers[end] + 1) end++;
    parts.push(end === i ? `${numbers[i]}` : `${numbers[i]}-${numbers[end]}`);
    i = end;
  }
  return parts;
}

function renumberedRanges(mapping) {
  const moved = [...mapping].filter(([from, to]) => from !== to);
  const parts = [];
  for (let i = 0; i < moved.length; i++) {
    let end = i;
    const shift = moved[i][1] - moved[i][0];
    while (end + 1 < moved.length && moved[end + 1][0] === moved[end][0] + 1 && moved[end + 1][1] - moved[end + 1][0] === shift) end++;
    const [first, last] = [moved[i], moved[end]];
    parts.push(end === i ? `${first[0]} → ${first[1]}` : `${first[0]}-${last[0]} → ${first[1]}-${last[1]}`);
    i = end;
  }
  return parts;
}

/**
 * @param {string} xml the text of word/document.xml
 * @returns {{xml: string, changed: boolean, captions: number, references: number, referencesRewritten: number,
 *   gaps: string[], renumbered: string[], warnings: string[]}}
 * @throws {FigureNumberingError} when the document cannot be renumbered safely
 */
export function renumberFigures(xml) {
  const problems = [];
  if (xml.includes('txbxContent')) {
    problems.push('The document contains text boxes; their paragraphs are nested and cannot be matched safely.');
  }

  const paragraphs = xml.match(PARAGRAPH) ?? [];
  const parsed = paragraphs.map(readParagraph);

  const captions = [];
  parsed.forEach((paragraph, index) => {
    if (paragraph.splitCaption) {
      problems.push(`Caption split across runs, merge the runs in Word: "${snippet(paragraph.text)}"`);
    } else if (paragraph.caption) {
      captions.push({paragraph: index, number: paragraph.caption.number});
    }
    if (paragraph.splitReferences) {
      problems.push(`Figure reference split across runs, merge the runs in Word: "${snippet(paragraph.text)}"`);
    }
    if (paragraph.unsupportedReference) {
      problems.push(`Unsupported figure reference, only "Figure N" and "Figures N and M" are renumbered: "${snippet(paragraph.text)}"`);
    }
  });

  const seen = new Set();
  for (const {number} of captions) {
    if (seen.has(number)) problems.push(`Figure ${number} has more than one caption.`);
    seen.add(number);
  }

  const mapping = new Map(captions.map(({number}, index) => [number, index + 1]));
  for (const paragraph of parsed) {
    for (const number of paragraph.references.flat()) {
      if (!mapping.has(number)) problems.push(`Reference to Figure ${number}, which has no caption: "${snippet(paragraph.text)}"`);
    }
  }
  if (problems.length) throw new FigureNumberingError(problems);

  const warnings = [];
  parsed.forEach((paragraph, index) => {
    for (const numbers of paragraph.references) {
      const following = captions.filter(caption => caption.paragraph > index).slice(0, numbers.length).map(caption => caption.number);
      if (following.join() !== numbers.join()) {
        warnings.push(`Figure${numbers.length > 1 ? 's' : ''} ${numbers.join(' and ')} does not refer to the caption(s) right after it: "${snippet(paragraph.text)}"`);
      }
    }
  });

  let referencesRewritten = 0;
  let index = 0;
  const rewritten = xml.replace(PARAGRAPH, paragraph => {
    const info = parsed[index++];
    if (!info.caption && !info.references.length) return paragraph;
    let run = -1;
    return paragraph.replace(TEXT_RUN, (all, open, text, close) => {
      run++;
      if (info.caption) {
        if (run !== info.caption.run) return all;
        return open + text.replace(CAPTION, (m, label, number, colon) => label + mapping.get(Number(number)) + colon) + close;
      }
      const updated = text.replace(REFERENCE, (m, label, first, joiner, second) => {
        const rewrite = label + mapping.get(Number(first)) + (second ? joiner + mapping.get(Number(second)) : '');
        if (rewrite !== m) referencesRewritten++;
        return rewrite;
      });
      return open + updated + close;
    });
  });

  const numbers = captions.map(caption => caption.number);
  const highest = Math.max(0, ...numbers);
  const gaps = ranges([...Array(highest).keys()].map(n => n + 1).filter(n => !seen.has(n)));
  const referencesTotal = parsed.reduce((sum, paragraph) => sum + paragraph.references.length, 0);

  return {
    xml: rewritten,
    changed: rewritten !== xml,
    captions: captions.length,
    references: referencesTotal,
    referencesRewritten,
    gaps,
    renumbered: renumberedRanges(mapping),
    warnings,
  };
}
