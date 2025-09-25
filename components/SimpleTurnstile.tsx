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
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('=== TURNSTILE DEBUG ===');
    console.log('Site Key:', siteKey);
    console.log('Domain:', window.location.hostname);
    console.log('Full URL:', window.location.href);

    // Verificar que tenemos site key
    if (!siteKey || siteKey === 'undefined') {
      setStatus('error');
      setErrorMessage('Site key no configurada');
      return;
    }

    // Cargar script
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;

      // Callback global para cuando el script carga
      (window as any).onTurnstileLoad = () => {
        console.log('Turnstile script loaded');
        setStatus('ready');
      };

      script.onerror = () => {
        console.error('Failed to load Turnstile script');
        setStatus('error');
        setErrorMessage('Error cargando script de Cloudflare');
      };

      document.head.appendChild(script);
    } else {
      setStatus('ready');
    }

    return () => {
      delete (window as any).onTurnstileLoad;
    };
  }, [siteKey]);

  useEffect(() => {
    if (status !== 'ready' || !ref.current) return;

    console.log('Attempting to render Turnstile widget');
    
    let widget: string | undefined;

    const render = () => {
      if (window.turnstile && ref.current && !widget) {
        try {
          widget = window.turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log('Turnstile success, token:', token.substring(0, 20) + '...');
              onSuccess(token);
            },
            'error-callback': (error: any) => {
              console.error('Turnstile error callback:', error);
              setErrorMessage(`Error de Turnstile: ${error}`);
              if (onError) onError();
            },
            'expired-callback': () => {
              console.log('Turnstile expired');
              if (onExpire) onExpire();
            },
          });
          console.log('Widget rendered with ID:', widget);
        } catch (error) {
          console.error('Exception rendering Turnstile:', error);
          setErrorMessage(`Error renderizando: ${error}`);
        }
      }
    };

    render();

    return () => {
      if (widget && window.turnstile) {
        try {
          window.turnstile.remove(widget);
        } catch (e) {
          console.error('Error removing widget:', e);
        }
      }
    };
  }, [status, siteKey, onSuccess, onError, onExpire]);

  if (status === 'loading') {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="animate-pulse text-sm text-blue-600">
          Cargando verificación de seguridad...
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-sm text-red-600">
          Error: {errorMessage}
          <br />
          Site Key: {siteKey ? siteKey.substring(0, 20) + '...' : 'No configurada'}
          <br />
          Dominio: {typeof window !== 'undefined' ? window.location.hostname : 'Desconocido'}
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