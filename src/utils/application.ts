import { isAfter, isBefore } from "date-fns";

export const isValidPeriod = ({
  applicationStartDate,
  applicationEndDate,
}: {
  applicationStartDate: Date | string;
  applicationEndDate: Date | string;
}) =>
  isBefore(new Date(), new Date(applicationEndDate)) &&
  isAfter(new Date(), new Date(applicationStartDate));
