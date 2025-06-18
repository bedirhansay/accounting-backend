import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDTO {
  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
