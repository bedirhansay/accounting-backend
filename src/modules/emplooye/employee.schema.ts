import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;
@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  fullName: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  departmentName: string;

  @Prop({ type: Date })
  hireDate?: Date;

  @Prop({ type: Date })
  terminationDate?: Date;

  @Prop()
  salary?: number;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ fullName: 1, companyId: 1 }, { unique: true });
