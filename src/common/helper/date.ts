import dayjs from 'dayjs';

export const getMonthRange = () => {
  const now = dayjs();
  return {
    beginDate: now.startOf('month').toDate(),
    endDate: now.endOf('month').toDate(),
  };
};
