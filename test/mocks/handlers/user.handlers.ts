import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const userHandlers = [
  // GET user
  http.get(`${API_BASE}/user`, () => {
    return HttpResponse.json(
      {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      },
      { status: 200 },
    );
  }),

  // GET address with query param
  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('zip') || url.searchParams.get('query[zip]');
    if (zip === '12345') {
      return HttpResponse.json(
        [
          {
            city: 'Sample City',
            countryCode: '',
            province: '',
            street: '',
            zip: '12345',
          },
        ],
        { status: 200 },
      );
    }
    return HttpResponse.json([], { status: 200 });
  }),

  // PATCH user update
  http.patch(`${API_BASE}/user`, async ({ request }) => {
    const updatedUser = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...updatedUser, id: 'user-123' }, { status: 200 });
  }),

  // DELETE user
  http.delete(`${API_BASE}/user`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
