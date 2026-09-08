import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initTelemetry, reportError } from '@/telemetry/otel';

describe('otel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('initTelemetry', () => {
    it('is a no-op under Vitest (import.meta.env.MODE === "test")', () => {
      expect(() => initTelemetry()).not.toThrow();
    });
  });

  describe('reportError', () => {
    it('logs the message and error to the console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('boom');

      reportError('[test]', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[test]', error);
    });

    it('does not throw when no OTel provider has been registered (test-mode default)', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => reportError('[test]', new Error('boom'), { 'http.status_code': 500 })).not.toThrow();
    });

    it('wraps a non-Error value in an Error without throwing', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => reportError('[test]', 'plain string reason')).not.toThrow();
    });
  });
});
