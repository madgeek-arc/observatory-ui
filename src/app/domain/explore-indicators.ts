export type IndicatorKind = 'indicator' | 'trend' | 'map' | 'policy';
export type IndicatorFormat = 'percentage' | 'number' | 'currency' | 'category' | 'yes-no';

export interface ExploreIndicatorConfig {
  id: string;
  label: string;
  group: string;
  kind: IndicatorKind;
  format: IndicatorFormat;
  source: string;
  hasAverage: boolean;
}

export const EXPLORE_INDICATORS: ExploreIndicatorConfig[] = [
  // ---- Open Access Publications ------------------------------------------------------
  { id: 'oa-1',  label: 'OA Publication in Europe (OA vs Closed)',                    group: 'Open Access Publications', kind: 'indicator', format: 'percentage', source: 'oso-stats',    hasAverage: true },
  { id: 'oa-2',  label: 'Trend of Open Access Publications',                          group: 'Open Access Publications', kind: 'trend',      format: 'percentage', source: 'oso-stats',    hasAverage: true },
  { id: 'oa-3',  label: 'EU Countries with Policy on OA Publication',                 group: 'Open Access Publications', kind: 'indicator',  format: 'percentage', source: 'Question6',    hasAverage: false },
  { id: 'oa-4',  label: 'National Policy on Open Access Publications',                group: 'Open Access Publications', kind: 'map',        format: 'category',   source: 'Question6',    hasAverage: false },
  { id: 'oa-5',  label: 'EU Countries with National OA Publication Monitoring Initiatives', group: 'Open Access Publications', kind: 'indicator', format: 'percentage', source: 'Question54', hasAverage: false },
  { id: 'oa-6',  label: 'National Monitoring on Open Access Publications',            group: 'Open Access Publications', kind: 'map',        format: 'yes-no',     source: 'Question54',   hasAverage: false },
  { id: 'oa-7',  label: 'EU Countries with Financial Strategy on OA Publication',     group: 'Open Access Publications', kind: 'indicator',  format: 'percentage', source: 'Question7',    hasAverage: false },
  { id: 'oa-8',  label: 'National Financial Strategy on Open Access Publications',    group: 'Open Access Publications', kind: 'map',        format: 'yes-no',     source: 'Question7',    hasAverage: false },
  { id: 'oa-9',  label: 'EU countries with Policy on Immediate OA Publications',      group: 'Open Access Publications', kind: 'indicator',  format: 'percentage', source: 'Question6.3',  hasAverage: false },
  { id: 'oa-10', label: 'Financial investments in OA Publication',                    group: 'Open Access Publications', kind: 'indicator',  format: 'currency',   source: 'Question56',   hasAverage: true },

  // ---- Open Data ------------------------------------------------------------------------
  { id: 'od-1', label: 'Open Data in Europe (Open vs Closed)',                        group: 'Open Data', kind: 'indicator', format: 'percentage', source: 'oso-stats',  hasAverage: true },
  { id: 'od-2', label: 'Trend of Open Data',                                          group: 'Open Data', kind: 'trend',     format: 'percentage', source: 'oso-stats',  hasAverage: true },
  { id: 'od-3', label: 'EU Countries with Policy on Open Data',                       group: 'Open Data', kind: 'indicator', format: 'percentage', source: 'Question18', hasAverage: false },
  { id: 'od-4', label: 'National Policy on Open Data',                                group: 'Open Data', kind: 'map',       format: 'category',   source: 'Question18', hasAverage: false },
  { id: 'od-5', label: 'EU Countries with National Open Data Monitoring Initiatives', group: 'Open Data', kind: 'indicator', format: 'percentage', source: 'Question66', hasAverage: false },
  { id: 'od-6', label: 'National Monitoring on Open Data',                            group: 'Open Data', kind: 'map',       format: 'yes-no',     source: 'Question66', hasAverage: false },
  { id: 'od-7', label: 'EU Countries with Financial Strategy on Open Data',           group: 'Open Data', kind: 'indicator', format: 'percentage', source: 'Question19', hasAverage: false },
  { id: 'od-8', label: 'National Financial Strategy on Open Data',                    group: 'Open Data', kind: 'map',       format: 'yes-no',     source: 'Question19', hasAverage: false },
  { id: 'od-9', label: 'Financial investments in Open Data',                          group: 'Open Data', kind: 'indicator', format: 'currency',   source: 'Question68', hasAverage: true },

  // ---- FAIR Data --------------------------------------------------------------------------
  { id: 'fair-1', label: 'EU Countries with Policy on FAIR Data',                     group: 'FAIR Data', kind: 'indicator', format: 'percentage', source: 'Question14', hasAverage: false },
  { id: 'fair-2', label: 'National Policy on FAIR Data',                              group: 'FAIR Data', kind: 'map',       format: 'category',   source: 'Question14', hasAverage: false },
  { id: 'fair-3', label: 'EU Countries with National FAIR Data Monitoring Initiatives', group: 'FAIR Data', kind: 'indicator', format: 'percentage', source: 'Question62', hasAverage: false },
  { id: 'fair-4', label: 'National Monitoring on FAIR Data',                          group: 'FAIR Data', kind: 'map',       format: 'yes-no',     source: 'Question62', hasAverage: false },
  { id: 'fair-5', label: 'EU Countries with Financial Strategy on FAIR Data',         group: 'FAIR Data', kind: 'indicator', format: 'percentage', source: 'Question15', hasAverage: false },
  { id: 'fair-6', label: 'National Financial Strategy on FAIR Data',                  group: 'FAIR Data', kind: 'map',       format: 'yes-no',     source: 'Question15', hasAverage: false },
  { id: 'fair-7', label: 'Financial investments in FAIR Data',                        group: 'FAIR Data', kind: 'indicator', format: 'currency',   source: 'Question64', hasAverage: true },

  // ---- Data Management --------------------------------------------------------------------
  { id: 'dm-1', label: 'EU Countries with Policy on Data Management',                 group: 'Data Management', kind: 'indicator', format: 'percentage', source: 'Question10', hasAverage: false },
  { id: 'dm-2', label: 'National Policy on Data Management',                          group: 'Data Management', kind: 'map',       format: 'category',   source: 'Question10', hasAverage: false },
  { id: 'dm-3', label: 'EU Countries with National Data Management Monitoring Initiatives', group: 'Data Management', kind: 'indicator', format: 'percentage', source: 'Question58', hasAverage: false },
  { id: 'dm-4', label: 'National Monitoring on Data Management',                      group: 'Data Management', kind: 'map',       format: 'yes-no',     source: 'Question58', hasAverage: false },
  { id: 'dm-5', label: 'EU Countries with Financial Strategy on Data Management',     group: 'Data Management', kind: 'indicator', format: 'percentage', source: 'Question11', hasAverage: false },
  { id: 'dm-6', label: 'National Financial Strategy on Data Management',              group: 'Data Management', kind: 'map',       format: 'yes-no',     source: 'Question11', hasAverage: false },
  { id: 'dm-7', label: 'Financial investments in Data Management',                    group: 'Data Management', kind: 'indicator', format: 'currency',   source: 'Question60', hasAverage: true },

  // ---- Citizen Science ---------------------------------------------------------------------
  { id: 'cs-1', label: 'New Citizen Science projects in EU Countries',                group: 'Citizen Science', kind: 'indicator', format: 'number',     source: 'Question101', hasAverage: true },
  { id: 'cs-2', label: 'EU Countries with Policy on Citizen Science',                 group: 'Citizen Science', kind: 'indicator', format: 'percentage', source: 'Question50',  hasAverage: false },
  { id: 'cs-3', label: 'National Policy on Citizen Science',                          group: 'Citizen Science', kind: 'map',       format: 'category',   source: 'Question50',  hasAverage: false },
  { id: 'cs-4', label: 'EU Countries with Citizen Science Monitoring Initiatives',    group: 'Citizen Science', kind: 'indicator', format: 'percentage', source: 'Question98',  hasAverage: false },
  { id: 'cs-5', label: 'National Monitoring on Citizen Science',                      group: 'Citizen Science', kind: 'map',       format: 'yes-no',     source: 'Question98',  hasAverage: false },
  { id: 'cs-6', label: 'EU Countries with Financial Strategy on Citizen Science',     group: 'Citizen Science', kind: 'indicator', format: 'percentage', source: 'Question51',  hasAverage: false },
  { id: 'cs-7', label: 'National Financial Strategy on Citizen Science',              group: 'Citizen Science', kind: 'map',       format: 'yes-no',     source: 'Question51',  hasAverage: false },
  { id: 'cs-8', label: 'Financial investments in Citizen Science',                    group: 'Citizen Science', kind: 'indicator', format: 'currency',   source: 'Question100', hasAverage: true },

  // ---- Repositories (covers both Connecting Repositories to EOSC and Long-term Data
  //      Preservation — the real page has both sub-topics under one "Repositories" area) ---
  { id: 'repo-1',  label: 'Repositories offering long-term preservation in EU Countries', group: 'Repositories', kind: 'indicator', format: 'number',     source: 'Question89', hasAverage: true },
  { id: 'repo-2',  label: 'EU Countries with Policy on Connecting Repositories to EOSC',  group: 'Repositories', kind: 'indicator', format: 'percentage', source: 'Question30', hasAverage: false },
  { id: 'repo-3',  label: 'National Policy on Connecting Repositories to EOSC',           group: 'Repositories', kind: 'map',       format: 'category',   source: 'Question30', hasAverage: false },
  { id: 'repo-4',  label: 'EU Countries with Monitoring Initiatives on Connecting Repositories to EOSC', group: 'Repositories', kind: 'indicator', format: 'percentage', source: 'Question78', hasAverage: false },
  { id: 'repo-5',  label: 'National Monitoring on Connecting Repositories to EOSC',       group: 'Repositories', kind: 'map',       format: 'yes-no',     source: 'Question78', hasAverage: false },
  { id: 'repo-6',  label: 'EU Countries with Financial Strategy on Connecting Repositories to EOSC', group: 'Repositories', kind: 'indicator', format: 'percentage', source: 'Question31', hasAverage: false },
  { id: 'repo-7',  label: 'National Financial Strategy on Connecting Repositories to EOSC', group: 'Repositories', kind: 'map',     format: 'yes-no',     source: 'Question31', hasAverage: false },
  { id: 'repo-8',  label: 'Financial investments in connecting repositories to EOSC',     group: 'Repositories', kind: 'indicator', format: 'currency',   source: 'Question80', hasAverage: true },
  { id: 'repo-9',  label: 'National Policy on Long-term Data Preservation',               group: 'Repositories', kind: 'map',       format: 'category',   source: 'Question38', hasAverage: false },
  { id: 'repo-10', label: 'National Monitoring on Long-term Data Preservation',           group: 'Repositories', kind: 'map',       format: 'yes-no',     source: 'Question86', hasAverage: false },
  { id: 'repo-11', label: 'National Financial Strategy on Long-term Data Preservation',   group: 'Repositories', kind: 'map',       format: 'yes-no',     source: 'Question39', hasAverage: false },
  { id: 'repo-12', label: 'Financial investments in Long-term Data Preservation',         group: 'Repositories', kind: 'indicator', format: 'currency',   source: 'Question88', hasAverage: true },

  // ---- Open Science Training -----------------------------------------------------------
  { id: 'train-1', label: 'EU Countries with Policy on skills/training for Open Science', group: 'Open Science Training', kind: 'indicator', format: 'percentage', source: 'Question42', hasAverage: false },
  { id: 'train-2', label: 'National Policy on Skills/Training in Open Science',           group: 'Open Science Training', kind: 'map',       format: 'category',   source: 'Question42', hasAverage: false },
  { id: 'train-3', label: 'EU Countries with Monitoring Initiatives on skills/training in Open Science', group: 'Open Science Training', kind: 'indicator', format: 'percentage', source: 'Question90', hasAverage: false },
  { id: 'train-4', label: 'National Monitoring on Skills/Training in Open Science',       group: 'Open Science Training', kind: 'map',       format: 'yes-no',     source: 'Question90', hasAverage: false },
  { id: 'train-5', label: 'EU Countries with Financial Strategy on skills/training in Open Science', group: 'Open Science Training', kind: 'indicator', format: 'percentage', source: 'Question43', hasAverage: false },
  { id: 'train-6', label: 'National Financial Strategy on Skills/Training in Open Science', group: 'Open Science Training', kind: 'map',     format: 'yes-no',     source: 'Question43', hasAverage: false },
  { id: 'train-7', label: 'Financial investments in skills/training for Open Science',    group: 'Open Science Training', kind: 'indicator', format: 'currency',   source: 'Question92', hasAverage: true },

  // ---- Open Software ----------------------------------------------------------------------
  // sw-1 is shown from an OSO-stats query today; a separate Question73 fetch also exists in
  // the component but is never bound in the template (dead code) — flagged during the audit,
  // not yet resolved which source is intended.
  { id: 'sw-1', label: 'Open Software sets published in EU Countries',                group: 'Open Software', kind: 'indicator', format: 'number',     source: 'oso-stats', hasAverage: false },
  { id: 'sw-2', label: 'EU Countries with Policy on Open Software',                   group: 'Open Software', kind: 'indicator', format: 'percentage', source: 'Question22', hasAverage: false },
  { id: 'sw-3', label: 'National Policy on Open Source Software',                     group: 'Open Software', kind: 'map',       format: 'category',   source: 'Question22', hasAverage: false },
  { id: 'sw-4', label: 'EU Countries with Monitoring Initiatives on Open Software',   group: 'Open Software', kind: 'indicator', format: 'percentage', source: 'Question70', hasAverage: false },
  { id: 'sw-5', label: 'National Monitoring on Open Source Software',                 group: 'Open Software', kind: 'map',       format: 'yes-no',     source: 'Question70', hasAverage: false },
  { id: 'sw-6', label: 'EU Countries with Financial Strategy on Open Software',       group: 'Open Software', kind: 'indicator', format: 'percentage', source: 'Question23', hasAverage: false },
  { id: 'sw-7', label: 'National Financial Strategy on Open Software',                group: 'Open Software', kind: 'map',       format: 'yes-no',     source: 'Question23', hasAverage: false },
  { id: 'sw-8', label: 'Financial investments in Open Software',                      group: 'Open Software', kind: 'indicator', format: 'currency',   source: 'Question72', hasAverage: true },

  // ---- Financial Investment (Investments in EOSC page) -------------------------------------
  { id: 'fin-1', label: 'Total amount of investments in EOSC and Open Science',       group: 'Financial Investment', kind: 'indicator', format: 'currency', source: 'Question5', hasAverage: false },
];
