import { IsString } from 'class-validator';

export class FindByIdDto {
  @IsString()
  id: string;

  @IsString()
  companyId: string;
}
