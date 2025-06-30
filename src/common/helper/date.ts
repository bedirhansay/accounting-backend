import dayjs from 'dayjs';

export const getMonthRange = () => {
  const now = dayjs();
  return {
    beginDate: new Date(now.startOf('month').format('YYYY-MM-DDT00:00:00')), // local midnight
    endDate: new Date(now.endOf('month').format('YYYY-MM-DDT23:59:59.999')),
  };
};
