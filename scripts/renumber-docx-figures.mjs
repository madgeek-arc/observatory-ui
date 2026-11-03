#!/usr/bin/env node
// Renumbers the figure captions of a Word template in document order and updates the references to them.
//
//   npm run docx:figures                 rewrite src/assets/docx-templates/report_template.docx in place
//   npm run docx:figures:check           report gaps and bad references, write nothing (exit 1 if a rewrite is needed)
//   node scripts/renumber-docx-figures.mjs [--check] [path/to/file.docx]

import {renameSync, writeFileSync, readFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';
import PizZip from 'pizzip';
import {FigureNumberingError, renumberFigures} from './lib/figure-numbering.mjs';

const DEFAULT_FILE = 'src/assets/docx-templates/report_template.docx';
const PART = 'word/document.xml';

const args = process.argv.slice(2);
const check = args.includes('--check');
const file = resolve(args.find(arg => !arg.startsWith('--')) ?? DEFAULT_FILE);

const zip = new PizZip(readFileSync(file));
const document = zip.file(PART);
if (!document) {
  console.error(`${file} has no ${PART}; is it a .docx?`);
  process.exit(2);
}

let result;
try {
  result = renumberFigures(document.asText());
} catch (error) {
  if (!(error instanceof FigureNumberingError)) throw error;
  console.error(`Cannot renumber ${file}:`);
  error.problems.forEach(problem => console.error(`  - ${problem}`));
  process.exit(2);
}

const label = basename(file);
console.log(`${label}: ${result.captions} figure captions, ${result.references} references`);
if (result.gaps.length) console.log(`  gaps: ${result.gaps.join(', ')}`);
if (result.renumbered.length) console.log(`  renumbering: ${result.renumbered.join(', ')}`);
result.warnings.forEach(warning => console.log(`  warning: ${warning}`));

if (!result.changed) {
  console.log('  numbering is already contiguous, nothing to do');
  process.exit(0);
}

if (check) {
  console.log(`  ${result.referencesRewritten} references would be updated; run "npm run docx:figures" to fix`);
  process.exit(1);
}

zip.file(PART, result.xml);
const temporary = `${file}.tmp`;
writeFileSync(temporary, zip.generate({type: 'nodebuffer', compression: 'DEFLATE'}));
renameSync(temporary, file);
console.log(`  rewrote ${result.referencesRewritten} references and renumbered the captions in ${label}`);
