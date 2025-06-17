import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true })
  plateNumber: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  inspectionDate: Date;

  @Prop({ required: true })
  insuranceDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Emplooye', required: true })
  driverId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export type VehicleDocument = Vehicle & Document;
export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
