import {
  formatNumber,
  formatDate,
  timeAgo,
  formatSize,
  truncate,
  getLanguageColor,
} from './formatters';

describe('formatNumber', () => {
  it('leaves small numbers alone', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
  });
  it('abbreviates thousands, millions and billions', () => {
    expect(formatNumber(1200)).toBe('1.2k');
    expect(formatNumber(15000)).toBe('15k');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(2000000000)).toBe('2B');
  });
  it('handles rounding at unit boundaries', () => {
    expect(formatNumber(999999)).toBe('1M');
  });
  it('handles invalid input', () => {
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber('abc')).toBe('0');
  });
});

describe('dates', () => {
  it('formats ISO dates', () => {
    expect(formatDate('2024-03-04T12:00:00Z')).toMatch(/Mar 4, 2024/);
    expect(formatDate(null)).toBe('—');
    expect(formatDate('nonsense')).toBe('—');
  });
  it('computes relative time', () => {
    const now = new Date('2024-06-10T12:00:00Z').getTime();
    expect(timeAgo('2024-06-10T11:59:50Z', now)).toBe('just now');
    expect(timeAgo('2024-06-10T10:00:00Z', now)).toBe('2 hours ago');
    expect(timeAgo('2024-06-09T12:00:00Z', now)).toBe('1 day ago');
    expect(timeAgo('2022-06-10T12:00:00Z', now)).toBe('2 years ago');
  });
});

describe('misc helpers', () => {
  it('formats sizes', () => {
    expect(formatSize(512)).toBe('512 KB');
    expect(formatSize(2048)).toBe('2.0 MB');
    expect(formatSize(0)).toBe('—');
  });
  it('truncates text', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello world', 6)).toBe('hello…');
    expect(truncate(null)).toBe('');
  });
  it('returns a fallback language color', () => {
    expect(getLanguageColor('Python')).toBe('#3572a5');
    expect(getLanguageColor('Nope')).toBe('#94a3b8');
  });
});
