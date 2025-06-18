// src/utils/object-id.util.ts
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function ensureValidObjectId(id: string, message = 'Geçersiz ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(message);
  }
}
