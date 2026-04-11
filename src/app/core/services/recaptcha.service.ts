import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

declare const grecaptcha: {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly siteKey = environment.recaptchaSiteKey;
  private readonly platformId = inject(PLATFORM_ID);
  private readyPromise: Promise<void> | null = null;

  private load(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject(new Error('reCAPTCHA solo está disponible en el navegador.'));
    }

    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        `script[src*="recaptcha/api.js"]`
      );

      const waitForReady = () => {
        grecaptcha.ready(() => resolve());
      };

      if (existing) {
        waitForReady();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.readyPromise = null; // permite reintentar
        reject(new Error('No se pudo cargar el script de reCAPTCHA.'));
      };
      script.onload = () => waitForReady();
      document.head.appendChild(script);
    });

    return this.readyPromise;
  }

  async execute(action: string): Promise<string> {
    await this.load();
    return grecaptcha.execute(this.siteKey, { action });
  }
}
