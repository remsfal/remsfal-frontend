import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running as a native app (iOS/Android via Capacitor)
 */
export function isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Check if the app is running in development mode (Vite dev server)
 */
export function isDevMode(): boolean {
    return import.meta.env.DEV;
}

/**
 * Check if the Dev Login should be shown
 * Returns true ONLY if running as native app (Capacitor)
 * Web always uses normal Google authentication
 */
export function shouldShowDevLogin(): boolean {
    return isNativePlatform();
}
