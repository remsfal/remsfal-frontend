import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const authHandlers = [
  // POST refresh tokens
  http.post(`${API_BASE}/authentication/refresh`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
