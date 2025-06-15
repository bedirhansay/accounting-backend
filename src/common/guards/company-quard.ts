import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'];

    if (!companyId) {
      throw new BadRequestException('Firma seçimi zorunludur');
    }

    request.companyId = companyId;
    return true;
  }
}
