import { pluralizeTasks } from './pluralize';

describe('pluralizeTasks', () => {
  it('returns correct form for 1', () => {
    expect(pluralizeTasks(1)).toBe('Осталась 1 задача');
  });

  it('returns correct form for 2', () => {
    expect(pluralizeTasks(2)).toBe('Осталось 2 задачи');
  });

  it('returns correct form for 3', () => {
    expect(pluralizeTasks(3)).toBe('Осталось 3 задачи');
  });

  it('returns correct form for 4', () => {
    expect(pluralizeTasks(4)).toBe('Осталось 4 задачи');
  });

  it('returns correct form for 5', () => {
    expect(pluralizeTasks(5)).toBe('Осталось 5 задач');
  });

  it('returns correct form for 11', () => {
    expect(pluralizeTasks(11)).toBe('Осталось 11 задач');
  });

  it('returns correct form for 12', () => {
    expect(pluralizeTasks(12)).toBe('Осталось 12 задач');
  });

  it('returns correct form for 13', () => {
    expect(pluralizeTasks(13)).toBe('Осталось 13 задач');
  });

  it('returns correct form for 14', () => {
    expect(pluralizeTasks(14)).toBe('Осталось 14 задач');
  });

  it('returns correct form for 21', () => {
    expect(pluralizeTasks(21)).toBe('Осталась 21 задача');
  });

  it('returns correct form for 22', () => {
    expect(pluralizeTasks(22)).toBe('Осталось 22 задачи');
  });

  it('returns correct form for 25', () => {
    expect(pluralizeTasks(25)).toBe('Осталось 25 задач');
  });

  it('returns correct form for 100', () => {
    expect(pluralizeTasks(100)).toBe('Осталось 100 задач');
  });

  it('returns correct form for 101', () => {
    expect(pluralizeTasks(101)).toBe('Осталась 101 задача');
  });

  it('handles zero', () => {
    expect(pluralizeTasks(0)).toBe('Осталось 0 задач');
  });

  it('handles negative numbers', () => {
    expect(pluralizeTasks(-1)).toBe('Осталась -1 задача');
    expect(pluralizeTasks(-5)).toBe('Осталось -5 задач');
  });
});