import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true, trim: true, unique: true })
  plateNumber: string;

  @Prop({ required: true, trim: true })
  brand: string;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop({ type: Date })
  inspectionDate?: Date;

  @Prop({ type: Date })
  insuranceDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  driverId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: String, trim: true, default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
VehicleSchema.index({ plateNumber: 1, companyId: 1 }, { unique: true });
