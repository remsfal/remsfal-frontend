import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import type { AxiosError } from 'axios';
import { server } from '../mocks/server';
import { apiClient, requestErrorHandler, replacePlaceholders } from '@/services/ApiClient';
import type { PathsForMethod, RequestOptions } from '@/services/ApiClient';
import { authService } from '@/services/AuthService';
import { setActivePinia, createPinia } from 'pinia';
import { useEventBus } from '@/stores/EventStore';

describe('ApiClient', () => {
  // Set up test-specific handlers for ApiClient testing
  beforeEach(() => {
    server.use(
      http.get('/api/v1/test', () => {
        return HttpResponse.json({ message: 'GET success' });
      }),
      http.get('/api/v1/test/:id', ({ params }) => {
        return HttpResponse.json({ id: params.id, message: 'GET with path param' });
      }),
      http.post('/api/v1/test', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...body, created: true }, { status: 201 });
      }),
      http.put('/api/v1/test/:id', async ({ request, params }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          ...body, id: params.id, updated: true
        });
      }),
      http.patch('/api/v1/test/:id', async ({ request, params }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          ...body, id: params.id, patched: true
        });
      }),
      http.delete('/api/v1/test/:id', ({ params }) => {
        return HttpResponse.json({ id: params.id, deleted: true });
      }),
      http.get('/api/v1/error', () => {
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
      }),
    );
  });

  describe('GET requests', () => {
    it('should perform a simple GET request', async () => {
      // '/api/v1/test' is an intentionally-fake test path, not part of the real OpenAPI paths union.
      const result = await apiClient.get('/api/v1/test' as unknown as PathsForMethod<'get'>);
      expect(result).toEqual({ message: 'GET success' });
    });

    it('should perform a GET request with path parameters', async () => {
      // Intentionally-fake test path.
      const result = await apiClient.get(
        '/api/v1/test/{id}' as unknown as PathsForMethod<'get'>,
        {pathParams: { id: '123' },},
      );
      expect(result).toEqual({ id: '123', message: 'GET with path param' });
    });

    it('should perform a GET request with query parameters', async () => {
      server.use(
        http.get('/api/v1/test', ({ request }) => {
          const url = new URL(request.url);
          const filter = url.searchParams.get('filter');
          return HttpResponse.json({ filter });
        }),
      );

      // Intentionally-fake test path; options cast the same way since the query shape isn't
      // part of the real OpenAPI types for this fake path.
      const result = await apiClient.get(
        '/api/v1/test' as unknown as PathsForMethod<'get'>,
        {params: { filter: 'active' },} as unknown as RequestOptions<PathsForMethod<'get'>, 'get'>,
      );
      expect(result).toEqual({ filter: 'active' });
    });
  });

  describe('POST requests', () => {
    it('should perform a POST request with body', async () => {
      // Intentionally-fake test path.
      const result = await apiClient.post(
        '/api/v1/test' as unknown as PathsForMethod<'post'>,
        { name: 'Test Item' },
        {},
      );
      expect(result).toEqual({ name: 'Test Item', created: true });
    });

    it('should perform a POST request with path parameters', async () => {
      server.use(
        http.post('/api/v1/test/:projectId/items', async ({ request, params }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...body, projectId: params.projectId }, { status: 201 });
        }),
      );

      // Intentionally-fake test path.
      const result = await apiClient.post(
        '/api/v1/test/{projectId}/items' as unknown as PathsForMethod<'post'>,
        { name: 'New Item' },
        { pathParams: { projectId: 'project-123' } },
      );
      expect(result).toEqual({ name: 'New Item', projectId: 'project-123' });
    });
  });

  describe('PUT requests', () => {
    it('should perform a PUT request with body and path parameters', async () => {
      // Intentionally-fake test path.
      const result = await apiClient.put(
        '/api/v1/test/{id}' as unknown as PathsForMethod<'put'>,
        { name: 'Updated Item' },
        { pathParams: { id: '456' } },
      );
      expect(result).toEqual({
        name: 'Updated Item', id: '456', updated: true 
      });
    });
  });

  describe('PATCH requests', () => {
    it('should perform a PATCH request with body and path parameters', async () => {
      // Intentionally-fake test path.
      const result = await apiClient.patch(
        '/api/v1/test/{id}' as unknown as PathsForMethod<'patch'>,
        { name: 'Patched Item' },
        { pathParams: { id: '789' } },
      );
      expect(result).toEqual({
        name: 'Patched Item', id: '789', patched: true 
      });
    });
  });

  describe('DELETE requests', () => {
    it('should perform a DELETE request with path parameters', async () => {
      // Intentionally-fake test path.
      const result = await apiClient.delete(
        '/api/v1/test/{id}' as unknown as PathsForMethod<'delete'>,
        {pathParams: { id: '999' },},
      );
      expect(result).toEqual({ id: '999', deleted: true });
    });
  });

  describe('Error handling', () => {
    it('should handle server errors', async () => {
      // Intentionally-fake test path.
      await expect(
        apiClient.get('/api/v1/error' as unknown as PathsForMethod<'get'>),
      ).rejects.toThrow();
    });

    it('should throw error for missing path parameters', async () => {
      // Intentionally-fake test path.
      await expect(
        apiClient.get('/api/v1/test/{id}' as unknown as PathsForMethod<'get'>, {pathParams: {},}),
      ).rejects.toThrow();
    });
  });

  describe('401 retry logic', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
      vi.spyOn(authService, 'refreshTokens');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should retry the request after a successful token refresh on 401', async () => {
      let callCount = 0;
      server.use(
        http.get('/api/v1/retry-test', () => {
          callCount += 1;
          if (callCount === 1) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
          return HttpResponse.json({ message: 'retry success' });
        }),
      );
      vi.mocked(authService.refreshTokens).mockResolvedValue(true);

      // Intentionally-fake test path.
      const result = await apiClient.get('/api/v1/retry-test' as unknown as PathsForMethod<'get'>);

      expect(authService.refreshTokens).toHaveBeenCalledOnce();
      expect(result).toEqual({ message: 'retry success' });
    });

    it('should emit auth:session-expired and reject when refresh token is expired', async () => {
      server.use(
        http.get('/api/v1/retry-test', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );
      vi.mocked(authService.refreshTokens).mockResolvedValue(false);

      const bus = useEventBus();
      const sessionExpiredHandler = vi.fn();
      bus.on('auth:session-expired', sessionExpiredHandler);

      // Intentionally-fake test path.
      await expect(
        apiClient.get('/api/v1/retry-test' as unknown as PathsForMethod<'get'>),
      ).rejects.toBeDefined();

      expect(authService.refreshTokens).toHaveBeenCalledOnce();
      expect(sessionExpiredHandler).toHaveBeenCalledOnce();
    });

    it('should emit auth:session-expired when refresh throws an error', async () => {
      server.use(
        http.get('/api/v1/retry-test', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );
      vi.mocked(authService.refreshTokens).mockRejectedValue(new Error('Network error'));

      const bus = useEventBus();
      const sessionExpiredHandler = vi.fn();
      bus.on('auth:session-expired', sessionExpiredHandler);

      // Intentionally-fake test path.
      await expect(
        apiClient.get('/api/v1/retry-test' as unknown as PathsForMethod<'get'>),
      ).rejects.toBeDefined();

      expect(sessionExpiredHandler).toHaveBeenCalledOnce();
    });

    it('should not retry a request that already has _retry flag set', async () => {
      server.use(
        http.get('/api/v1/retry-test', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );
      vi.mocked(authService.refreshTokens).mockResolvedValue(true);

      const bus = useEventBus();
      const sessionExpiredHandler = vi.fn();
      bus.on('auth:session-expired', sessionExpiredHandler);

      // The retry request also returns 401, so the second 401 should NOT trigger another refresh
      // (because _retry is set) and should emit session-expired instead
      // Intentionally-fake test path.
      await expect(
        apiClient.get('/api/v1/retry-test' as unknown as PathsForMethod<'get'>),
      ).rejects.toBeDefined();

      // refreshTokens was called for the first 401, but the retried request also returns 401
      // The second 401 hits the else branch (non-401 toast) since _retry is set
      expect(authService.refreshTokens).toHaveBeenCalledOnce();
    });
  });

  describe('Path parameter replacement', () => {
    it('should handle numeric path parameters', async () => {
      server.use(
        http.get('/api/v1/test/:id', ({ params }) => {
          return HttpResponse.json({ id: params.id, type: typeof params.id });
        }),
      );

      // Intentionally-fake test path; response shape isn't known to the OpenAPI types, so the
      // result is cast to the shape the mock handler actually returns.
      const result = (await apiClient.get(
        '/api/v1/test/{id}' as unknown as PathsForMethod<'get'>,
        {pathParams: { id: 123 },},
      )) as { id: string; type: string };
      expect(result.id).toBe('123'); // URL params are always strings
    });

    it('should handle multiple path parameters', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/items/:itemId', ({ params }) => {
          return HttpResponse.json({
            projectId: params.projectId,
            itemId: params.itemId,
          });
        }),
      );

      // Intentionally-fake test path.
      const result = await apiClient.get(
        '/api/v1/projects/{projectId}/items/{itemId}' as unknown as PathsForMethod<'get'>,
        {pathParams: { projectId: 'proj-1', itemId: 'item-1' },},
      );
      expect(result).toEqual({ projectId: 'proj-1', itemId: 'item-1' });
    });

    it('should URL-encode path parameters', async () => {
      server.use(
        http.get('/api/v1/test/:id', ({ params }) => {
          // MSW automatically decodes URL params, so we receive the decoded value
          return HttpResponse.json({ id: params.id });
        }),
      );

      // Intentionally-fake test path; cast result to the shape the mock handler returns.
      const result = (await apiClient.get(
        '/api/v1/test/{id}' as unknown as PathsForMethod<'get'>,
        {pathParams: { id: 'test with spaces' },},
      )) as { id: string };
      // MSW decodes the param, so we get the original string back
      expect(result.id).toBe('test with spaces');
    });

    it('should throw when a path template mixes styles and leaves an unreplaced placeholder', async () => {
      // The default placeholder style is 'curly'; a template that also contains a ':colon'
      // segment is left untouched by the curly-only replacement and trips the leftover-check.
      await expect(
        apiClient.get(
          '/api/v1/test/:legacy/{id}' as unknown as PathsForMethod<'get'>,
          {pathParams: { id: '1' },},
        ),
      ).rejects.toThrow('Not all path parameters were replaced');
    });
  });

  describe('Response body validation', () => {
    it('should emit an error toast when a 200 response has no body', async () => {
      server.use(
        http.get('/api/v1/empty-body', () => {
          // A literal JSON "null" body — axios parses it to response.data === null,
          // unlike a truly empty body, which axios normalizes to '' (a valid falsy value).
          return HttpResponse.json(null, { status: 200 });
        }),
      );

      setActivePinia(createPinia());
      const bus = useEventBus();
      const toastHandler = vi.fn();
      bus.on('toast:translate', toastHandler);

      // Intentionally-fake test path.
      await apiClient.get('/api/v1/empty-body' as unknown as PathsForMethod<'get'>);

      expect(toastHandler).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'error.apiResponse' }),
      );
    });

    it('should not validate the body for non-2xx responses treated as success', async () => {
      // responseHandler only runs its body-shape checks for 2xx responses. A custom
      // validateStatus lets a 404 be treated as fulfilled (instead of routing through the
      // response error interceptor), so we can reach responseHandler with an out-of-range status.
      server.use(
        http.get('/api/v1/not-found-but-ok', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }),
      );

      setActivePinia(createPinia());
      const bus = useEventBus();
      const toastHandler = vi.fn();
      bus.on('toast:translate', toastHandler);

      const result = await apiClient.get(
        '/api/v1/not-found-but-ok' as unknown as PathsForMethod<'get'>,
        { config: { validateStatus: () => true } } as unknown as RequestOptions<PathsForMethod<'get'>, 'get'>,
      );

      expect(result).toEqual({ message: 'Not Found' });
      expect(toastHandler).not.toHaveBeenCalled();
    });
  });

  describe('Concurrent 401 handling', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
      vi.spyOn(authService, 'refreshTokens');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should queue a second concurrent request while a refresh is in flight', async () => {
      let refreshCallCount = 0;
      server.use(
        http.get('/api/v1/concurrent-test', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      vi.mocked(authService.refreshTokens).mockImplementation(async () => {
        refreshCallCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 20));
        server.use(
          http.get('/api/v1/concurrent-test', () => {
            return HttpResponse.json({ message: 'success after refresh' });
          }),
        );
        return true;
      });

      // Intentionally-fake test path.
      const [first, second] = await Promise.all([
        apiClient.get('/api/v1/concurrent-test' as unknown as PathsForMethod<'get'>),
        apiClient.get('/api/v1/concurrent-test' as unknown as PathsForMethod<'get'>),
      ]);

      expect(refreshCallCount).toBe(1);
      expect(first).toEqual({ message: 'success after refresh' });
      expect(second).toEqual({ message: 'success after refresh' });
    });

    it('should reject a queued concurrent request when the in-flight refresh fails', async () => {
      server.use(
        http.get('/api/v1/concurrent-fail-test', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      vi.mocked(authService.refreshTokens).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return false;
      });

      // Intentionally-fake test path.
      const results = await Promise.allSettled([
        apiClient.get('/api/v1/concurrent-fail-test' as unknown as PathsForMethod<'get'>),
        apiClient.get('/api/v1/concurrent-fail-test' as unknown as PathsForMethod<'get'>),
      ]);

      expect(results[0].status).toBe('rejected');
      expect(results[1].status).toBe('rejected');
      expect(authService.refreshTokens).toHaveBeenCalledOnce();
    });
  });

  describe('replacePlaceholders (internal helper)', () => {
    // Exercised directly rather than through apiClient — requestHandler always calls this
    // helper with explicit pathParams/style arguments, so its default-parameter branches and
    // the 'colon'/'both' placeholder styles are otherwise unreachable through the real
    // interceptor chain.
    it('throws a missing-parameter error when called with only a template (default pathParams/style)', () => {
      expect(() => replacePlaceholders('/api/v1/test/{id}')).toThrow('Missing path parameter: "id"');
    });

    it('replaces colon-style placeholders', () => {
      expect(replacePlaceholders('/api/v1/test/:id', { id: '42' }, 'colon')).toBe('/api/v1/test/42');
    });

    it('replaces a colon-style placeholder when using the "both" style', () => {
      expect(replacePlaceholders('/api/v1/test/:id/{name}', { id: '42', name: 'x' }, 'both'))
        .toBe('/api/v1/test/42/x');
    });
  });

  describe('requestErrorHandler', () => {
    it('logs the error, emits an error toast, and rejects with the original error', async () => {
      setActivePinia(createPinia());
      const bus = useEventBus();
      const toastHandler = vi.fn();
      bus.on('toast:translate', toastHandler);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('boom') as AxiosError;

      await expect(requestErrorHandler(error)).rejects.toBe(error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(toastHandler).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'error.apiRequest' }),
      );
    });
  });
});
