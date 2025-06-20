import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

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
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false, unique: false })
  description: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
