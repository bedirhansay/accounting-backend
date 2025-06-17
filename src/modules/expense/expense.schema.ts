import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: Date, required: true })
  operationDate: Date;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  paymentType: string;

  @Prop({ type: Boolean, required: true })
  isPaid: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, refPath: 'relatedModel', required: false })
  relatedToId?: Types.ObjectId;

  @Prop({ type: String, enum: ['Vehicle', 'Emplooye'], required: false })
  relatedModel?: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
