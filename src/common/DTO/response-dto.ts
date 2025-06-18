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

export class StandardResponseDto<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class ErrorResponseDto {
  success: false;
  statusCode: number;
  message: string;
  errors?: {
    field?: string;
    message: string;
  }[];
}
