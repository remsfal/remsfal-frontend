import { trace } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { getRuntimeValue } from '@/helper/runtimeConfig';

const SERVICE_NAME = import.meta.env.VITE_OTEL_SERVICE_NAME || 'remsfal-frontend';

export interface TelemetrySettings {
  enabled: boolean;
  endpoint?: string;
}

/**
 * The dev server reads the Vite variables from `.env` (enabled unless `VITE_OTEL_ENABLED=false`).
 * Built bundles read the runtime config instead (`REMSFAL_OTEL_ENABLED`, `REMSFAL_OTLP_ENDPOINT`,
 * see runtimeConfig.ts), so the same image can send telemetry in one environment and none in
 * another. Telemetry stays off unless the runtime config enables it explicitly.
 */
export function resolveTelemetrySettings(): TelemetrySettings {
  if (import.meta.env.DEV) {
    return {
      enabled: import.meta.env.VITE_OTEL_ENABLED !== 'false',
      endpoint: import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || undefined,
    };
  }
  return { enabled: getRuntimeValue('otelEnabled') === 'true', endpoint: getRuntimeValue('otlpEndpoint') };
}

/**
 * Sets up browser-side OpenTelemetry tracing (XHR auto-instrumentation, so axios requests are
 * traced without touching ApiClient.ts) and a log pipeline used by reportError(). Both signals
 * export via OTLP/HTTP to the same Grafana `otel-lgtm` collector the backend already uses, so a
 * failed request shows up as one Tempo trace spanning both the frontend and backend spans.
 *
 * No-ops under Vitest and when disabled/unconfigured (see resolveTelemetrySettings()), so
 * `logs.getLogger()` in reportError() stays a safe no-op (OTel's api-logs proxy pattern) instead
 * of hitting the network. Must run after loadAppMode(), which loads the runtime config.
 */
export function initTelemetry(): void {
  if (import.meta.env.MODE === 'test') return;
  const { enabled, endpoint } = resolveTelemetrySettings();
  if (!enabled) return;
  if (!endpoint) {
    console.warn('[otel] no OTLP endpoint configured — telemetry disabled');
    return;
  }

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: import.meta.env.VITE_APP_VERSION ?? 'unknown',
    'deployment.environment': import.meta.env.MODE,
  });

  const tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }))],
  });
  tracerProvider.register();

  registerInstrumentations({instrumentations: [new XMLHttpRequestInstrumentation({ propagateTraceHeaderCorsUrls: [/.*/] })],});

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor({ exporter: new OTLPLogExporter({ url: `${endpoint}/v1/logs` }) }),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);
}

/**
 * Drop-in replacement for `console.error(message, error)`: keeps the console output developers
 * already rely on, and additionally records the error as an OTel log record (severity ERROR,
 * queryable in Loki by service.name) plus an exception event on the active span, if any.
 *
 * Safe to call before initTelemetry() (e.g. in tests) — logs.getLogger() returns a no-op logger
 * until a real LoggerProvider is registered.
 */
export function reportError(
  message: string,
  error: unknown,
  attributes: Record<string, string | number | boolean> = {},
): void {
  console.error(message, error);

  const err = error instanceof Error ? error : new Error(String(error));
  trace.getActiveSpan()?.recordException(err);

  logs.getLogger(SERVICE_NAME).emit({
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
    body: message,
    attributes: {
      'error.type': err.name,
      'error.message': err.message,
      'error.stack': err.stack ?? '',
      ...attributes,
    },
  });
}
