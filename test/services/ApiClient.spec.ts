import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { apiClient } from '@/services/ApiClient';
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
        const body = await request.json();
        return HttpResponse.json({ ...body, created: true }, { status: 201 });
      }),
      http.put('/api/v1/test/:id', async ({ request, params }) => {
        const body = await request.json();
        return HttpResponse.json({
            ...body, id: params.id, updated: true
        });
      }),
      http.patch('/api/v1/test/:id', async ({ request, params }) => {
        const body = await request.json();
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
      const result = await apiClient.get('/api/v1/test');
      expect(result).toEqual({ message: 'GET success' });
    });

    it('should perform a GET request with path parameters', async () => {
      const result = await apiClient.get('/api/v1/test/{id}', {pathParams: { id: '123' },});
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

      const result = await apiClient.get('/api/v1/test', {params: { filter: 'active' },});
      expect(result).toEqual({ filter: 'active' });
    });
  });

  describe('POST requests', () => {
    it('should perform a POST request with body', async () => {
      const result = await apiClient.post(
        '/api/v1/test',
        { name: 'Test Item' },
        {},
      );
      expect(result).toEqual({ name: 'Test Item', created: true });
    });

    it('should perform a POST request with path parameters', async () => {
      server.use(
        http.post('/api/v1/test/:projectId/items', async ({ request, params }) => {
          const body = await request.json();
          return HttpResponse.json({ ...body, projectId: params.projectId }, { status: 201 });
        }),
      );

      const result = await apiClient.post(
        '/api/v1/test/{projectId}/items',
        { name: 'New Item' },
        { pathParams: { projectId: 'project-123' } },
      );
      expect(result).toEqual({ name: 'New Item', projectId: 'project-123' });
    });
  });

  describe('PUT requests', () => {
    it('should perform a PUT request with body and path parameters', async () => {
      const result = await apiClient.put(
        '/api/v1/test/{id}',
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
      const result = await apiClient.patch(
        '/api/v1/test/{id}',
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
      const result = await apiClient.delete('/api/v1/test/{id}', {pathParams: { id: '999' },});
      expect(result).toEqual({ id: '999', deleted: true });
    });
  });

  describe('Error handling', () => {
    it('should handle server errors', async () => {
      await expect(apiClient.get('/api/v1/error')).rejects.toThrow();
    });

    it('should throw error for missing path parameters', async () => {
      await expect(
        apiClient.get('/api/v1/test/{id}', {pathParams: {},}),
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

      const result = await apiClient.get('/api/v1/retry-test');

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

      await expect(apiClient.get('/api/v1/retry-test')).rejects.toBeDefined();

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

      await expect(apiClient.get('/api/v1/retry-test')).rejects.toBeDefined();

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
      await expect(apiClient.get('/api/v1/retry-test')).rejects.toBeDefined();

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

      const result = await apiClient.get('/api/v1/test/{id}', {pathParams: { id: 123 },});
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

      const result = await apiClient.get(
        '/api/v1/projects/{projectId}/items/{itemId}',
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

      const result = await apiClient.get('/api/v1/test/{id}', {pathParams: { id: 'test with spaces' },});
      // MSW decodes the param, so we get the original string back
      expect(result.id).toBe('test with spaces');
    });
  });
});
