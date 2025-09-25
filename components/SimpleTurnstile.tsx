'use client';
import { useEffect, useRef } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

// Control global para evitar múltiples instancias
class TurnstileManager {
  private static instance: TurnstileManager;
  private isScriptLoaded = false;
  private activeWidget: string | null = null;
  private activeElement: HTMLDivElement | null = null;

  static getInstance(): TurnstileManager {
    if (!TurnstileManager.instance) {
      TurnstileManager.instance = new TurnstileManager();
    }
    return TurnstileManager.instance;
  }

  async render(element: HTMLDivElement, options: any): Promise<void> {
    // Si ya hay un widget activo, no crear otro
    if (this.activeWidget && this.activeElement) {
      return;
    }

    await this.loadScript();
    
    if (window.turnstile && !this.activeWidget) {
      try {
        this.activeWidget = window.turnstile.render(element, options);
        this.activeElement = element;
      } catch (error) {
        console.error('Error rendering Turnstile:', error);
      }
    }
  }

  private async loadScript(): Promise<void> {
    if (this.isScriptLoaded || window.turnstile) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  destroy(): void {
    if (this.activeWidget && window.turnstile) {
      try {
        window.turnstile.remove(this.activeWidget);
      } catch (e) {
        // Ignorar errores
      }
    }
    this.activeWidget = null;
    this.activeElement = null;
  }
}

export default function SimpleTurnstile({ siteKey, onSuccess, onError, onExpire }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const manager = TurnstileManager.getInstance();

  useEffect(() => {
    if (!ref.current) return;

    manager.render(ref.current, {
      sitekey: siteKey,
      callback: onSuccess,
      'error-callback': onError,
      'expired-callback': onExpire,
    });

    return () => {
      // No destruir aquí para evitar limpiar cuando el otro componente aún lo necesita
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  return <div ref={ref}></div>;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
    };
  }
}