import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getRelativeTime, getStatusColor, getStatusIcon } from '../../../../src/components/inbox/composables/useInboxHelpers';

describe('useInboxHelpers', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock current date to 2025-01-15 12:00:00
    mockDate = new Date('2025-01-15T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getRelativeTime', () => {
    it('should return empty string for invalid date', () => {
      expect(getRelativeTime(null)).toBe('');
      expect(getRelativeTime(undefined)).toBe('');
    });

    it('should return "X minutes ago" for times less than 60 minutes', () => {
      const fiveMinutesAgo = new Date('2025-01-15T11:55:00Z');
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');

      const thirtyMinutesAgo = new Date('2025-01-15T11:30:00Z');
      expect(getRelativeTime(thirtyMinutesAgo)).toBe('30 minutes ago');

      const oneMinuteAgo = new Date('2025-01-15T11:59:00Z');
      expect(getRelativeTime(oneMinuteAgo)).toBe('1 minutes ago');
    });

    it('should return "X hours ago" for times less than 24 hours', () => {
      const oneHourAgo = new Date('2025-01-15T11:00:00Z');
      expect(getRelativeTime(oneHourAgo)).toBe('1 hours ago');

      const fiveHoursAgo = new Date('2025-01-15T07:00:00Z');
      expect(getRelativeTime(fiveHoursAgo)).toBe('5 hours ago');

      const twentyThreeHoursAgo = new Date('2025-01-14T13:00:00Z');
      expect(getRelativeTime(twentyThreeHoursAgo)).toBe('23 hours ago');
    });

    it('should return "yesterday" for exactly 1 day ago', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z');
      expect(getRelativeTime(yesterday)).toBe('yesterday');
    });

    it('should return "X days ago" for times more than 1 day ago', () => {
      const twoDaysAgo = new Date('2025-01-13T12:00:00Z');
      expect(getRelativeTime(twoDaysAgo)).toBe('2 days ago');

      const sevenDaysAgo = new Date('2025-01-08T12:00:00Z');
      expect(getRelativeTime(sevenDaysAgo)).toBe('7 days ago');

      const thirtyDaysAgo = new Date('2024-12-16T12:00:00Z');
      expect(getRelativeTime(thirtyDaysAgo)).toBe('30 days ago');
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2025-01-16T12:00:00Z');
      // Future dates will have negative diff, so Math.round will round to 0
      expect(getRelativeTime(futureDate)).toBe('0 minutes ago');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for OPEN status', () => {
      expect(getStatusColor('OPEN')).toBe('text-green-600');
    });

    it('should return correct color for IN_PROGRESS status', () => {
      expect(getStatusColor('IN_PROGRESS')).toBe('text-purple-600');
    });

    it('should return correct color for CLOSED status', () => {
      expect(getStatusColor('CLOSED')).toBe('text-surface-400');
    });

    it('should return correct color for REJECTED status', () => {
      expect(getStatusColor('REJECTED')).toBe('text-red-600');
    });

    it('should return default color for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toBe('text-yellow-600');
      expect(getStatusColor('')).toBe('text-yellow-600');
      expect(getStatusColor('PENDING')).toBe('text-yellow-600');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icon for OPEN status', () => {
      expect(getStatusIcon('OPEN')).toBe('pi pi-circle');
    });

    it('should return correct icon for IN_PROGRESS status', () => {
      expect(getStatusIcon('IN_PROGRESS')).toBe('pi pi-sync');
    });

    it('should return correct icon for CLOSED status', () => {
      expect(getStatusIcon('CLOSED')).toBe('pi pi-check-circle');
    });

    it('should return correct icon for REJECTED status', () => {
      expect(getStatusIcon('REJECTED')).toBe('pi pi-times-circle');
    });

    it('should return default icon for unknown status', () => {
      expect(getStatusIcon('UNKNOWN')).toBe('pi pi-circle');
      expect(getStatusIcon('')).toBe('pi pi-circle');
      expect(getStatusIcon('PENDING')).toBe('pi pi-circle');
    });
  });
});

