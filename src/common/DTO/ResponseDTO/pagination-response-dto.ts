// dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
