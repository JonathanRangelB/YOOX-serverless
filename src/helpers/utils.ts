export function convertToBase36(intValue: number) {
  return intValue.toString(36).padStart(6, '0').toUpperCase();
}

export function convertFromBase36ToNumber(base36Value: string) {
  return parseInt(base36Value, 36);
}

export function convertDateTimeZone(
  dateTimeSource: Date,
  targetTimeZone: string
) {
  console.log('year: ' + dateTimeSource.getFullYear());
  console.log('month: ' + dateTimeSource.getMonth());
  console.log('day: ' + dateTimeSource.getDay());
  console.log('hour: ' + dateTimeSource.getHours());
  console.log('minute: ' + dateTimeSource.getMinutes());
  console.log('second: ' + dateTimeSource.getSeconds());
}
