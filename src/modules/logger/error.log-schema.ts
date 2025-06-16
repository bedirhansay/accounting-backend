// src/modules/logs/schemas/error-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ErrorLogDocument = ErrorLog & Document;

@Schema({ timestamps: true })
export class ErrorLog {
  @Prop()
  message: string;

  @Prop()
  stack: string;

  @Prop()
  context: string;

  @Prop()
  path: string;

  @Prop()
  method: string;

  @Prop()
  userId?: string;

  @Prop()
  companyId?: string;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);
