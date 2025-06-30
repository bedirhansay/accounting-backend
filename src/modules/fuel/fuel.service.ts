import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { Model, Types } from 'mongoose';

import { PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_PAGE_SIZE } from '../../common/constant/pagination.param';
import { DateRangeDTO } from '../../common/DTO/request';
import { PaginatedDateSearchDTO } from '../../common/DTO/request/pagination.request.dto';
import { CommandResponseDto } from '../../common/DTO/response/command-response.dto';
import { PaginatedResponseDto } from '../../common/DTO/response/paginated.response.dto';
import { ExcelColumnConfig, ExcelHelper } from '../../common/helper/excel.helper';
import { FilterBuilder } from '../../common/helper/filter.builder';
import { getFinalDateRange } from '../../common/helper/get-date-params';
import { ensureValidObjectId } from '../../common/helper/object.id';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { FuelDto } from './dto/fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Fuel, FuelDocument } from './fuel.schema';

@Injectable()
export class FuelService {
  // Constants for better maintainability
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 100;

  // Enhanced error messages
  private static readonly ERROR_MESSAGES = {
    INVALID_FUEL_ID: 'Geçersiz yakıt ID',
    INVALID_COMPANY_ID: 'Geçersiz firma ID',
    INVALID_VEHICLE_ID: 'Geçersiz araç ID',
    FUEL_NOT_FOUND: 'Yakıt kaydı bulunamadı',
    FUEL_UPDATE_FAILED: 'Güncellenecek yakıt kaydı bulunamadı',
    FUEL_DELETE_FAILED: 'Silinecek yakıt kaydı bulunamadı',
  };

  constructor(
    @InjectModel(Fuel.name)
    private readonly fuelModel: Model<FuelDocument>
  ) {}

  async create(dto: CreateFuelDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(companyId, FuelService.ERROR_MESSAGES.INVALID_COMPANY_ID);

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
    ensureValidObjectId(companyId, FuelService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const { pageNumber, pageSize, search, beginDate, endDate } = params;

    const validPageNumber = FilterBuilder.validatePageNumber(pageNumber);
    const validPageSize = FilterBuilder.validatePageSize(pageSize);

    const filter = FilterBuilder.buildBaseFilter({
      companyId,
      search,
      beginDate,
      endDate,
    });

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

    const [data, totalCountResult] = await Promise.all([
      this.fuelModel
        .aggregate([
          ...pipeline,
          { $sort: { operationDate: -1 } },
          { $skip: (validPageNumber - 1) * validPageSize },
          { $limit: validPageSize },
        ])
        .exec(),
      this.fuelModel.aggregate([...pipeline, { $count: 'count' }]).exec(),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    const items = plainToInstance(FuelDto, data, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalPages: Math.ceil(totalCount / validPageSize),
      totalCount,
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
    };
  }

  async findOne(id: string, companyId: string): Promise<FuelDto> {
    ensureValidObjectId(id, FuelService.ERROR_MESSAGES.INVALID_FUEL_ID);
    ensureValidObjectId(companyId, FuelService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const fuel = await this.fuelModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate({ path: 'vehicleId', select: 'plateNumber' })
      .lean()
      .exec();

    if (!fuel) {
      throw new NotFoundException(FuelService.ERROR_MESSAGES.FUEL_NOT_FOUND);
    }

    return plainToInstance(FuelDto, fuel, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateFuelDto, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, FuelService.ERROR_MESSAGES.INVALID_FUEL_ID);
    ensureValidObjectId(companyId, FuelService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const updated = await this.fuelModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) },
      {
        ...dto,
        ...(dto.vehicleId && { vehicleId: new Types.ObjectId(dto.vehicleId) }),
      },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException(FuelService.ERROR_MESSAGES.FUEL_UPDATE_FAILED);
    }

    return {
      statusCode: 200,
      id: updated.id.toString(),
    };
  }

  async remove(id: string, companyId: string): Promise<CommandResponseDto> {
    ensureValidObjectId(id, FuelService.ERROR_MESSAGES.INVALID_FUEL_ID);
    ensureValidObjectId(companyId, FuelService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const deleted = await this.fuelModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!deleted) {
      throw new NotFoundException(FuelService.ERROR_MESSAGES.FUEL_DELETE_FAILED);
    }

    return {
      statusCode: 204,
      id: deleted.id.toString(),
    };
  }

  async exportToExcel(companyId: string, query: PaginatedDateSearchDTO, res: Response): Promise<void> {
    const filter = FilterBuilder.buildBaseFilter({
      companyId,
      search: query.search,
      beginDate: query.beginDate,
      endDate: query.endDate,
    });

    if (query.beginDate || query.endDate) {
      delete filter.operationDate;
      filter.operationDate = {};
      if (query.beginDate) filter.operationDate.$gte = new Date(query.beginDate);
      if (query.endDate) filter.operationDate.$lte = new Date(query.endDate);
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

    if (query.search) {
      pipeline.push({
        $match: {
          $or: [
            { description: { $regex: query.search, $options: 'i' } },
            { invoiceNo: { $regex: query.search, $options: 'i' } },
            { driverName: { $regex: query.search, $options: 'i' } },
            { 'vehicleId.plateNumber': { $regex: query.search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { operationDate: -1 } });

    const fuels = await this.fuelModel.aggregate(pipeline).exec();

    const fuelDtos = plainToInstance(FuelDto, fuels, {
      excludeExtraneousValues: true,
    });

    // Create workbook using ExcelHelper
    const { workbook, sheet } = ExcelHelper.createWorkbook('Yakıt Kayıtları');

    const title = `Yakıt Kayıtları (${ExcelHelper.formatDate(new Date(), 'DD.MM.YYYY')})`;

    // Define columns for Excel export
    const columns: ExcelColumnConfig[] = [
      { key: 'invoiceNo', header: 'Fatura No', width: 20 },
      { key: 'plateNumber', header: 'Plaka', width: 15 },
      { key: 'driverName', header: 'Sürücü', width: 20 },
      { key: 'totalPrice', header: 'Tutar', width: 15 },
      { key: 'description', header: 'Açıklama', width: 30 },
      { key: 'operationDate', header: 'İşlem Tarihi', width: 20 },
      { key: 'createdAt', header: 'Kayıt Tarihi', width: 20 },
    ];

    ExcelHelper.addTitle(sheet, title, columns.length);
    ExcelHelper.addHeaders(sheet, columns);

    // Transform data for Excel - access raw data instead of DTO
    const data = fuels.map((fuel) => ({
      invoiceNo: fuel.invoiceNo,
      plateNumber: fuel.vehicleId?.plateNumber || 'Bilinmeyen',
      driverName: fuel.driverName || 'Belirtilmemiş',
      totalPrice: `${fuel.totalPrice.toLocaleString('tr-TR')} ₺`,
      description: fuel.description || 'Açıklama yok',
      operationDate: ExcelHelper.formatDate(fuel.operationDate),
      createdAt: ExcelHelper.formatDate(fuel.createdAt),
    }));

    ExcelHelper.addDataRows(sheet, data, (row, item) => {
      row.getCell('invoiceNo').value = item.invoiceNo;
      row.getCell('plateNumber').value = item.plateNumber;
      row.getCell('driverName').value = item.driverName;
      row.getCell('totalPrice').value = item.totalPrice;
      row.getCell('description').value = item.description;
      row.getCell('operationDate').value = item.operationDate;
      row.getCell('createdAt').value = item.createdAt;
    });

    const fileName = `yakit_kayitlari_${new Date().toISOString().split('T')[0]}.xlsx`;
    await ExcelHelper.sendAsResponse(workbook, res, fileName);
  }

  async getFuelsByVehicleId(
    vehicleId: string,
    companyId: string,
    query: PaginatedDateSearchDTO
  ): Promise<PaginatedResponseDto<FuelDto>> {
    ensureValidObjectId(vehicleId, FuelService.ERROR_MESSAGES.INVALID_VEHICLE_ID);
    ensureValidObjectId(companyId, FuelService.ERROR_MESSAGES.INVALID_COMPANY_ID);

    const {
      pageNumber = PAGINATION_DEFAULT_PAGE,
      pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
      search,
      beginDate,
      endDate,
    } = query;

    // Validate and sanitize pagination parameters
    const validPageNumber = Math.max(1, Math.floor(pageNumber) || 1);
    const validPageSize = Math.min(
      FuelService.MAX_PAGE_SIZE,
      Math.max(1, Math.floor(pageSize) || FuelService.DEFAULT_PAGE_SIZE)
    );

    const { beginDate: finalBeginDate, endDate: finalEndDate } = getFinalDateRange(beginDate, endDate);

    const filter: any = {
      vehicleId: new Types.ObjectId(vehicleId),
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
      ];
    }

    if (finalBeginDate || finalEndDate) {
      filter.operationDate = {};
      if (finalBeginDate) filter.operationDate.$gte = new Date(finalBeginDate);
      if (finalEndDate) filter.operationDate.$lte = new Date(finalEndDate);
    }

    // Execute queries in parallel for better performance
    const [totalCount, fuels] = await Promise.all([
      this.fuelModel.countDocuments(filter),
      this.fuelModel
        .find(filter)
        .populate({ path: 'vehicleId', select: 'plateNumber' })
        .collation({ locale: 'tr', strength: 1 })
        .sort({ operationDate: -1 })
        .skip((validPageNumber - 1) * validPageSize)
        .limit(validPageSize)
        .lean()
        .exec(),
    ]);

    const items = plainToInstance(FuelDto, fuels, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      pageNumber: validPageNumber,
      totalPages: Math.ceil(totalCount / validPageSize),
      totalCount,
      hasPreviousPage: validPageNumber > 1,
      hasNextPage: validPageNumber * validPageSize < totalCount,
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

    // Create workbook using ExcelHelper
    const { workbook, sheet } = ExcelHelper.createWorkbook('Yakıt Özeti');

    const title = `Araç Yakıt Özeti: ${ExcelHelper.formatDate(finalBeginDate)} - ${ExcelHelper.formatDate(finalEndDate)}`;

    // Define columns for Excel export
    const columns: ExcelColumnConfig[] = [
      { key: 'plateNumber', header: 'Plaka', width: 20 },
      { key: 'totalRecords', header: 'Yakıt Fişi Sayısı', width: 20 },
      { key: 'totalAmount', header: 'Toplam Tutar (₺)', width: 20 },
    ];

    ExcelHelper.addTitle(sheet, title, columns.length);
    ExcelHelper.addHeaders(sheet, columns);

    // Transform data for Excel
    const data = Object.values(grouped);
    let grandTotal = 0;
    let grandCount = 0;

    data.forEach((item) => {
      grandTotal += item.totalAmount;
      grandCount += item.totalRecords;
    });

    ExcelHelper.addDataRows(sheet, data, (row, item) => {
      row.getCell('plateNumber').value = item.plateNumber;
      row.getCell('totalRecords').value = item.totalRecords;
      row.getCell('totalAmount').value = item.totalAmount;
    });

    // Add total row
    ExcelHelper.addTotalRow(sheet, {
      plateNumber: 'TOPLAM',
      totalRecords: grandCount,
      totalAmount: grandTotal,
    });

    const fileName = `yakit_ozeti_${new Date().toISOString().split('T')[0]}.xlsx`;
    await ExcelHelper.sendAsResponse(workbook, res, fileName);
  }
}
