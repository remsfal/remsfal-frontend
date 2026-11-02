import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const authHandlers = [
  // POST refresh tokens
  http.post(`${API_BASE}/authentication/refresh`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // POST request a passwordless email login code
  http.post(`${API_BASE}/authentication/login/email`, () => {
    return new HttpResponse(null, { status: 202 });
  }),

  // POST exchange the email login code for a session
  http.post(`${API_BASE}/authentication/session/email`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET verify additional email
  http.get(`${API_BASE}/authentication/verify-additional-email`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
