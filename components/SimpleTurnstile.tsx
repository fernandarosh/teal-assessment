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
    let widget: string | undefined;
    
    const renderTurnstile = () => {
      if (typeof window !== 'undefined' && window.turnstile && ref.current && !widget) {
        widget = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: onSuccess,
          'error-callback': onError,
          'expired-callback': onExpire,
        });
      }
    };

    // Intentar renderizar inmediatamente
    renderTurnstile();

    // Si no funciona, esperar a que el script cargue
    const interval = setInterval(() => {
      if (window.turnstile && ref.current && !widget) {
        renderTurnstile();
        clearInterval(interval);
      }
    }, 100);

    // Limpiar después de 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (widget && window.turnstile) {
        try {
          window.turnstile.remove(widget);
        } catch (e) {
          // Ignorar errores de cleanup
        }
      }
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  return <div ref={ref}></div>;
}

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
    };
  }
}