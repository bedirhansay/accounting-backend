import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getLocalDateRange(begin?: string | Date, end?: string | Date) {
  const tz = 'Europe/Istanbul';

  const finalBegin = begin ? dayjs(begin).tz(tz).startOf('day').toDate() : dayjs().tz(tz).startOf('month').toDate();

  const finalEnd = end ? dayjs(end).tz(tz).endOf('day').toDate() : dayjs().tz(tz).endOf('month').toDate();

  return {
    beginDate: finalBegin,
    endDate: finalEnd,
  };
}
