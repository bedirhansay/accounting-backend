import dayjs from 'dayjs';

const now = dayjs();
const monthStart = now.startOf('month').toDate();
const monthEnd = now.endOf('month').toDate();

export { monthEnd, monthStart };
