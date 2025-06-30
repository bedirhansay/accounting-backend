import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, trim: true, lowercase: true, index: true })
  fullName: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: true, trim: true, index: true })
  departmentName: string;

  @Prop({ type: Date })
  hireDate?: Date;

  @Prop({ type: Date })
  terminationDate?: Date;

  @Prop({ required: false, min: 0 })
  salary?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ fullName: 1, companyId: 1 }, { unique: true });
