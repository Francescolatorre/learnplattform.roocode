export interface IPaginatedResponse<T> {
  count: number;
  next: string | null; // Nullable URI for the next page
  previous: string | null; // Nullable URI for the previous page
  results: T[]; // Array of results of type T
}
