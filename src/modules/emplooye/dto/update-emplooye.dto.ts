import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-emplooye.dto';

export class UpdateEmplooyeDto extends PartialType(CreateEmployeeDto) {}
