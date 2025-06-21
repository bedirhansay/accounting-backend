import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;
@Schema({
  timestamps: true,
})
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false, unique: false })
  description: string;

  @Prop({ required: true })
  isActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
