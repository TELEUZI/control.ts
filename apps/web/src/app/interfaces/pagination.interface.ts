export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
