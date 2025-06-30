import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FuelDocument = Fuel & Document;

@Schema({
  timestamps: true,
  collection: 'fuels',
})
export class Fuel {
  @Prop({
    type: Number,
    required: true,
    min: [0.01, "Yakıt tutarı 0.01 ₺'den küçük olamaz"],
    description: 'Toplam yakıt ücreti (₺)',
  })
  totalPrice: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Fatura numarası en fazla 50 karakter olabilir'],
    description: 'Fatura numarası',
  })
  invoiceNo: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Açıklama en fazla 500 karakter olabilir'],
    description: 'Yakıt işlemi açıklaması',
  })
  description?: string;

  @Prop({
    type: Date,
    required: true,
    description: 'Yakıtın alındığı tarih',
  })
  operationDate: Date;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Sürücü adı en fazla 100 karakter olabilir'],
    description: 'Sürücü adı',
  })
  driverName: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Vehicle',
    required: true,
    description: 'İlgili araç referansı',
  })
  vehicleId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    description: 'Şirket referansı',
  })
  companyId: Types.ObjectId;
}

export const FuelSchema = SchemaFactory.createForClass(Fuel);

// Compound indexes for better query performance
FuelSchema.index({ companyId: 1, operationDate: -1 });
FuelSchema.index({ companyId: 1, vehicleId: 1, operationDate: -1 });
FuelSchema.index({ companyId: 1, invoiceNo: 1 }, { unique: true });
FuelSchema.index({ companyId: 1, driverName: 1 });
FuelSchema.index({ createdAt: -1 });
