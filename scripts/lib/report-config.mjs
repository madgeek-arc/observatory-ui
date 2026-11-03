// Loads what the report template is checked against from report-chart.configuration.ts. Node strips the types of
// the .ts file itself, which works because the file has no imports and only uses syntax that is erased as is.

const CONFIG = new URL('../../src/app/pages/report-creation/report-chart.configuration.ts', import.meta.url);

// Node warns that package.json has no "type" field when it has to decide how to read the .ts file; it is only noise
function withoutModuleTypeWarning(action) {
  const emitWarning = process.emitWarning;
  process.emitWarning = (warning, ...args) => {
    const code = typeof args[0] === 'object' ? args[0]?.code : args[1];
    if (code !== 'MODULE_TYPELESS_PACKAGE_JSON') emitWarning.call(process, warning, ...args);
  };
  return action().finally(() => {
    process.emitWarning = emitWarning;
  });
}

export async function loadReportConfig() {
  let config;
  try {
    config = await withoutModuleTypeWarning(() => import(CONFIG.href));
  } catch (error) {
    if (error.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
      throw new Error(`Node ${process.version} cannot import ${CONFIG.pathname}; Node 22.18 or newer strips the types itself`);
    }
    throw error;
  }
  return {
    charts: config.chartsCfg,
    reportKeys: config.reportKeys,
    buildsPies: config.buildsPies,
    globalKeys: config.reportGlobalKeys,
    staticImageKeys: config.staticImageKeys,
  };
}
