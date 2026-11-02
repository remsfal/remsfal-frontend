import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from '@/helper/redirectHelper';

describe('safeRedirectPath', () => {
  it('returns app-internal paths unchanged', () => {
    expect(safeRedirectPath('/manager/projects?page=2')).toBe('/manager/projects?page=2');
  });

  it.each([
    ['absolute URL', 'https://evil.example'],
    ['protocol-relative URL', '//evil.example'],
    ['relative path', 'manager'],
    ['undefined', undefined],
    ['array', ['/a', '/b']],
  ])('rejects %s', (_label, value) => {
    expect(safeRedirectPath(value)).toBeUndefined();
  });
});
