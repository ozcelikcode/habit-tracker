export type NotificationState = NotificationPermission | 'unsupported';

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationStatus(): NotificationState {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register('/notification-sw.js')
      .catch((error) => {
        console.error('Bildirim service worker kaydolamadı:', error);
        return null;
      });
  }

  return registrationPromise;
}

export async function requestNotificationPermission(): Promise<NotificationState> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await ensureServiceWorker();
  }
  return permission;
}

export async function showHabitNotification(title: string, options?: NotificationOptions) {
  if (getNotificationStatus() !== 'granted') {
    return;
  }

  try {
    const registration = await ensureServiceWorker();
    if (registration && 'showNotification' in registration) {
      registration.showNotification(title, options);
      return;
    }

    // Fallback: sayfa açıkken Notification API ile göster
    if (isNotificationSupported()) {
      new Notification(title, options);
    }
  } catch (error) {
    console.error('Bildirim gönderilemedi:', error);
  }
}
