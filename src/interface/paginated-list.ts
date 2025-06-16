export class PaginatedListDTO {
  page: number;
  pageSize: number;
  search?: string;
  beginDate?: string;
  endDate?: string;
}
