import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyDocument } from '../../modules/companies/company.schema';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    @InjectModel('Company')
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'];

    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      throw new BadRequestException('Geçerli bir firma ID (x-company-id) gönderilmelidir');
    }

    const exists = await this.companyModel.exists({ _id: companyId });
    if (!exists) {
      throw new NotFoundException('Belirtilen firma bulunamadı');
    }

    request.companyId = companyId;
    return true;
  }
}
