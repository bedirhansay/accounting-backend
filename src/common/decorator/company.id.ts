import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCompany = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const companyId = request.companyId;

  if (!companyId) {
    throw new BadRequestException('companyId bulunamadı. Lütfen header’a ekleyin.');
  }

  return companyId;
});
