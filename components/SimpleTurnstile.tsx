'use client';
import { useEffect, useRef } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function SimpleTurnstile({ siteKey, onSuccess, onError, onExpire }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Limpiar cualquier widget existente
    if (ref.current.innerHTML) {
      ref.current.innerHTML = '';
    }

    const renderWidget = () => {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: onSuccess,
          'error-callback': onError,
          'expired-callback': onExpire,
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
  }, [siteKey, onSuccess, onError, onExpire]);

  return <div ref={ref} style={{ minHeight: '65px' }}></div>;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
    };
  }
}