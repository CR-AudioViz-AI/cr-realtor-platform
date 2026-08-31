// =============================================================================
// PWA HOOK - Service Worker & Install Prompt
// CR AudioViz AI - Realtor Platform
// Created: Monday, December 30, 2025 | 3:04 PM EST
// Phase 5: PWA + Offline Support
// =============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isUpdateAvailable: false,
    registration: null,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if app is installed (standalone mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setState(prev => ({ ...prev, isInstalled: isStandalone }));
  }, []);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState(prev => ({ ...prev, registration }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        // Periodic update check
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        console.log('[PWA] Service worker registered');
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    };

    registerSW();
  }, []);

  // Handle install prompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ ...prev, isInstallable: false, isInstalled: true }));
      console.log('[PWA] App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ ...prev, isInstallable: false }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Update app
  const updateApp = useCallback(async () => {
    if (!state.registration?.waiting) return;

    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload when the new service worker takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, [state.registration]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    
    if (Notification.permission === 'granted') return 'granted';
    
    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!state.registration) return null;

    try {
      const subscription = await state.registration.pushManager.subscribe({
        userVisibleOnly: true,
        // 2026-08-30: .buffer, because PushSubscriptionOptions wants a BufferSource and
        // TypeScript 5.7 made Uint8Array generic over its ArrayBufferLike, so the bare
        // array no longer satisfies it.
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }, [state.registration]);

  return {
    ...state,
    promptInstall,
    updateApp,
    requestNotificationPermission,
    subscribeToPush,
  };
}

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePWA;
