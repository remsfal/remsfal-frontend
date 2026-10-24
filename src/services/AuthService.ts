/**
 * - `refreshed`: new tokens were issued, the session continues
 * - `expired`: the refresh token is missing, expired or invalid — the session has ended
 * - `unavailable`: the server could not be reached or failed — the session may still be valid
 */
export type RefreshResult = 'refreshed' | 'expired' | 'unavailable';

class AuthService {
  async refreshTokens(): Promise<RefreshResult> {
    let response: Response;
    try {
      response = await fetch('/api/v1/authentication/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Token refresh failed, server not reachable:', error);
      return 'unavailable';
    }
    if (response.status === 204) {
      return 'refreshed';
    }
    if (response.status === 401 || response.status === 403) {
      return 'expired';
    }
    return 'unavailable';
  }

  async verifyAdditionalEmail(token: string): Promise<boolean> {
    const response = await fetch(
      `/api/v1/authentication/verify-additional-email?token=${encodeURIComponent(token)}`,
    );
    return response.status === 204;
  }
}

export const authService = new AuthService();
