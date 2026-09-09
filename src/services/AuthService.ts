class AuthService {
  async refreshTokens(): Promise<boolean> {
    const response = await fetch('/api/v1/authentication/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return response.status === 204;
  }

  async verifyAdditionalEmail(token: string): Promise<boolean> {
    const response = await fetch(
      `/api/v1/authentication/verify-additional-email?token=${encodeURIComponent(token)}`,
    );
    return response.status === 204;
  }
}

export const authService = new AuthService();
