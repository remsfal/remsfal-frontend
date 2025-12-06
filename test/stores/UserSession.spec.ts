import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSessionStore } from '../../src/stores/UserSession';

describe('UserSession Store', () => {
    let store: ReturnType<typeof useUserSessionStore>;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useUserSessionStore();
        // Save original fetch
        originalFetch = global.fetch;
        // Mock fetch for login tests
        global.fetch = vi.fn();
    });

    afterEach(() => {
        // Restore original fetch
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should have null user initially', () => {
            expect(store.user).toBeNull();
        });
    });

    describe('loginDev', () => {
        it('should return true on successful login', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            const result = await store.loginDev();

            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith('/api/v1/authentication/token', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            }));
        });

        it('should send correct dev parameters in request body', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            await store.loginDev();

            const callArgs = vi.mocked(global.fetch).mock.calls[0]!;
            const body = callArgs[1]?.body as URLSearchParams;
            expect(body.get('app_id')).toBe('dev');
            expect(body.get('app_token')).toBe('dev');
            expect(body.get('dev_services')).toBe('true');
        });

        it('should return false on failed login response', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
            } as Response);

            const result = await store.loginDev();

            expect(result).toBe(false);
        });

        it('should return false on 403 forbidden', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
            } as Response);

            const result = await store.loginDev();

            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

            const result = await store.loginDev();

            expect(result).toBe(false);
        });

        it('should return false on connection timeout', async () => {
            vi.mocked(global.fetch).mockRejectedValue(new Error('Connection timeout'));

            const result = await store.loginDev();

            expect(result).toBe(false);
        });
    });

    describe('loginWithToken', () => {
        it('should call authentication endpoint with token', async () => {
            const testToken = 'test-jwt-token-12345';

            vi.mocked(global.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            await store.loginWithToken(testToken);

            expect(global.fetch).toHaveBeenCalledWith('/api/v1/authentication/token', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            }));
        });

        it('should include token in request body', async () => {
            const testToken = 'test-jwt-token-12345';

            vi.mocked(global.fetch).mockResolvedValue({
                ok: true,
                status: 200,
            } as Response);

            await store.loginWithToken(testToken);

            const callArgs = vi.mocked(global.fetch).mock.calls[0]!;
            const body = callArgs[1]?.body as URLSearchParams;
            expect(body.get('token')).toBe(testToken);
        });

        it('should throw error on failed token login with status 401', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 401,
            } as Response);

            await expect(store.loginWithToken('invalid-token')).rejects.toThrow(
                'Token login failed with status 401'
            );
        });

        it('should throw error on failed token login with status 500', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 500,
            } as Response);

            await expect(store.loginWithToken('test-token')).rejects.toThrow(
                'Token login failed with status 500'
            );
        });

        it('should throw error on network failure', async () => {
            vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

            await expect(store.loginWithToken('test-token')).rejects.toThrow();
        });

        it('should throw error on connection refused', async () => {
            vi.mocked(global.fetch).mockRejectedValue(new Error('Connection refused'));

            await expect(store.loginWithToken('test-token')).rejects.toThrow('Connection refused');
        });
    });
});
