import type { components } from './api/platform-schema';

/**
 * - `refreshed`: new tokens were issued, the session continues
 * - `expired`: the refresh token is missing, expired or invalid — the session has ended
 * - `unavailable`: the server could not be reached or failed — the session may still be valid
 */
export type RefreshResult = 'refreshed' | 'expired' | 'unavailable';

export type EmailLoginRequestJson = components['schemas']['EmailLoginRequestJson'];
export type EmailSessionJson = components['schemas']['EmailSessionJson'];

/** Number of digits of the one-time login code sent by email. */
export const EMAIL_LOGIN_CODE_LENGTH = 8;

/**
 * - `sent`: the request was accepted; a code is sent if the address can receive one
 * - `invalid`: the email address was rejected by the server
 * - `rateLimited`: too many requests, retry after `retryAfter` seconds
 * - `unavailable`: the server could not be reached or failed
 */
export type EmailLoginRequestResult =
  | { status: 'sent' }
  | { status: 'invalid' }
  | { status: 'rateLimited'; retryAfter?: number }
  | { status: 'unavailable' };

/**
 * - `success`: the session cookies are set
 * - `invalidCode`: the code is wrong, expired or already used
 * - `invalid`: the email address or the code is malformed
 * - `rateLimited`: too many attempts, retry after `retryAfter` seconds
 * - `unavailable`: the server could not be reached or failed
 */
export type EmailLoginVerifyResult =
  | { status: 'success' }
  | { status: 'invalidCode' }
  | { status: 'invalid' }
  | { status: 'rateLimited'; retryAfter?: number }
  | { status: 'unavailable' };

function parseRetryAfter(response: Response): number | undefined {
  const seconds = Number.parseInt(response.headers.get('Retry-After') ?? '', 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

// The email login endpoints are called via fetch instead of the apiClient: a 401 for a wrong
// code must neither trigger the token refresh / session-expired handling nor a generic error toast.
async function postJson(url: string, body: object): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.warn(`Request to ${url} failed, server not reachable:`, error);
    return null;
  }
}

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

  async requestEmailLoginCode(email: string, locale?: string): Promise<EmailLoginRequestResult> {
    const body: EmailLoginRequestJson = { email, ...(locale ? { locale } : {}) };
    const response = await postJson('/api/v1/authentication/login/email', body);
    if (response === null) {
      return { status: 'unavailable' };
    }
    if (response.status === 202) {
      return { status: 'sent' };
    }
    if (response.status === 400) {
      return { status: 'invalid' };
    }
    if (response.status === 429) {
      return { status: 'rateLimited', retryAfter: parseRetryAfter(response) };
    }
    return { status: 'unavailable' };
  }

  async verifyEmailLoginCode(email: string, code: string): Promise<EmailLoginVerifyResult> {
    const body: EmailSessionJson = { email, code };
    const response = await postJson('/api/v1/authentication/session/email', body);
    if (response === null) {
      return { status: 'unavailable' };
    }
    if (response.status === 204) {
      return { status: 'success' };
    }
    if (response.status === 401) {
      return { status: 'invalidCode' };
    }
    if (response.status === 400) {
      return { status: 'invalid' };
    }
    if (response.status === 429) {
      return { status: 'rateLimited', retryAfter: parseRetryAfter(response) };
    }
    return { status: 'unavailable' };
  }
}

export const authService = new AuthService();
