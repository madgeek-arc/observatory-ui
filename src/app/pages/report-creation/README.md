# Report Creation

Generates the EOSC/Open Science country-readiness report as a downloadable `.docx` file. The
feature renders a large set of Highcharts (world maps, bar/column charts, pie charts) on-screen,
converts each rendered chart to a PNG image, and injects those images plus computed trend text
into a `.docx` template using `docxtemplater`.

Files:

- `report-creation.component.ts` / `.html` — page component. Loads chart data, computes
  trend series/stats, renders charts, and triggers the export.
- `report-chart.configuration.ts` — static declarative config: the list of charts shown on the
  page (title, survey question IDs to query, chart `type`, and which stats to compute).
- `../services/report-creation.service.ts` — **`ReportCreationService`**, documented below.
  Framework-agnostic: knows nothing about Highcharts or the chart config, only about images,
  a `.docx` template, and a data map.

## `ReportCreationService`

`src/app/pages/services/report-creation.service.ts` — `@Injectable({ providedIn: 'root' })`.

Two responsibilities:

1. Render an SVG string (e.g. `chart.getSVG()` from Highcharts) to a PNG `ArrayBuffer`.
2. Merge report data (text placeholders) + image buffers into a `.docx` template and save it.

### `templateUrl`

```
assets/docx-templates/report_template.docx
```

The Word template used for every export. It must contain:

- Text placeholders matching keys in `reportData` (e.g. `{Year}`, `{Question6[0]}`), using
  standard `docxtemplater` `{tag}` syntax.
- Image placeholders matching the keys used in `chartImages` / `staticImages`
  (e.g. `{%chartImage1}`, `{%pieChartImage_0_1}`, `{%logoImage}`), using the
  `docxtemplater-image-module` `{%tag}` syntax.

### `svgToArrayBuffer(svgString, width, height): Promise<ArrayBuffer>`

Rasterizes an SVG string to a PNG `ArrayBuffer` via an off-DOM `<canvas>`:

1. Creates a `width × height` canvas and a `crossOrigin = 'anonymous'` `Image`.
2. Wraps `svgString` in a `Blob` (`image/svg+xml`) and loads it into the image via
   `URL.createObjectURL`.
3. On load: fills the canvas with a white background (so transparent chart SVGs don't turn
   black in Word), draws the image, revokes the object URL, then exports the canvas via
   `canvas.toBlob(..., 'image/png')` and reads that blob into an `ArrayBuffer` with
   `FileReader`.
4. Removes the canvas element and resolves with the `ArrayBuffer`.

Rejects if the image fails to load or if `canvas.toBlob` fails to produce a blob. The
`URL.revokeObjectURL` + `canvas.remove()` cleanup exists specifically because this runs in a
loop over dozens of charts per report (see `countAllPieSeries()` / `chartsCfg` in the
component) — without it, blob URLs and detached canvas nodes accumulate across a single export.

Callers are expected to have already produced a *self-contained* SVG string (fonts/styles
inlined, as Highcharts' `getSVG()` does) — this method does not fetch external resources for
the SVG itself.

### `exportDocWithMultipleImages(reportData, chartImages, staticImages?): Promise<void>`

The main entry point. Builds the final `.docx` and triggers a browser download.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `reportData` | `any` (`Record<string, string>` in practice) | Flat map of template tag name → text value, e.g. `{ Year: '2024', 'Question6[0]': 'an increase' }`. Spread directly into the template data. |
| `chartImages` | `{ [key: string]: ChartImageData }` | Pre-rendered chart images. `key` is the template image tag name (no `%`). |
| `staticImages` | `{ [key: string]: { path: string, width: number, height: number } }` (optional) | Images not produced from a chart — fetched by URL instead of already being an `ArrayBuffer`. |

```ts
interface ChartImageData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  title?: string; // informational only, not used in the template
}
```

**Behavior**

1. For each entry in `chartImages`, stash its `buffer` and `[width, height]`.
2. For each entry in `staticImages` (if any), `GET` the file at `path` as an `arraybuffer` via
   `HttpClient` and stash it the same way as a chart image.
3. Merge `reportData` with all image buffers into a single `data` object — image tag names must
   not collide with text tag names.
4. `GET` the `.docx` template from `templateUrl` as an `arraybuffer` and load it into a `PizZip`.
5. Configure `docxtemplater-image-module`'s `ImageModule`:
   - `getImage` returns the raw `ArrayBuffer` for a given tag.
   - `getSize` looks up `[width, height]` from the map built in steps 1–2, falling back to
     `[400, 300]` if a tag has no recorded size.
6. Create a `Docxtemplater`, attach the image module, load the zip, and set
   `{ paragraphLoop: true, linebreaks: true }` (so `\n` in text data renders as a line break,
   and repeated paragraphs work with loop tags if the template uses them).
7. `doc.setData(data)` then `doc.render()` — this is where template tags in the `.docx` are
   substituted; a tag present in the template but missing from `data` will throw here.
8. Generate the output as a `blob` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
   and save it via `file-saver`'s `saveAs(...)` as `report_<ISO-timestamp>.docx`
   (colons stripped, e.g. `report_2026-08-27T10-15-30.docx`).

**Errors**: any failure (network, malformed template, missing/invalid tag, canvas/image
failure upstream) is logged with `console.error('Export error:', err)` and rethrown — callers
must catch it themselves to update UI state. (`ReportCreationComponent.generateReport()` does
this; note that on failure it currently does not reset its own `exporting` flag — see caveat
below.)

### Usage (as done in `ReportCreationComponent.generateReport()`)

```ts
// 1. Render each Highcharts instance to an SVG, then to a PNG buffer
const svg = highchartsInstance.getSVG();
const buffer = await reportService.svgToArrayBuffer(svg, 495, 330);
chartImages['chartImage1'] = { buffer, width: 495, height: 330, title: 'Chart 1' };

// 2. Add any non-chart images the template needs
staticImages['logoImage'] = { path: 'assets/images/2-2.png', width: 200, height: 300 };

// 3. Build reportData text tags (survey year, computed trend phrases, percentages, ...)
reportData['Year'] = '2024';
reportData['Question6[0]'] = 'an increase';

// 4. Export
await reportService.exportDocWithMultipleImages(reportData, chartImages, staticImages);
```

In the component, image tag keys follow two naming conventions the `.docx` template must match:

- `chartImage{n}` — the n-th world-map/bar/column chart, in `chartsCfg` order (1-indexed).
- `pieChartImage_{i}_{j}` — the j-th pie chart belonging to `chartsCfg[i]` (0-indexed on both
  axes).

Text tag keys are the survey `namedQueries` question IDs from `report-chart.configuration.ts`
(e.g. `Question6`), optionally suffixed with `[0]`, `[1]`, ... for multiple trend phrases
derived from the same question, or `_trend`/`_total` for investment charts — see the various
`*Series(...)` methods in `report-creation.component.ts` for exactly which suffixes each chart
`type` writes.

## Packages used

| Package | Version (installed) | License | Role |
|---|---|---|---|
| [`docxtemplater`](https://www.npmjs.com/package/docxtemplater) | `~3.1.0` (resolved `3.1.12`) | Dual **MIT / GPLv3** | Core `.docx` templating engine — loads the template zip, substitutes `{tag}` text, runs `doc.render()`. |
| [`docxtemplater-image-module`](https://www.npmjs.com/package/docxtemplater-image-module) | `3.1.0` | **MIT** | Adds `{%tag}` image-placeholder support to `docxtemplater` (`ImageModule`, `getImage`/`getSize` hooks). |
| [`pizzip`](https://www.npmjs.com/package/pizzip) | `^3.2.0` | Dual **MIT / GPL-3.0** | Reads/writes the `.docx` file as a zip (`.docx` is a zip of XML parts); required by `docxtemplater`. |
| [`file-saver`](https://www.npmjs.com/package/file-saver) | `^2.0.5` | **MIT** | Triggers the browser "Save As" download of the generated blob (`saveAs(...)`). |
| `xmldom` | `^0.1.27` (resolved `0.1.31`) | LGPL-2.0 / MIT | Transitive dependency of `docxtemplater`/`docxtemplater-image-module` for XML parsing — not used directly by this service. |

All of the above are fully free/open-source at the versions pinned here — nothing in this
feature depends on a paid license today.

### Why this matters: `docxtemplater`'s licensing model changed after these versions

Since roughly 2019, the upstream `docxtemplater` project moved to a **freemium** model that
*newer* versions (and this project does **not** use) are subject to:

- The **core** stays free and open-source (MIT/GPLv3): basic `{tag}` substitution, conditions,
  loops, and `.docx`/`.pptx` support.
- Everything beyond that — including **image insertion**, HTML rendering, charts, advanced
  table/styling, sub-templates, footnotes, and run-level formatting — was split out into
  separate **paid modules**, sold on [docxtemplater.com](https://docxtemplater.com/pricing/) at
  roughly €500+/year per module, a PRO plan (~€1,250/yr for 4 modules), or an ENTERPRISE plan
  (~€3,000/yr, all modules) — reportedly with a limited number of deployment "instances" per
  license.
- The specific `docxtemplater-image-module` version pinned in this project (`3.1.0`) predates
  that split and is now marked **deprecated with no further releases planned**; the actively
  maintained image module for current `docxtemplater` versions is the paid one at
  [docxtemplater.com/modules/image](https://docxtemplater.com/modules/image/). Community-maintained
  free forks exist (`docxtemplater-image-module-free`, and `docxtemplater-image`), but none of
  them are what's installed here.

**Practical consequences for this codebase:**

- This feature currently works with **zero licensing cost**, but that's only true because it's
  pinned to the old, pre-split major version line. Bumping `docxtemplater` to a modern version
  (`3.3x`+) without also budgeting for the paid Image Module (or migrating to one of the free
  forks above) will likely break image rendering in the report.
- The pinned image module receives **no further bug fixes or security patches**. `xmldom
  0.1.x` in particular is an old, unmaintained XML parser with known historical vulnerabilities
  in that line — worth flagging in a dependency/security audit even though it's several levels
  removed from this service's own code.
- The old free module has **no native SVG support** — only raster formats via a raw buffer.
  That's the direct reason `ReportCreationService.svgToArrayBuffer()` exists in the first place:
  Highcharts produces SVG, so this service rasterizes it to PNG client-side via `<canvas>`
  *before* handing the buffer to `docxtemplater-image-module`. The modern paid Image Module
  supports SVG natively (with its own PNG fallback), so that conversion step could be dropped
  only if the project migrates to it.
- Other free-tier gaps that would matter if the report template grows more complex: no native
  chart generation (this is why charts are rendered client-side via Highcharts and inserted as
  static images rather than as native editable Word charts), no HTML-formatted text tags, and
  no advanced table generation — all "loop over rows into a table" style features here are done
  by pre-formatting `reportData` strings, not by a table module.

## Planned migration: first-party image module (not yet implemented)

We evaluated dropping `docxtemplater` entirely in favor of a minimal custom `.docx` writer, to
fully remove the licensing/maintenance risk described above. **Rejected**: Word frequently splits 
a single {tag} across multiple `<w:r>` runs when the template gets hand-edited (spell-check, formatting 
changes), so a naive regex over the raw XML will silently miss tags — that run-merging is basically 
the one hard problem `docxtemplater`'s free core solves today, and a minimal replacement needs a small 
version of it (or a "don't re-touch tag text after typing it" rule for whoever maintains 
report_template.docx). Reimplementing it isn't worth the risk.

**Decided instead**: a hybrid migration — keep `docxtemplater` core as-is (it isn't the
deprecated part; only `docxtemplater-image-module` is), and replace *only* the image module with
a small first-party one plugged into docxtemplater's own module API (`optionsTransformer`,
`set`, `parse`, `postparse`, `render`). We also confirmed this project's already-installed,
free `docxtemplater` version supports table-row loops (`{-w:tr items}...{/items}`) out of the
box, so a future table feature needs no new library either — see the "Table capability" note in
the prompt file below.

**Advantages of doing this:**
- Removes the one dependency that's actually abandoned upstream (no further
  `docxtemplater-image-module` releases planned), without touching the dependency that's still
  fine (`docxtemplater` core, dual MIT/GPLv3, and correctly handles the run-splitting problem
  above).
- Small, well-scoped surface area: the replaced module is ~330 lines across three files
  (`index.js`/`imgManager.js`/`templates.js` in the old package), all mechanical OOXML
  boilerplate (build a `<w:drawing>` element, register a zip relationship, write image bytes) —
  not a rewrite of the hard parsing/run-merging logic, which stays inside `docxtemplater` and is
  reused via its exported `DocUtils.traits.expandToOne`.
- Closes off future paid-tier risk entirely: since core `docxtemplater` stays free and table rows
  are handled by its free loop syntax, there's no remaining reason this feature would ever need a
  paid module.

**Risks / things that make this non-trivial:**
- `render()` in docxtemplater's module contract is called for *every* part in the document, not
  just image tags — an incorrect gating check in the new module could silently corrupt plain
  text-tag rendering everywhere else in the report, not just break images. Needs an explicit
  regression test, not just visual spot-checking.
- One helper the old module relies on (`convertPixelsToEmus`) is not actually exported by
  `docxtemplater`'s `DocUtils` — it's monkey-patched onto the shared singleton as a side effect of
  importing a different file in the old package. The new module has to define this locally rather
  than assuming it's inherited "for free," which is an easy detail to miss when porting.
- Not every image tag is guaranteed to sit in a single, un-split XML run either (we found one
  real counter-example, `{%pieChartImage_15_1}`, split across two runs) — so the new module must
  go through the same run-merging path as text tags, it can't take a shortcut assuming image tags
  are always simple.
- `xmldom` element creation needs an explicit `namespaceURI = null` reset after `createElement`,
  or the generated relationship/content-type XML can come out malformed and Word may refuse to
  open the file — a subtle, easy-to-drop line when reimplementing.


### Caveats / things to know before changing this

- **Template coupling is implicit.** There's no compile-time or runtime check that
  `report_template.docx` contains a tag for every key in `reportData`/`chartImages`, or that it
  doesn't reference a tag that's never populated. Adding/renaming/removing an entry in
  `chartsCfg` or a `reportData[...]` key in the component must be mirrored in the template by
  hand, and vice versa.
- **`getSize` fallback is silent.** A missing image key falls back to `[400, 300]` rather than
  throwing, which can silently distort an image's aspect ratio in the output document instead
  of surfacing a clear error.
- **Not idempotent per instance, but stateless across calls.** The service itself holds no
  mutable state between calls (all state — `chartImages`, `staticImages`, `reportData` — lives
  on the component), so `exportDocWithMultipleImages` can be called repeatedly without needing
  to reset the service.
- **`svgToArrayBuffer` requires DOM/canvas APIs** (`document.createElement('canvas')`, `Image`,
  `URL.createObjectURL`) — browser-only, not SSR/Node-safe.
