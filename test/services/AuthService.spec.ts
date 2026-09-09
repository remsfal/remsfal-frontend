import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { authService } from '@/services/AuthService';

describe('AuthService with MSW', () => {
  describe('refreshTokens', () => {
    it('should return true on 204 response', async () => {
      const result = await authService.refreshTokens();

      expect(result).toBe(true);
    });

    it('should return false on 401 response', async () => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return new HttpResponse(null, { status: 401 });
        }),
      );

      const result = await authService.refreshTokens();

      expect(result).toBe(false);
    });

    it('should return false on 403 response', async () => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return new HttpResponse(null, { status: 403 });
        }),
      );

      const result = await authService.refreshTokens();

      expect(result).toBe(false);
    });

    it('should return false on 500 response', async () => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const result = await authService.refreshTokens();

      expect(result).toBe(false);
    });

    it('should propagate network errors', async () => {
      server.use(
        http.post('/api/v1/authentication/refresh', () => {
          return HttpResponse.error();
        }),
      );

      await expect(authService.refreshTokens()).rejects.toThrow();
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
});
