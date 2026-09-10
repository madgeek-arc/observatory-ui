export const ACCESS_TYPE_LABELS: Record<string, string> = {
  OA_WITH_LICENSE: 'Open Access with licence',
  OA_WITHOUT_LICENSE: 'Open Access without licence',
  EMBARGOED: 'Embargo',
  RESTRICTED: 'Restricted',
  CLOSED: 'Closed Access',
};
export const ACCESS_TYPES = Object.keys(ACCESS_TYPE_LABELS);

export const CLASSIFICATION_LABELS: Record<string, string> = {
  'Article': 'Article',
  'Conference object': 'Conference',
  'Part of book or chapter of book': 'Book chapter',
  'Book': 'Book',
};
export const CLASSIFICATIONS = Object.keys(CLASSIFICATION_LABELS);
