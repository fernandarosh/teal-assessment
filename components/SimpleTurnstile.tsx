'use client';
import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function SimpleTurnstile({ siteKey, onSuccess, onError, onExpire }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isRendered || !ref.current) return;

    const loadAndRender = () => {
      if (window.turnstile && ref.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onSuccess(token);
            },
            'error-callback': (error: any) => {
              if (onError) onError();
            },
            'expired-callback': () => {
              if (onExpire) onExpire();
            },
          });
          setIsRendered(true);
        } catch (error) {
          console.error('Error rendering Turnstile:', error);
        }
      }
    };

    if (window.turnstile) {
      loadAndRender();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = loadAndRender;
      
      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="turnstile"]');
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        loadAndRender();
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignorar errores de cleanup
        }
      }
    };
  }, [siteKey, onSuccess, onError, onExpire, isRendered]);

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