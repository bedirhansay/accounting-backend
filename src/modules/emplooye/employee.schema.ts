import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmplooyeDocument = Emplooye & Document;
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
export class Emplooye {
  @Prop({ required: true })
  fullName: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  departmentName: string;

  @Prop({ type: Date })
  hireDate?: Date;

  @Prop({ type: Date, default: null })
  terminationDate?: Date | null;

  @Prop()
  salary?: number;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const EmplooyeSchema = SchemaFactory.createForClass(Emplooye);
