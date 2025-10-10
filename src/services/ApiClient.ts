import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { paths as chatPaths, components as chatComponents } from './api/chat-schema';
import type { paths as platformPaths, components as platformComponents } from './api/platform-schema';
import type { paths as notificationPaths, components as notificationComponents } from './api/notification-schema';
import { useEventBus } from '@/stores/EventStore.ts';

// Combine all OpenAPI paths
export type ApiPaths = chatPaths & platformPaths & notificationPaths;
// Combine all OpenAPI components
export type ApiComponents = chatComponents & platformComponents & notificationComponents;

const bus = useEventBus();

/**
 * Extend AxiosRequestConfig to support a `pathParams` object for URL placeholder substitution.
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Key-value pairs for pathParams placeholders, e.g. { userId: "42" } for /users/{userId}.
     */
    pathParams?: Record<string, string | number | boolean | null>;

    /**
     * Optional: defines which placeholder syntax is used in the URL.
     * - "curly": {param}  (OpenAPI standard)
     * - "colon": :param   (Express-style)
     * - "both": supports both styles
     *
     * @default "curly"
     */
    pathParamsPlaceholderStyle?: 'curly' | 'colon' | 'both';
  }
}

/**
 * Replaces pathParams placeholders in a URL template with actual values.
 *
 * @param template - The URL template containing placeholders (e.g. `/users/{userId}`).
 * @param pathParams - Key-value pairs for placeholder replacement.
 * @param style - The placeholder syntax style to use.
 * @returns The URL with all placeholders replaced.
 * @throws Error if any required path parameter is missing.
 */
function replacePlaceholders(
  template: string,
  pathParams: AxiosRequestConfig['pathParams'] = {},
  style: AxiosRequestConfig['pathParamsPlaceholderStyle'] = 'curly',
): string {
  const patterns = {
    curly: /\{([^}]+)\}/g,
    colon: /:([A-Za-z0-9_]+)/g,
    both: /\{([^}]+)\}|:([A-Za-z0-9_]+)/g,
  } as const;

  const rx = patterns[style];

  const url = template.replace(rx, (_m, k1, k2) => {
    const key = (k1 ?? k2) as string;
    const val = (pathParams as any)?.[key];

    // Allow 0 and false, but not null or undefined
    if (val === null || val === undefined) {
      throw new Error(`Missing path parameter: "${key}"`);
    }
    return encodeURIComponent(String(val));
  });

  // Double-check that no placeholders remain
  if (/{[^}]+}/.test(url) || /:[A-Za-z0-9_]+/.test(url)) {
    throw new Error(`Not all path parameters were replaced. Result: "${url}"`);
  }

  return url;
}

/**
 * Axios request interceptor that replaces URL placeholders
 * using the `config.pathParams` object before sending the request.
 */
function requestHandler(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (config.url && config.pathParams) {
    const style = config.pathParamsPlaceholderStyle ?? 'curly';
    config.url = replacePlaceholders(config.url, config.pathParams, style);
    delete config.pathParams;
    delete config.pathParamsPlaceholderStyle;
  }
  return config;
}

function requestErrorHandler(error: AxiosError): Promise<AxiosError> {
  console.error(`[request error] [${JSON.stringify(error)}]`);
  bus.emit('toast:translate', { severity: 'error', summary: 'error.general', detail: 'error.apiRequest' });
  return Promise.reject(error);
}

// this interceptor is used to handle all success ajax request
function responseHandler(response: AxiosResponse): AxiosResponse {
  if (response.status == 200 || response.status == 201) {
    const data = response?.data;
    if (!data) {
      bus.emit('toast:translate', { severity: 'error', summary: 'error.general', detail: 'error.apiResponse' });
    }
  }
  return response;
}

function responseErrorHandler(error: AxiosError) {
  console.error(`[request error] [${JSON.stringify(error)}]`);
  bus.emit('toast:translate', { severity: 'error', summary: 'error.general', detail: 'error.apiResponse' });
  return Promise.reject(error);
}

function createAxiosInstance() {
  const instance = axios.create({});
  instance.interceptors.request.use(requestHandler, requestErrorHandler);
  instance.interceptors.response.use(responseHandler, responseErrorHandler);
  return instance;
}

export const apiClient: AxiosInstance = createAxiosInstance();
