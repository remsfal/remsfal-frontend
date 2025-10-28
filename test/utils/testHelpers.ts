import { setupServer, SetupServer } from 'msw/node';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse, HttpHandler } from 'msw';

/**
 * Sets up MSW server with lifecycle hooks for tests
 * @param handlers - MSW request handlers
 * @returns The configured MSW server instance
 */
export function setupTestServer(...handlers: HttpHandler[]): SetupServer {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
}

/**
 * Sets up lifecycle hooks for an existing MSW server
 * Useful when using a shared server from ../mocks/server
 * @param server - Existing MSW server instance
 */
export function useTestServer(server: SetupServer): void {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

/**
 * Common error status codes for testing
 */
export const ErrorStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
} as const;

/**
 * Creates an error response for MSW handlers
 * @param message - Error message
 * @param status - HTTP status code
 */
export function createErrorResponse(message: string, status: number) {
  return HttpResponse.json({ message }, { status });
}

/**
 * Test helper to verify that a promise rejects
 * @param promise - Promise that should reject
 */
export async function expectToReject(promise: Promise<unknown>) {
  await expect(promise).rejects.toThrow();
}

/**
 * Creates a temporary error handler override for MSW server
 * @param server - MSW server instance
 * @param path - API path to override
 * @param method - HTTP method ('get', 'post', 'patch', 'put', 'delete')
 * @param status - HTTP status code for the error
 * @param message - Error message (defaults to generic message based on status)
 */
export function createErrorHandler(
  server: SetupServer,
  path: string,
  method: keyof typeof http,
  status: number,
  message?: string,
) {
  const defaultMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Validation Error',
    500: 'Server Error',
  };

  server.use(http[method](path, () => createErrorResponse(message || defaultMessages[status] || 'Error', status)));
}

/**
 * Helper to test error handling for a service method
 * @param server - MSW server instance
 * @param path - API endpoint path
 * @param method - HTTP method
 * @param status - HTTP status code to test
 * @param serviceCall - Function that calls the service method
 */
export async function testErrorHandling(
  server: SetupServer,
  path: string,
  method: keyof typeof http,
  status: number,
  serviceCall: () => Promise<unknown>,
) {
  createErrorHandler(server, path, method, status);
  await expectToReject(serviceCall());
}
