import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: Date, required: true })
  operationDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, refPath: 'relatedModel', required: false })
  relatedToId?: Types.ObjectId;

  @Prop({ type: String, enum: ['Vehicle', 'Emplooye'], required: false })
  relatedModel?: 'Vehicle' | 'Emplooye';
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
