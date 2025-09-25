'use client';
import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function SimpleTurnstile({ siteKey, onSuccess, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Crear callback global único
    const callbackName = `turnstileCallback_${Date.now()}`;
    const errorCallbackName = `turnstileError_${Date.now()}`;
    const expireCallbackName = `turnstileExpire_${Date.now()}`;

    (window as any)[callbackName] = onSuccess;
    (window as any)[errorCallbackName] = onError;
    (window as any)[expireCallbackName] = onExpire;

    // Cargar script si no está presente
    let script = document.querySelector('script[src*="turnstile"]') as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleScriptLoad = () => {
      setIsScriptLoaded(true);
      
      if (containerRef.current) {
        // Usar HTML directo con atributos data
        containerRef.current.innerHTML = `
          <div 
            class="cf-turnstile" 
            data-sitekey="${siteKey}"
            data-callback="${callbackName}"
            data-error-callback="${errorCallbackName}"
            data-expired-callback="${expireCallbackName}"
            data-theme="light"
            data-size="normal"
          ></div>
        `;

        // Forzar re-renderizado si Turnstile ya está cargado
        if (window.turnstile && window.turnstile.render) {
          setTimeout(() => {
            const widgets = containerRef.current?.querySelectorAll('.cf-turnstile');
            widgets?.forEach((widget) => {
              if (widget && !widget.hasAttribute('data-rendered')) {
                try {
                  window.turnstile.render(widget as HTMLElement, {
                    sitekey: siteKey,
                    callback: (window as any)[callbackName],
                    'error-callback': (window as any)[errorCallbackName],
                    'expired-callback': (window as any)[expireCallbackName],
                  });
                  widget.setAttribute('data-rendered', 'true');
                } catch (e) {
                  console.error('Error rendering Turnstile:', e);
                }
              }
            });
          }, 100);
        }
      }
    };

    if (script.readyState === 'complete' || script.readyState === 'loaded') {
      handleScriptLoad();
    } else {
      script.addEventListener('load', handleScriptLoad);
    }

    return () => {
      // Limpiar callbacks globales
      delete (window as any)[callbackName];
      delete (window as any)[errorCallbackName];
      delete (window as any)[expireCallbackName];
      
      script.removeEventListener('load', handleScriptLoad);
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  if (!isScriptLoaded) {
    return (
      <div className="w-full h-16 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500">Cargando verificación de seguridad...</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="min-h-[80px] w-full flex items-center justify-center"
    />
  );
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
    };
  }
}