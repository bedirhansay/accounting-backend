import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type EmplooyeDocument = Emplooye & Document;

@Schema({ timestamps: true })
export class Emplooye {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  departmentName: string;

  @Prop({ required: true, type: Date })
  hireDate: Date;

  @Prop({ type: Date, default: null })
  terminationDate?: Date | null;

  @Prop({ required: true })
  salary: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string;
}

export const EmplooyeSchema = SchemaFactory.createForClass(Emplooye);
