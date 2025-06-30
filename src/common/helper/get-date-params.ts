import dayjs from 'dayjs';
import { getMonthRange } from './date';

export function getFinalDateRange(
  beginDate?: string | Date,
  endDate?: string | Date
): {
  beginDate: Date;
  endDate: Date;
} {
  const { beginDate: defaultBegin, endDate: defaultEnd } = getMonthRange();

  return {
    beginDate: beginDate ? dayjs(beginDate).startOf('day').toDate() : defaultBegin,
    endDate: endDate ? dayjs(endDate).endOf('day').toDate() : defaultEnd,
  };
}
