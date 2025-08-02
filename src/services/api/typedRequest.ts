import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import type { paths as chatPaths } from './chat-schema';
import type { paths as platformPaths } from './platform-schema';
import type { paths as notificationPaths } from './notification-schema';

// Correctly combine all OpenAPI paths
export type paths = chatPaths & platformPaths & notificationPaths;

type Path = keyof paths;

// Restrict Method to known HTTP verbs that can appear as keys in paths[Path]
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

// Intersection ensures M is both a valid HTTP method and a key in paths[Path]
type Method = HttpMethod & keyof paths[Path];

// Extract request params if defined in OpenAPI
export type RequestParams<
  P extends Path,
  M extends Method
> = paths[P][M] extends { parameters?: infer Params } ? Params : unknown;

// Extract request body if defined in OpenAPI
export type RequestBody<
  P extends Path,
  M extends Method
> = paths[P][M] extends {
  requestBody?: { content: { 'application/json': infer Body } };
}
  ? Body
  : undefined;

// Extract 200 OK response type if defined in OpenAPI
export type ResponseType<
  P extends Path,
  M extends Method
> = paths[P][M] extends {
  responses: { 200: { content: { 'application/json': infer Res } } };
}
  ? Res
  : unknown;

// Utility to flatten nested query parameters into query string keys
function flattenParams(obj: Record<string, any>, prefix = ''): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flattenParams(value, fullKey));
    } else {
      acc[fullKey] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

// Main typedRequest function with full typings and path param support
export async function typedRequest<
  P extends Path,
  M extends Method
>(
  method: M,
  path: P,
  options: {
    params?: RequestParams<P, M>;
    body?: RequestBody<P, M>;
    config?: AxiosRequestConfig;
    pathParams?: Record<string, string | number>;
  } = {}
): Promise<ResponseType<P, M>> {
  let url = path as string;
  const rawParams = options.params ?? {};

  // Replace path parameters like {id} with actual values from options.pathParams
  const pathParamMatches = Array.from(url.matchAll(/{([^}]+)}/g));
  for (const match of pathParamMatches) {
    const paramName = match[1];
    const value = options.pathParams?.[paramName];
    if (value === undefined) {
      throw new Error(`Missing path parameter: ${paramName}`);
    }
    url = url.replace(`{${paramName}}`, encodeURIComponent(String(value)));
  }

  // Extract and flatten query parameters (exclude path params)
  const queryParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (!pathParamMatches.some((match) => match[1] === key)) {
      queryParams[key] = value;
    }
  }
  const flattenedQueryParams = flattenParams(queryParams);

  const response = await axios.request({
    method,
    url,
    params: flattenedQueryParams,
    data: options.body,
    ...options.config,
  });

  console.debug('typedRequest response:', response);
  return response.data;
}
