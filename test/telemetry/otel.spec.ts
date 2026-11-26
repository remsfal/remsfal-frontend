import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initTelemetry, reportError, resolveTelemetrySettings } from '@/telemetry/otel';
import { setRuntimeConfig } from '@/helper/runtimeConfig';

describe('otel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('initTelemetry', () => {
    it('is a no-op under Vitest (import.meta.env.MODE === "test")', () => {
      expect(() => initTelemetry()).not.toThrow();
    });
  });

  describe('resolveTelemetrySettings', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      setRuntimeConfig({});
    });

    describe('on the dev server', () => {
      it('uses the Vite variables and ignores the runtime config', () => {
        vi.stubEnv('DEV', true);
        vi.stubEnv('VITE_OTEL_ENABLED', 'true');
        vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_ENDPOINT', '/otlp');
        setRuntimeConfig({ otelEnabled: 'false', otlpEndpoint: '/other' });
        expect(resolveTelemetrySettings()).toEqual({ enabled: true, endpoint: '/otlp' });
      });

      it('is disabled by VITE_OTEL_ENABLED=false', () => {
        vi.stubEnv('DEV', true);
        vi.stubEnv('VITE_OTEL_ENABLED', 'false');
        expect(resolveTelemetrySettings().enabled).toBe(false);
      });
    });

    describe('in a built bundle', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
        vi.stubEnv('VITE_OTEL_ENABLED', 'true');
        vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_ENDPOINT', '/build-time');
      });

      it('uses the runtime config and ignores the Vite variables', () => {
        setRuntimeConfig({ otelEnabled: 'true', otlpEndpoint: 'https://collector.example.org' });
        expect(resolveTelemetrySettings()).toEqual({ enabled: true, endpoint: 'https://collector.example.org' });
      });

      it.each([
        ['REMSFAL_OTEL_ENABLED=false', { otelEnabled: 'false', otlpEndpoint: '/otlp' }],
        ['an unsubstituted placeholder', { otelEnabled: '${REMSFAL_OTEL_ENABLED}', otlpEndpoint: '/otlp' }],
        ['a missing runtime config', {}],
      ])('is disabled for %s', (_label, config) => {
        setRuntimeConfig(config);
        expect(resolveTelemetrySettings().enabled).toBe(false);
      });

      it('has no endpoint when the runtime config sets none', () => {
        setRuntimeConfig({ otelEnabled: 'true', otlpEndpoint: '' });
        expect(resolveTelemetrySettings()).toEqual({ enabled: true, endpoint: undefined });
      });
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
