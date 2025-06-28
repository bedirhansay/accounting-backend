import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FuelDocument = Fuel & Document;

@Schema({ timestamps: true })
export class Fuel {
  @Prop({ type: Number, required: true, description: 'Toplam yakıt ücreti' })
  totalPrice: number;

  @Prop({ type: String, required: true, description: 'Fatura numarası', index: true })
  invoiceNo: string;

  @Prop({ type: String, required: false, description: 'Açıklama' })
  description?: string;

  @Prop({ type: Date, required: true, description: 'Yakıtın alındığı tarih' })
  operationDate: Date;

  @Prop({ type: String, required: true, description: 'Fatura numarası', lowercase: true, index: true })
  driverName: string;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true, index: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const FuelSchema = SchemaFactory.createForClass(Fuel);
