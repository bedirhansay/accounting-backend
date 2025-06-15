export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateCategoryDto {
  name: string;
  description?: string;
  type: CategoryType;
  companyId: string;
}
