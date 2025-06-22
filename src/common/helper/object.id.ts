// src/utils/object-id.util.ts
import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export function ensureValidObjectId(id: string, message = 'Geçersiz ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(message);
  }
}

export const transformObjectId = () => Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true });
