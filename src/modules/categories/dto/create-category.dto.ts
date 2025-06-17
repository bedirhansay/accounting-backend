export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CategoryType)
  type: CategoryType;
}
