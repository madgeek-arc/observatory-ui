/**
 * Ground-truth catalog of every toggleable "card" across the 10 Country Pages sections.
 *
 * The catalog is country-agnostic: the same ids/labels/format/group apply to every
 * country. Only the `visible` flag changes per scope (per-country override), which is
 * why this constant seeds everything as visible and the real value is layered on top
 * from the override endpoint at runtime (see CountryPageIndicatorsService).
 *
 * `id` is globally unique and sequential across all sections, in the order the sections
 * appear in the sidebar (CountryPagesComponent.initMenuItems). `group` matches those exact
 * section labels. `label` is an admin-facing description of the card (not the public title).
 */

export type IndicatorFormat = 'percentage' | 'number' | 'chart' | 'text';

export interface IndicatorConfig {
  id: string;
  label: string;
  visible: boolean;
  format: IndicatorFormat;
  group: string;
}

export const COUNTRY_PAGE_INDICATORS: IndicatorConfig[] = [
  { id: '1',  label: 'OA Publications (OA vs Closed)',                                       visible: true, format: 'percentage', group: 'General R&D Overview' },
  { id: '2',  label: 'Open Data (OA vs Closed)',                                             visible: true, format: 'percentage', group: 'General R&D Overview' },
  { id: '3',  label: 'Total investment in EOSC and Open Science',                            visible: true, format: 'number',     group: 'General R&D Overview' },
  { id: '4',  label: 'Number of Open Software sets published',                              visible: true, format: 'number',     group: 'General R&D Overview' },
  { id: '5',  label: 'R&D Information (funding & performing organisations)',                 visible: true, format: 'number',     group: 'General R&D Overview' },
  { id: '6',  label: 'Latest News',                                                          visible: true, format: 'text',       group: 'General R&D Overview' },
  { id: '7',  label: 'Learn more about Open Science Key Actors',                             visible: true, format: 'text',       group: 'General R&D Overview' },
  { id: '8',  label: 'Learn more about Open Science Initiatives',                            visible: true, format: 'text',       group: 'General R&D Overview' },
  { id: '9',  label: 'Monitoring Infrastructure',                                            visible: true, format: 'text',       group: 'General R&D Overview' },
  { id: '10', label: 'Links to European and Global Infrastructures',                         visible: true, format: 'text',       group: 'General R&D Overview' },
  { id: '11', label: 'Authentication and Authorization Infrastructure (AAI) and AARC',       visible: true, format: 'text',       group: 'General R&D Overview' },
  { id: '12', label: 'Cloud Services',                                                       visible: true, format: 'text',       group: 'General R&D Overview' },

  { id: '13', label: 'National Policy / Financial Strategy Status by OS Area',               visible: true, format: 'text',       group: 'Policy overview' },
  { id: '14', label: 'Policy Landscape',                                                     visible: true, format: 'text',       group: 'Policy overview' },
  { id: '15', label: 'Dive Deeper into Open Science Policies, Strategies and Documents',     visible: true, format: 'text',       group: 'Policy overview' },

  { id: '16', label: 'OA Publications (OA vs Closed)',                                        visible: true, format: 'percentage', group: 'Open Access Publications' },
  { id: '17', label: 'RFOs with Policy on OA Publication',                                    visible: true, format: 'percentage', group: 'Open Access Publications' },
  { id: '18', label: 'RPOs with Policy on OA Publication',                                    visible: true, format: 'percentage', group: 'Open Access Publications' },
  { id: '19', label: 'Financial Investments in OA Publications',                              visible: true, format: 'number',     group: 'Open Access Publications' },
  { id: '20', label: 'National Policy / Financial Strategy / Monitoring on Open Access',      visible: true, format: 'text',       group: 'Open Access Publications' },
  { id: '21', label: 'Open Access Landscape',                                                 visible: true, format: 'text',       group: 'Open Access Publications' },
  { id: '22', label: 'Trend of Access to Publications',                                       visible: true, format: 'chart',      group: 'Open Access Publications' },
  { id: '23', label: 'Distribution of Open Access Types by Publication Outputs',              visible: true, format: 'chart',      group: 'Open Access Publications' },
  { id: '24', label: 'Distribution of Publications Access by Fields of Science',              visible: true, format: 'chart',      group: 'Open Access Publications' },

  { id: '25', label: 'Open Data (OA vs Closed)',                                              visible: true, format: 'percentage', group: 'Open Data' },
  { id: '26', label: 'RFOs with Policy on Open Data',                                         visible: true, format: 'percentage', group: 'Open Data' },
  { id: '27', label: 'Financial investments in Open Data',                                    visible: true, format: 'number',     group: 'Open Data' },
  { id: '28', label: 'RPOs with Policy on Open Data',                                         visible: true, format: 'percentage', group: 'Open Data' },
  { id: '29', label: 'National Policy / Financial Strategy / Monitoring on Open Data',        visible: true, format: 'text',       group: 'Open Data' },
  { id: '30', label: 'Learn more about Open Data Landscape',                                  visible: true, format: 'text',       group: 'Open Data' },
  { id: '31', label: 'Trend of Open Data',                                                    visible: true, format: 'chart',      group: 'Open Data' },
  { id: '32', label: 'Distribution of Open Data Types by Document Type',                      visible: true, format: 'chart',      group: 'Open Data' },

  { id: '33', label: "RFO's Policy on FAIR Data",                                             visible: true, format: 'percentage', group: 'FAIR Data' },
  { id: '34', label: "RPO's Policy on FAIR Data",                                             visible: true, format: 'percentage', group: 'FAIR Data' },
  { id: '35', label: 'Total financial investment in FAIR Data',                               visible: true, format: 'number',     group: 'FAIR Data' },
  { id: '36', label: 'National Policy / Financial Strategy / Monitoring on FAIR Data',        visible: true, format: 'text',       group: 'FAIR Data' },
  { id: '37', label: 'Learn more about FAIR Data Landscape',                                  visible: true, format: 'text',       group: 'FAIR Data' },
  { id: '38', label: 'Trend of Policies on FAIR Data among RPOs',                             visible: true, format: 'chart',      group: 'FAIR Data' },
  { id: '39', label: 'Trend of Policies on FAIR Data among RFOs',                             visible: true, format: 'chart',      group: 'FAIR Data' },

  { id: '40', label: "RFO's Policy on Data Management",                                       visible: true, format: 'percentage', group: 'Data Management' },
  { id: '41', label: "RPO's Policy on Data Management",                                       visible: true, format: 'percentage', group: 'Data Management' },
  { id: '42', label: 'Total financial investments in Data Management',                        visible: true, format: 'number',     group: 'Data Management' },
  { id: '43', label: 'National Policy / Financial Strategy / Monitoring on Data Management',  visible: true, format: 'text',       group: 'Data Management' },
  { id: '44', label: 'Learn More about National Data Service',                               visible: true, format: 'text',       group: 'Data Management' },
  { id: '45', label: 'Trend of Policies on Data Management among RPOs',                       visible: true, format: 'chart',      group: 'Data Management' },
  { id: '46', label: 'Trend of Policies on Data Management among RFOs',                       visible: true, format: 'chart',      group: 'Data Management' },

  { id: '47', label: 'Total financial investments in Citizen Science',                        visible: true, format: 'number',     group: 'Citizen Science' },
  { id: '48', label: 'National Policy / Financial Strategy / Monitoring on Citizen Science',  visible: true, format: 'text',       group: 'Citizen Science' },
  { id: '49', label: 'Learn more about Citizen Science Landscape',                            visible: true, format: 'text',       group: 'Citizen Science' },

  { id: '50', label: 'Percentage of Open Repositories',                                       visible: true, format: 'percentage', group: 'Repositories' },
  { id: '51', label: "RFO's Policy on Repositories",                                          visible: true, format: 'percentage', group: 'Repositories' },
  { id: '52', label: 'Total financial investment in repositories',                            visible: true, format: 'number',     group: 'Repositories' },
  { id: '53', label: "RPO's Policy in Repositories",                                          visible: true, format: 'percentage', group: 'Repositories' },
  { id: '54', label: 'National Repository Policy / Financial Strategy / Monitoring',          visible: true, format: 'text',       group: 'Repositories' },
  { id: '55', label: 'Learn more about Repositories Landscape',                               visible: true, format: 'text',       group: 'Repositories' },

  { id: '56', label: "RFO's Policy on Open Science Training",                                 visible: true, format: 'percentage', group: 'Open Science Training' },
  { id: '57', label: 'Total financial investment in Open Science Training',                   visible: true, format: 'number',     group: 'Open Science Training' },
  { id: '58', label: "RPO's Policy on Open Science Training",                                 visible: true, format: 'percentage', group: 'Open Science Training' },
  { id: '59', label: 'National Open Science Training Policy / Financial Strategy / Monitoring',visible: true, format: 'text',       group: 'Open Science Training' },
  { id: '60', label: 'Learn more about Open Science Training',                                visible: true, format: 'text',       group: 'Open Science Training' },
  { id: '61', label: 'Helpdesk and Support',                                                  visible: true, format: 'text',       group: 'Open Science Training' },

  { id: '62', label: "RFO's Policy on Open Software",                                         visible: true, format: 'percentage', group: 'Open Software' },
  { id: '63', label: 'Total financial investment in Open Software',                           visible: true, format: 'number',     group: 'Open Software' },
  { id: '64', label: "RPO's Policy on Open Software",                                         visible: true, format: 'percentage', group: 'Open Software' },
  { id: '65', label: 'National Open Software Policy / Financial Strategy / Monitoring',       visible: true, format: 'text',       group: 'Open Software' },
  { id: '66', label: 'Learn more about Open Software Landscape',                              visible: true, format: 'text',       group: 'Open Software' },
];

/** Convenience lookup: catalog entries grouped by their section label. */
export function indicatorsByGroup(group: string): IndicatorConfig[] {
  return COUNTRY_PAGE_INDICATORS.filter(i => i.group === group);
}
