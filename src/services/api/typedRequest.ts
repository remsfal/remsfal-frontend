import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import type { paths as chatPaths } from './chat-schema';
import type { paths as platformPaths } from './platform-schema';
import type { paths as notificationPaths } from './notification-schema';

// Combine all OpenAPI paths
export type paths = chatPaths & platformPaths & notificationPaths;

type Path = keyof paths;
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';
type Method = HttpMethod & keyof paths[Path];

// Extract request params if defined in OpenAPI
export type RequestParams<P extends Path, M extends Method> = paths[P][M] extends {
  parameters?: infer Params;
}
  ? Params
  : undefined;

// Extract request body if defined in OpenAPI
export type RequestBody<P extends Path, M extends Method> = paths[P][M] extends {
  requestBody?: { content: { 'application/json': infer Body } };
}
  ? Body
  : undefined;

// Extract 200 OK response type if defined in OpenAPI
export type ResponseType<P extends Path, M extends Method> = paths[P][M] extends {
  responses: { 200: { content: { 'application/json': infer Res } } };
}
  ? Res
  : unknown;

// Flatten nested query parameters
function flattenParams(obj: Record<string, any>, prefix = ''): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (typeof value === 'object' && value !== null) {
        Object.assign(acc, flattenParams(value, fullKey));
      } else {
        acc[fullKey] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

// Typed request
export async function typedRequest<P extends Path, M extends Method, Res = ResponseType<P, M>>(
  method: M,
  path: P,
  options: {
    params?: RequestParams<P, M>;
    body?: RequestBody<P, M>;
    config?: AxiosRequestConfig;
    pathParams?: Record<string, string | number>;
  } = {},
): Promise<Res> {
  let url = path as string;

  const pathParamMatches = Array.from(url.matchAll(/{([^}]+)}/g));
  for (const match of pathParamMatches) {
    const paramName = match[1];
    const value = options.pathParams?.[paramName];
    if (value === undefined) throw new Error(`Missing path parameter: ${paramName}`);
    url = url.replace(`{${paramName}}`, encodeURIComponent(String(value)));
  }

  const queryParams = flattenParams(
    Object.entries(options.params ?? {}).reduce(
      (acc, [k, v]) => {
        if (!pathParamMatches.some((m) => m[1] === k)) acc[k] = v;
        return acc;
      },
      {} as Record<string, any>,
    ),
  );

  const response = await axios.request({
    method,
    url,
    params: queryParams,
    data: options.body,
    ...options.config,
  });

  return response.data as Res;
}
