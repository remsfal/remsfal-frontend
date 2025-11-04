import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiClient } from '@/services/ApiClient';

// Mock handlers for testing
const handlers = [
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
];

const server = setupServer(...handlers);

describe('ApiClient', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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
