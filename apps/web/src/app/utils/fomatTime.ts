export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalMonths = Math.floor(totalDays / 30);

  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;
  const days = totalDays % 30;
  const months = totalMonths;

  return `${months} months, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}
