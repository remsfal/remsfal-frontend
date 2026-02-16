import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSessionStore, type User } from '@/stores/UserSession';
import { apiClient } from '@/services/ApiClient';


describe('UserSession Store', () => {
    let store: ReturnType<typeof useUserSessionStore>;
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useUserSessionStore();
        // Save original fetch
        originalFetch = globalThis.fetch;
        // Mock fetch for login tests
        globalThis.fetch = vi.fn();

        // Mock apiClient.get
        vi.spyOn(apiClient, 'get');
    });


    afterEach(() => {
        // Restore original fetch
        globalThis.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should have null user initially', () => {
            expect(store.user).toBeNull();
        });
    });

    describe('refreshSessionState', () => {
        it('should update user on successful fetch', async () => {
            const mockUser = { email: 'test@example.com' };
            vi.mocked(apiClient.get).mockResolvedValue(mockUser);

            await store.refreshSessionState();

            expect(store.user).toEqual(mockUser);
        });

        it('should set user to null on 401 error', async () => {
            // Simulate 401 error structure
            const error401 = { response: { status: 401 } };
            vi.mocked(apiClient.get).mockRejectedValue(error401);

            // Set user initially to something
            store.user = { email: 'old@example.com' } as User;

            await store.refreshSessionState();

            expect(store.user).toBeNull();
        });

        it('should log error but keep user for other errors', async () => {
            const error500 = { response: { status: 500 } };
            vi.mocked(apiClient.get).mockRejectedValue(error500);
            const consoleSpy = vi.spyOn(console, 'log');

            store.user = { email: 'existing@example.com' } as User;

            await store.refreshSessionState();

            expect(store.user).not.toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Invalid user session:', error500);
        });
    });

    describe('loginDev', () => {
        it('should return true on successful login', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            const result = await store.loginDev();

            expect(result).toBe(true);
            expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/authentication/token', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            }));
        });

        it('should send correct dev parameters in request body', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            await store.loginDev();

            const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]!;
            const body = callArgs[1]?.body as URLSearchParams;
            expect(body.get('app_id')).toBe('dev');
            expect(body.get('app_token')).toBe('dev');
            expect(body.get('dev_services')).toBe('true');
        });

        it('should return false on failed login response', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
            } as Response);

            const result = await store.loginDev();

            expect(result).toBe(false);
        });

        it('should return false on 403 forbidden', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
            } as Response);

            const result = await store.loginDev();

            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

            const result = await store.loginDev();

            expect(result).toBe(false);
        });

        it('should return false on connection timeout', async () => {
            vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Connection timeout'));

            const result = await store.loginDev();

            expect(result).toBe(false);
        });
    });

    describe('loginWithToken', () => {
        it('should call authentication endpoint with token', async () => {
            const testToken = 'test-jwt-token-12345';

            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            await store.loginWithToken(testToken);

            expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/authentication/token', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            }));
        });

        it('should include token in request body', async () => {
            const testToken = 'test-jwt-token-12345';

            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            await store.loginWithToken(testToken);

            const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]!;
            const body = callArgs[1]?.body as URLSearchParams;
            expect(body.get('token')).toBe(testToken);
        });

        it('should throw error on failed token login with status 401', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: false,
                status: 401,
            } as Response);

            await expect(store.loginWithToken('invalid-token')).rejects.toThrow(
                'Token login failed with status 401'
            );
        });

        it('should throw error on failed token login with status 500', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue({
                ok: false,
                status: 500,
            } as Response);

            await expect(store.loginWithToken('test-token')).rejects.toThrow(
                'Token login failed with status 500'
            );
        });

        it('should throw error on network failure', async () => {
            vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

            await expect(store.loginWithToken('test-token')).rejects.toThrow();
        });

        it('should throw error on connection refused', async () => {
            vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Connection refused'));

            await expect(store.loginWithToken('test-token')).rejects.toThrow('Connection refused');
        });
    });
});
