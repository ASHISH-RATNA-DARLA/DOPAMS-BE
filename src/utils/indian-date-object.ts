export default function getIndianDateObject(dateAsString: string) {
  return new Date(dateAsString).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}
