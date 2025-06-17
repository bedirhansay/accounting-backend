// dto/standard-response.dto.ts
export class StandardResponseDto<T> {
  success: boolean;
  message?: string;
  data: T;
}
