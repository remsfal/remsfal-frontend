import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '@/services/AuthService';

describe('AuthService', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('refreshTokens', () => {
    it('should return true on 204 response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ status: 204 } as Response);

      const result = await authService.refreshTokens();

      expect(result).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/authentication/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should return false on 401 response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ status: 401 } as Response);

      const result = await authService.refreshTokens();

      expect(result).toBe(false);
    });

    it('should return false on 403 response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ status: 403 } as Response);

      const result = await authService.refreshTokens();

      expect(result).toBe(false);
    });

    it('should return false on 500 response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ status: 500 } as Response);

      const result = await authService.refreshTokens();

      expect(result).toBe(false);
    });

    it('should propagate network errors', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

      await expect(authService.refreshTokens()).rejects.toThrow('Network error');
    });
  });
});
