export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  module: string;
  type: string;
  route: string;
  score: number;
}

export interface SearchResponseData {
  query: string;
  totalCount: number;
  categorized: Record<string, SearchResultItem[]>;
  flattened: SearchResultItem[];
}
