import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { authService } from '@/services/AuthService';

describe('AuthService with MSW', () => {
  describe('refreshTokens', () => {
    it('should return "refreshed" on 204 response', async () => {
      const result = await authService.refreshTokens();

      expect(result).toBe('refreshed');
    });

    it.each([401, 403])('should return "expired" on %i response', async (status) => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return new HttpResponse(null, { status });
        }),
      );

      const result = await authService.refreshTokens();

      expect(result).toBe('expired');
    });

    it.each([500, 502, 503])('should return "unavailable" on %i response', async (status) => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return new HttpResponse(null, { status });
        }),
      );

      const result = await authService.refreshTokens();

      expect(result).toBe('unavailable');
    });

    it('should return "unavailable" on network errors instead of throwing', async () => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return HttpResponse.error();
        }),
      );
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await authService.refreshTokens();

      expect(result).toBe('unavailable');
      warnSpy.mockRestore();
    });
  });

  describe('verifyAdditionalEmail', () => {
    it('should return true on 204 response', async () => {
      const result = await authService.verifyAdditionalEmail('valid-token');

      expect(result).toBe(true);
    });

    it('should return false on 400 response', async () => {
      server.use(
        http.get('/api/v1/authentication/verify-additional-email', () => {
          return new HttpResponse(null, { status: 400 });
        }),
      );

      const result = await authService.verifyAdditionalEmail('expired-token');

      expect(result).toBe(false);
    });

    it('should return false on 404 response', async () => {
      server.use(
        http.get('/api/v1/authentication/verify-additional-email', () => {
          return new HttpResponse(null, { status: 404 });
        }),
      );

      const result = await authService.verifyAdditionalEmail('invalid-token');

      expect(result).toBe(false);
    });

    it('should propagate network errors', async () => {
      server.use(
        http.get('/api/v1/authentication/verify-additional-email', () => {
          return HttpResponse.error();
        }),
      );

      await expect(authService.verifyAdditionalEmail('valid-token')).rejects.toThrow();
    });
  });

  describe('requestEmailLoginCode', () => {
    it('should send email and locale as JSON and return "sent" on 202', async () => {
      let body: unknown;
      server.use(
        http.post('/api/v1/authentication/login/email', async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 202 });
        }),
      );

      const result = await authService.requestEmailLoginCode('user@example.com', 'de');

      expect(result).toEqual({ status: 'sent' });
      expect(body).toEqual({ email: 'user@example.com', locale: 'de' });
    });

    it('should omit the locale when none is given', async () => {
      let body: unknown;
      server.use(
        http.post('/api/v1/authentication/login/email', async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 202 });
        }),
      );

      await authService.requestEmailLoginCode('user@example.com');

      expect(body).toEqual({ email: 'user@example.com' });
    });

    it('should return "invalid" on 400', async () => {
      server.use(
        http.post('/api/v1/authentication/login/email', () => new HttpResponse(null, { status: 400 })),
      );

      expect(await authService.requestEmailLoginCode('nope')).toEqual({ status: 'invalid' });
    });

    it('should return "rateLimited" with the Retry-After seconds on 429', async () => {
      server.use(
        http.post('/api/v1/authentication/login/email', () =>
          new HttpResponse(null, { status: 429, headers: { 'Retry-After': '900' } })),
      );

      expect(await authService.requestEmailLoginCode('user@example.com'))
        .toEqual({ status: 'rateLimited', retryAfter: 900 });
    });

    it('should return "rateLimited" without retryAfter if the header is missing', async () => {
      server.use(
        http.post('/api/v1/authentication/login/email', () => new HttpResponse(null, { status: 429 })),
      );

      expect(await authService.requestEmailLoginCode('user@example.com'))
        .toEqual({ status: 'rateLimited', retryAfter: undefined });
    });

    it('should return "unavailable" on 500', async () => {
      server.use(
        http.post('/api/v1/authentication/login/email', () => new HttpResponse(null, { status: 500 })),
      );

      expect(await authService.requestEmailLoginCode('user@example.com')).toEqual({ status: 'unavailable' });
    });

    it('should return "unavailable" on network errors instead of throwing', async () => {
      server.use(http.post('/api/v1/authentication/login/email', () => HttpResponse.error()));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(await authService.requestEmailLoginCode('user@example.com')).toEqual({ status: 'unavailable' });
      warnSpy.mockRestore();
    });
  });

  describe('verifyEmailLoginCode', () => {
    it('should send email and code as JSON and return "success" on 204', async () => {
      let body: unknown;
      server.use(
        http.post('/api/v1/authentication/session/email', async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const result = await authService.verifyEmailLoginCode('user@example.com', '12345678');

      expect(result).toEqual({ status: 'success' });
      expect(body).toEqual({ email: 'user@example.com', code: '12345678' });
    });

    it.each([
      [401, { status: 'invalidCode' }],
      [400, { status: 'invalid' }],
      [500, { status: 'unavailable' }],
    ])('should map status %i', async (status, expected) => {
      server.use(
        http.post('/api/v1/authentication/session/email', () => new HttpResponse(null, { status })),
      );

      expect(await authService.verifyEmailLoginCode('user@example.com', '12345678')).toEqual(expected);
    });

    it('should return "rateLimited" with the Retry-After seconds on 429', async () => {
      server.use(
        http.post('/api/v1/authentication/session/email', () =>
          new HttpResponse(null, { status: 429, headers: { 'Retry-After': '60' } })),
      );

      expect(await authService.verifyEmailLoginCode('user@example.com', '12345678'))
        .toEqual({ status: 'rateLimited', retryAfter: 60 });
    });

    it('should return "unavailable" on network errors instead of throwing', async () => {
      server.use(http.post('/api/v1/authentication/session/email', () => HttpResponse.error()));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(await authService.verifyEmailLoginCode('user@example.com', '12345678'))
        .toEqual({ status: 'unavailable' });
      warnSpy.mockRestore();
    });
  });
});
