import { IsString } from 'class-validator';
import { PaginatedDateSearchDTO } from './pagination.dto';

export class IListDTO extends PaginatedDateSearchDTO {
  
  @IsString()
  companyId: string;
}
