// dto/error-response.dto.ts
export class ErrorResponseDto {
  success: false;
  statusCode: number;
  message: string;
  errors?: {
    field?: string;
    message: string;
  }[];
}
