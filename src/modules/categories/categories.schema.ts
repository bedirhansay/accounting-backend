import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CategoryDocument = Category & Document;
@Schema({
  timestamps: true,
})
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
