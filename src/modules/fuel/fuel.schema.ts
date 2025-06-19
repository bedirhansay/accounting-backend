import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Fuel {
  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: String, required: true })
  invoiceNo: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Date, required: true })
  operationDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true })
  driverId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true })
  companyId: mongoose.Types.ObjectId;
}

export type FuelDocument = Fuel & Document;
export const FuelSchema = SchemaFactory.createForClass(Fuel);
