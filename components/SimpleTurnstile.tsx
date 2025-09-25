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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Verificar si el script ya está cargado
    if (window.turnstile) {
      setIsScriptLoaded(true);
      return;
    }

    // Cargar script manualmente
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Turnstile script');
      if (onError) onError();
    };

    document.head.appendChild(script);

    return () => {
      // No remover el script ya que puede ser usado por otros componentes
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !ref.current || isRendered) return;

    let attempts = 0;
    const maxAttempts = 50;

    const tryRender = () => {
      if (window.turnstile && ref.current && !isRendered) {
        try {
          const widget = window.turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log('Turnstile success');
              onSuccess(token);
            },
            'error-callback': (error: any) => {
              console.error('Turnstile error:', error);
              if (onError) onError();
            },
            'expired-callback': () => {
              console.log('Turnstile expired');
              if (onExpire) onExpire();
            },
          });
          
          setIsRendered(true);
          console.log('Turnstile rendered successfully');
          return;
        } catch (error) {
          console.error('Error rendering Turnstile:', error);
        }
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryRender, 100);
      } else {
        console.error('Max attempts reached for Turnstile rendering');
        if (onError) onError();
      }
    };

    tryRender();
  }, [isScriptLoaded, siteKey, onSuccess, onError, onExpire, isRendered]);

  if (!isScriptLoaded) {
    return (
      <div className="p-4 bg-slate-100 rounded-lg">
        <div className="animate-pulse text-sm text-slate-600">
          Cargando verificación de seguridad...
        </div>
      </div>
    );
  }

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