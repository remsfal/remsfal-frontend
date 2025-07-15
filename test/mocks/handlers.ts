import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const handlers = [
  // One-time GET /user handler
  http.get(
    `${API_BASE}/user`,
    () => {
      return HttpResponse.json(
        {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        { status: 200 }
      );
    },
    { once: true }
  ),

  // GET /address?zip= handler with query param parsing
  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('zip');

    if (zip === '12345') {
      return HttpResponse.json([{ city: 'Sample City', state: 'SC', zip }], { status: 200 });
    }
    return HttpResponse.json([], { status: 404 });
  }),

  // PATCH /user handler
  http.patch(`${API_BASE}/user`, async ({ request }) => {
    const updatedUser = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ ...updatedUser, id: 'user-123' }, { status: 200 });
  }),

  // DELETE /user handler
  http.delete(`${API_BASE}/user`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
