import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { DateRangeDTO } from '../../common/DTO/request';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { getFinalDateRange } from '../../common/helper/get-date-params';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { FuelDto } from './dto/fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Fuel, FuelDocument } from './fuel.schema';

@Injectable()
export class FuelService {
  constructor(
    @InjectModel(Fuel.name)
    private readonly fuelModel: Model<FuelDocument>
  ) {}

  async create(dto: CreateFuelDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const created = await new this.fuelModel({
      ...dto,
      companyId: new Types.ObjectId(companyId),
      vehicleId: new Types.ObjectId(dto.vehicleId),
    }).save();

    return {
      statusCode: 201,
      id: created.id.toString(),
    };
  }

  async findAll(params: PaginatedDateSearchDTO, companyId: string): Promise<PaginatedResponseDto<FuelDto>> {
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = params;
    const { beginDate: finalBeginDate, endDate: finalEndDate } = getFinalDateRange(beginDate, endDate);

    const filter: any = {
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
        // Araç plakası için lookup kullanıldığından burada eşleşemez, aggregate'e taşımak gerekir
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (finalBeginDate) filter.operationDate.$gte = new Date(finalBeginDate);
      if (finalEndDate) filter.operationDate.$lte = new Date(finalEndDate);
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleId',
        },
      },
      {
        $unwind: {
          path: '$vehicleId',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { description: { $regex: search, $options: 'i' } },
            { invoiceNo: { $regex: search, $options: 'i' } },
            { driverName: { $regex: search, $options: 'i' } },
            { 'vehicleId.plateNumber': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { operationDate: -1 } }, { $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize });

    const [data, totalCountArr] = await Promise.all([
      this.fuelModel.aggregate(pipeline).exec(),
      this.fuelModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicleId',
          },
        },
        {
          $unwind: {
            path: '$vehicleId',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: search
            ? {
                $or: [
                  { description: { $regex: search, $options: 'i' } },
                  { invoiceNo: { $regex: search, $options: 'i' } },
                  { driverName: { $regex: search, $options: 'i' } },
                  { 'vehicleId.plateNumber': { $regex: search, $options: 'i' } },
                ],
              }
            : {},
        },
        { $count: 'count' },
      ]),
    ]);

    const totalCount = totalCountArr[0]?.count || 0;

    const items = plainToInstance(FuelDto, data, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<FuelDto> {
    ensureValidObjectId(id, 'Geçersiz yakıt ID');
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const fuel = await this.fuelModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate({ path: 'vehicleId', select: 'plateNumber' })
      .lean()
      .exec();

    if (!fuel) {
      throw new NotFoundException('Yakıt kaydı bulunamadı');
    }

    return plainToInstance(FuelDto, fuel, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateFuelDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz yakıt ID');
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const updated = await this.fuelModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) },
      {
        ...dto,
        vehicleId: new Types.ObjectId(dto.vehicleId),
      }
    );
    if (!updated) {
      throw new NotFoundException('Güncellenecek yakıt kaydı bulunamadı');
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, 'Geçersiz yakıt ID');
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const deleted = await this.fuelModel
      .findOneAndDelete({
        _id: id,
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!deleted) {
      throw new NotFoundException('Silinecek yakıt kaydı bulunamadı');
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async getFuelsByVehicleId(
    vehicleId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<FuelDto>> {
    ensureValidObjectId(vehicleId, 'Geçersiz araç ID');
    ensureValidObjectId(companyId, 'Geçersiz firma ID');

    const { pageNumber, pageSize, search, beginDate, endDate } = query;
    const { beginDate: finalBeginDate, endDate: finalEndDate } = getFinalDateRange(beginDate, endDate);

    const filter: any = {
      vehicleId: new Types.ObjectId(vehicleId),
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: new RegExp(search, 'i') },
        { invoiceNo: new RegExp(search, 'i') },
        { fuelType: new RegExp(search, 'i') },
      ];
    }

    if (beginDate || endDate) {
      filter.operationDate = {};
      if (finalBeginDate) filter.operationDate.$gte = new Date(finalBeginDate);
      if (finalEndDate) filter.operationDate.$lte = new Date(finalEndDate);
    }

    const totalCount = await this.fuelModel.countDocuments(filter);

    const fuels = await this.fuelModel
      .find(filter)
      .populate({ path: 'vehicleId', select: 'plateNumber' })
      .sort({ operationDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const items = plainToInstance(FuelDto, fuels, {
      excludeExtraneousValues: true,
    });

    return {
      pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber * pageSize < totalCount,
      items,
    };
  }

  async exportMontlyFuelSummary(query: DateRangeDTO, companyId: string, res: Response): Promise<void> {
    const { beginDate, endDate } = query;
    const { beginDate: finalBeginDate, endDate: finalEndDate } = getFinalDateRange(beginDate, endDate);


    const fuels = await this.fuelModel
      .find({
        companyId: new Types.ObjectId(companyId),
        operationDate: { $gte: finalBeginDate, $lte: finalEndDate },
      })
      .populate('vehicleId', 'plateNumber')
      .lean()
      .exec();

    const grouped = fuels.reduce<Record<string, { plateNumber: string; totalRecords: number; totalAmount: number }>>(
      (acc, fuel) => {
        const plateNumber = ((fuel.vehicleId as any)?.plateNumber || 'Bilinmeyen Araç').toUpperCase();

        if (!acc[plateNumber]) {
          acc[plateNumber] = {
            plateNumber,
            totalRecords: 0,
            totalAmount: 0,
          };
        }

        acc[plateNumber].totalRecords += 1;
        acc[plateNumber].totalAmount += Number(fuel.totalPrice || 0);

        return acc;
      },
      {}
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Yakıt Özeti');

    sheet.mergeCells('A1:C1');
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value =
      `Araç Yakıt Özeti: ${dayjs(finalBeginDate).format('DD.MM.YYYY')} - ${dayjs(finalEndDate).format('DD.MM.YYYY')}`;
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).font = { bold: true };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    titleRow.getCell(1).border = { bottom: { style: 'thin' } };

    // Kolonlar
    sheet.getRow(2).values = ['Plaka', 'Yakıt Fişi Sayısı', 'Toplam Tutar (₺)'];
    sheet.getRow(2).font = { bold: true };

    sheet.columns = [
      { key: 'plateNumber', width: 20 },
      { key: 'totalRecords', width: 20 },
      { key: 'totalAmount', width: 20 },
    ];

    // Veri
    let rowIndex = 3;
    let grandTotal = 0;
    let grandCount = 0;

    Object.values(grouped).forEach((data) => {
      grandTotal += data.totalAmount;
      grandCount += data.totalRecords;
      sheet.insertRow(rowIndex++, data);
    });

    // Toplam Satırı
    const totalRow = sheet.getRow(rowIndex++);
    totalRow.getCell(1).value = 'TOPLAM';
    totalRow.getCell(2).value = grandCount;
    totalRow.getCell(3).value = grandTotal;
    totalRow.font = { bold: true };
    totalRow.getCell(1).alignment = { horizontal: 'right' };

    sheet.getColumn('totalAmount').numFmt = '#,##0.00 ₺';

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=vehicle-fuel-summary.xlsx');
    res.end(buffer);
  }
}
