#!/usr/bin/env node
// Checks that every {tag} of the Word template is one the report component fills in.
//
//   npm run docx:tags:check                 check src/assets/docx-templates/report_template.docx
//   node scripts/check-docx-tags.mjs [path/to/file.docx]
//
// Exit codes: 0 no errors (warnings are allowed), 1 the template has tags without data, 2 it could not be read.

import {basename, resolve} from 'node:path';
import {loadReportConfig} from './lib/report-config.mjs';
import {checkTemplateTags, readTemplateTags, TemplateTagsError} from './lib/template-tags.mjs';

const DEFAULT_FILE = 'src/assets/docx-templates/report_template.docx';

const file = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? DEFAULT_FILE);

let tags;
try {
  tags = readTemplateTags(file);
} catch (error) {
  console.error(`Cannot read the tags of ${file}:`);
  // a missing file or something that is not a zip, as opposed to tags the export cannot fill
  (error instanceof TemplateTagsError ? error.problems : [error.message]).forEach(problem => console.error(`  - ${problem}`));
  process.exit(2);
}

const {errors, warnings} = checkTemplateTags(tags, await loadReportConfig());

const distinct = new Set(tags);
const images = [...distinct].filter(tag => tag.startsWith('%')).length;
console.log(`${basename(file)}: ${distinct.size - images} text tags, ${images} image tags`);
warnings.forEach(warning => console.log(`  warning: ${warning}`));
errors.forEach(error => console.log(`  error: ${error}`));

if (errors.length) {
  console.log(`  ${errors.length} tags would not be filled in; fix the template or report-chart.configuration.ts`);
  process.exit(1);
}
console.log('  every tag is filled in by the report');
