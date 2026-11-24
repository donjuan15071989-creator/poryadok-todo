export function pluralizeTasks(count: number): string {
  const absCount = Math.abs(count);
  const lastTwo = absCount % 100;
  const last = absCount % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `Осталось ${count} задач`;
  }

  if (last === 1) {
    return `Осталась ${count} задача`;
  }

  if (last >= 2 && last <= 4) {
    return `Осталось ${count} задачи`;
  }

  return `Осталось ${count} задач`;
}