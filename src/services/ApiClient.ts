import axios from 'axios';
import type {AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse} from 'axios';
import type { paths as ticketingPaths, components as ticketingComponents } from './api/ticketing-schema';
import type { paths as platformPaths, components as platformComponents } from './api/platform-schema';
import type { paths as notificationPaths, components as notificationComponents } from './api/notification-schema';
import { useEventBus } from '@/stores/EventStore.ts';

// Combine all OpenAPI paths
export type ApiPaths = ticketingPaths & platformPaths & notificationPaths;
// Combine all OpenAPI components
export type ApiComponents = ticketingComponents & platformComponents & notificationComponents;

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
   // Precompiled safe regex patterns
  const patterns = {
    curly: /\{(\w+)\}/g,
    colon: /:(\w+)/g,
    both: /\{(\w+)\}|:(\w+)/g,
  } as const;

  const rx = patterns[style];

  const url = template.replace(rx, (_m, k1, k2) => {
    const key = (k1 ?? k2) as string;
    const val = pathParams?.[key as keyof typeof pathParams];

    // Allow 0 and false, but not null or undefined
    if (val === null || val === undefined) {
      throw new Error(`Missing path parameter: "${key}"`);
    }
    return encodeURIComponent(String(val));
  });
    // Double-check that no placeholders remain
  if (/\{(\w+)\}/.test(url) || /:(\w+)/.test(url)) {
    throw new Error(`Not all path parameters were replaced. Result: "${url}"`);
  }

  return url;
}

/**
* Axios request interceptor that replaces URL placeholders
 * using the `config.pathParams` object before sending the request.
 */
function emitToast(severity: string, summary: string, detail: string) {
  const bus = useEventBus();
  bus.emit('toast:translate', {
 severity, summary, detail 
});
}
/**
 * Axios interceptors
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
  emitToast('error', 'error.general', 'error.apiRequest');
  return Promise.reject(error);
}
// this interceptor is used to handle all success ajax request
function responseHandler(response: AxiosResponse): AxiosResponse {
  if (response.status === 200) {
    const data = response?.data;
    if (!data) {
      emitToast('error', 'error.general', 'error.apiResponse');
    }
  }
  // 201 Created can have no body (e.g., only Location header), which is valid
  return response;
}

function responseErrorHandler(error: AxiosError) {
  console.error(`[response error] [${JSON.stringify(error)}]`);
  emitToast('error', 'error.general', 'error.apiResponse');
  return Promise.reject(error);
}

function createAxiosInstance() {
  const instance = axios.create({});
  instance.interceptors.request.use(requestHandler, requestErrorHandler);
  instance.interceptors.response.use(responseHandler, responseErrorHandler);
  return instance;
}

// ============================================================================
// Type-Safe API Client with OpenAPI Validation
// ============================================================================

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type PathsForMethod<M extends HttpMethod> = {
  [P in keyof ApiPaths]: M extends keyof ApiPaths[P] ? P : never;
}[keyof ApiPaths];

// Extract request body type
type RequestBody<P extends keyof ApiPaths, M extends HttpMethod> =
  P extends keyof ApiPaths
    ? M extends keyof ApiPaths[P]
      ? ApiPaths[P][M] extends { requestBody?: { content: { 'application/json': infer Body } } }
        ? Body
        : never
      : never
    : never;

// Extract path parameters
type PathParams<P extends keyof ApiPaths, M extends HttpMethod> =
  P extends keyof ApiPaths
    ? M extends keyof ApiPaths[P]
      ? ApiPaths[P][M] extends { parameters: { path?: infer Params } }
        ? Params
        : Record<string, never>
      : Record<string, never>
    : Record<string, never>;

// Extract query parameters
type QueryParams<P extends keyof ApiPaths, M extends HttpMethod> =
  P extends keyof ApiPaths
    ? M extends keyof ApiPaths[P]
      ? ApiPaths[P][M] extends { parameters: { query?: infer Params } }
        ? Params
        : Record<string, never>
      : Record<string, never>
    : Record<string, never>;

// Extract response type
type ResponseType<P extends keyof ApiPaths, M extends HttpMethod> =
  P extends keyof ApiPaths
    ? M extends keyof ApiPaths[P]
      ? ApiPaths[P][M] extends { responses: { 200: { content: { 'application/json': infer Res } } } }
        ? Res
        : ApiPaths[P][M] extends { responses: { 204: any } }
          ? void
          : ApiPaths[P][M] extends { responses: { 200: any } }
            ? void
            : unknown
      : unknown
    : unknown;

// Convert path parameters to Record<string, string | number>
type PathParamsConfig<P> = {
  [K in keyof P]: string | number;
};

// Request options
type RequestOptions<P extends keyof ApiPaths, M extends HttpMethod> = {
  pathParams?: PathParamsConfig<PathParams<P, M>>;
  params?: QueryParams<P, M>;
  config?: AxiosRequestConfig;
};

/**
 * Type-safe API client wrapper with full OpenAPI validation.
 * Wraps the Axios instance with interceptors while providing compile-time type safety.
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = createAxiosInstance();
  }

  /**
   * Type-safe GET request
   *
   * @example
   * const members = await apiClient.get('/api/v1/projects/{projectId}/members', {
   *   pathParams: { projectId: '123' }
   * });
   */
  async get<P extends PathsForMethod<'get'>>(
    path: P,
    options?: RequestOptions<P, 'get'>
  ): Promise<ResponseType<P, 'get'>> {
    const response = await this.instance.get(path as string, {
      pathParams: options?.pathParams,
      params: options?.params,
      ...options?.config,
    });
    return response.data;
  }

  /**
   * Type-safe POST request
   *
   * @example
   * const member = await apiClient.post('/api/v1/projects/{projectId}/members',
   *   { email: 'user@example.com', role: 'MANAGER' },
   *   { pathParams: { projectId: '123' } }
   * );
   */
  async post<P extends PathsForMethod<'post'>>(
    path: P,
    body: RequestBody<P, 'post'>,
    options?: RequestOptions<P, 'post'>
  ): Promise<ResponseType<P, 'post'>> {
    const response = await this.instance.post(path as string, body, {
      pathParams: options?.pathParams,
      params: options?.params,
      ...options?.config,
    });
    return response.data;
  }

  /**
   * Type-safe PUT request
   *
   * @example
   * const updated = await apiClient.put('/api/v1/projects/{projectId}',
   *   { title: 'New Title' },
   *   { pathParams: { projectId: '123' } }
   * );
   */
  async put<P extends PathsForMethod<'put'>>(
    path: P,
    body: RequestBody<P, 'put'>,
    options?: RequestOptions<P, 'put'>
  ): Promise<ResponseType<P, 'put'>> {
    const response = await this.instance.put(path as string, body, {
      pathParams: options?.pathParams,
      params: options?.params,
      ...options?.config,
    });
    return response.data;
  }

  /**
   * Type-safe PATCH request
   *
   * @example
   * const updated = await apiClient.patch('/api/v1/projects/{projectId}/members/{memberId}',
   *   { role: 'CONTRACTOR' },
   *   { pathParams: { projectId: '123', memberId: '456' } }
   * );
   */
  async patch<P extends PathsForMethod<'patch'>>(
    path: P,
    body: RequestBody<P, 'patch'>,
    options?: RequestOptions<P, 'patch'>
  ): Promise<ResponseType<P, 'patch'>> {
    const response = await this.instance.patch(path as string, body, {
      pathParams: options?.pathParams,
      params: options?.params,
      ...options?.config,
    });
    return response.data;
  }

  /**
   * Type-safe DELETE request
   *
   * @example
   * await apiClient.delete('/api/v1/projects/{projectId}/members/{memberId}', {
   *   pathParams: { projectId: '123', memberId: '456' }
   * });
   */
  async delete<P extends PathsForMethod<'delete'>>(
    path: P,
    options?: RequestOptions<P, 'delete'>
  ): Promise<ResponseType<P, 'delete'>> {
    const response = await this.instance.delete(path as string, {
      pathParams: options?.pathParams,
      params: options?.params,
      ...options?.config,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
