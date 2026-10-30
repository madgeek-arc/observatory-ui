// Reads the {tags} of the Word report template and checks them against what the report component produces, because
// docxtemplater does not: a text tag without data is printed as "undefined", and an image tag without data fails the
// export (or shows nothing, when the chart is out of range) only when somebody generates the report.

import {readFileSync} from 'node:fs';
import PizZip from 'pizzip';

const PARAGRAPH = /<w:p[ >][\s\S]*?<\/w:p>/g;
const TEXT_RUN = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
const TAG = /\{([^{}]*)\}/g;
const BRACE = /[{}]/;
// Question6, Question6.3.1[0], Question56_invested, Question80_trend[1]
const TEXT_TAG = /^[A-Za-z]\w*(?:\.\w+)*(?:\[\d+\])?$/;
const IMAGE_TAG = /^%[A-Za-z]\w*$/;
const PARTS = /^word\/(?:document|header\d*|footer\d*)\.xml$/;

export class TemplateTagsError extends Error {
  constructor(problems) {
    super(problems.join('\n'));
    this.name = 'TemplateTagsError';
    this.problems = problems;
  }
}

const snippet = text => text.replace(/\s+/g, ' ').trim().slice(0, 70);

// A tag is split over several runs as soon as Word sees a spell-check or formatting change inside it, so the text of
// a paragraph is joined before the tags are looked for, the way docxtemplater does it
export function extractTags(xml, part = 'word/document.xml') {
  const tags = [];
  const problems = [];
  for (const [paragraph] of xml.matchAll(PARAGRAPH)) {
    const text = [...paragraph.matchAll(TEXT_RUN)].map(match => match[1]).join('');
    if (!BRACE.test(text)) continue;

    for (const [, raw] of text.matchAll(TAG)) {
      const name = raw.trim();
      if (TEXT_TAG.test(name) || IMAGE_TAG.test(name)) {
        tags.push(name);
      } else {
        // the export has no data for loops or conditions ({#x}, {/x}, {^x}), so those would render as "undefined" too
        problems.push(`${part}: {${raw}} is not a tag the export can fill, in "${snippet(text)}"`);
      }
    }
    if (BRACE.test(text.replace(TAG, ''))) {
      problems.push(`${part}: unbalanced brace in "${snippet(text)}"`);
    }
  }
  return {tags, problems};
}

export function tagsOfDocx(content, label = 'the template') {
  const zip = new PizZip(content);
  if (!zip.file('word/document.xml')) {
    throw new TemplateTagsError([`${label} has no word/document.xml; is it a .docx?`]);
  }

  const tags = [];
  const problems = [];
  for (const part of zip.file(PARTS)) {
    const found = extractTags(part.asText(), part.name);
    tags.push(...found.tags);
    problems.push(...found.problems);
  }
  if (problems.length) throw new TemplateTagsError(problems);
  return tags;
}

export const readTemplateTags = file => tagsOfDocx(readFileSync(file), file);

// "7" is chartImage7, "07" and "7.0" are not
const index = digits => (String(Number(digits)) === digits ? Number(digits) : NaN);

function unknownTextTag(tag, produced) {
  const root = tag.replace(/\[\d+\]$/, '');
  const siblings = [...produced].filter(key => key.replace(/\[\d+\]$/, '') === root);
  const known = siblings.length ? `; ${root} only gets ${siblings.join(', ')}` : '';
  return `{${tag}} is set by no chart${known}, so the report would print "undefined"`;
}

// config: {charts, reportKeys, buildsPies, globalKeys, staticImageKeys}, see report-chart.configuration.ts
export function checkTemplateTags(tags, {charts, reportKeys, buildsPies, globalKeys, staticImageKeys}) {
  const errors = [];
  const warnings = [];
  const produced = new Set([...globalKeys, ...charts.flatMap(reportKeys)]);
  const chartsInTemplate = new Set();
  const piesInTemplate = new Set();

  for (const tag of new Set(tags)) {
    if (!tag.startsWith('%')) {
      if (!produced.has(tag)) errors.push(unknownTextTag(tag, produced));
      continue;
    }

    const name = tag.slice(1);
    const chart = /^chartImage(\d+)$/.exec(name);
    const pie = /^pieChartImage_(\d+)_(\d+)$/.exec(name);
    if (chart) {
      const n = index(chart[1]);
      if (n >= 1 && n <= charts.length) {
        chartsInTemplate.add(n - 1);
      } else {
        errors.push(`{${tag}} is not a chart: chartsCfg has ${charts.length} charts, numbered from 1`);
      }
    } else if (pie) {
      const i = index(pie[1]);
      const j = index(pie[2]);
      if (!(i < charts.length)) {
        errors.push(`{${tag}} is not a chart: chartsCfg has ${charts.length} charts, numbered from 0 here`);
      } else if (!buildsPies(charts[i])) {
        errors.push(`{${tag}}: chart ${i} (${charts[i].type}) builds no pie charts`);
      } else if (!(j < charts[i].namedQueries.length)) {
        errors.push(`{${tag}}: chart ${i} builds ${charts[i].namedQueries.length} pie charts, numbered from 0`);
      } else {
        piesInTemplate.add(`${i}_${j}`);
      }
    } else if (!staticImageKeys.includes(name)) {
      errors.push(`{${tag}} is not an image the export provides`);
    }
  }

  charts.forEach((chart, i) => {
    if (!chartsInTemplate.has(i)) {
      warnings.push(`chart ${i + 1} (${chart.type}) "${snippet(chart.title)}" has no {%chartImage${i + 1}}, it is still loaded and rendered`);
    }
  });

  const pies = charts.flatMap((chart, i) => buildsPies(chart) ? chart.namedQueries.map((_, j) => `${i}_${j}`) : []);
  const unused = pies.filter(pie => !piesInTemplate.has(pie)).length;
  if (unused) warnings.push(`${unused} of the ${pies.length} pie charts that are built are not in the template`);

  return {errors, warnings};
}
