import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import type { paths as chatPaths } from './chat-schema';
import type { paths as platformPaths } from './platform-schema';
import type { paths as notificationPaths } from './notification-schema';

export type paths = notificationPaths & chatPaths & platformPaths;

type Path = keyof paths;
type Method = keyof paths[Path];

export type RequestParams<
  P extends Path,
  M extends Method
> = paths[P][M] extends { parameters?: infer Params } ? Params : unknown;

export type RequestBody<
  P extends Path,
  M extends Method
> = paths[P][M] extends { requestBody?: { content: { 'application/json': infer Body } } }
  ? Body
  : undefined;

export type ResponseType<
  P extends Path,
  M extends Method
> = paths[P][M] extends { responses: { 200: { content: { 'application/json': infer Res } } } }
  ? Res& RequestParams<P, M>
  : unknown;

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
  }
): Promise<ResponseType<P, M>> {
  let url = path as string;
  const rawParams = options.params || {};

  const pathParamMatches = Array.from(url.matchAll(/{([^}]+)}/g));
  const queryParams: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawParams)) {
    const isPathParam = pathParamMatches.find((match) => match[1] === key);
    if (isPathParam) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    } else {
      queryParams[key] = value;
    }
  }

  const response = await axios.request({
    method,
    url,
    params: queryParams,
    data: options.body,
    ...options.config,
  });
  console.debug(response)
  return response.data;
}
