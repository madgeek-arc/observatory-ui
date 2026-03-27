export interface NewsResponse {
  total: number;
  from: number;
  to: number;
  results: NewsWrapped[];
}

export interface NewsWrapped {
  score: number | null;
  result: NewsItem;
  highlights: any[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string | null;
  image: string | null;
  publishDate: string;
  expiryDate: string;
  stakeholderId: string;
  active: boolean;
  status: string;
  metadata: {
    creationDate: string;
    createdBy: string;
    modificationDate: string;
    modifiedBy: string;
  };
}

export interface NewsItemRequest {
  title: string;
  description: string;
  url: string;
  image: string;
  publishDate: string;
  expiryDate: string;
}
