import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IncomeDocument = Income & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Income {
  @Prop({ type: Number, required: true, min: 0 })
  unitCount: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: String, default: '', trim: true })
  description?: string;

  @Prop({ type: Date, required: true, index: true })
  operationDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true }) customerId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true }) categoryId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true }) companyId: Types.ObjectId;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
