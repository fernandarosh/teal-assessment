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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (hasRendered) return;

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.turnstile) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Script failed to load'));
        document.head.appendChild(script);
      });
    };

    const renderWidget = async () => {
      try {
        await loadScript();
        setIsLoaded(true);
        
        if (window.turnstile && ref.current && !hasRendered) {
          setTimeout(() => {
            if (ref.current && !hasRendered) {
              try {
                window.turnstile.render(ref.current, {
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
                setHasRendered(true);
              } catch (error) {
                console.error('Error rendering Turnstile:', error);
                if (onError) onError();
              }
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error loading Turnstile script:', error);
        if (onError) onError();
      }
    };

    renderWidget();
  }, [siteKey, onSuccess, onError, onExpire, hasRendered]);

  if (!isLoaded) {
    return (
      <div className="w-full h-16 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500">Cargando verificación...</span>
      </div>
    );
  }

  return <div ref={ref} className="min-h-[65px]"></div>;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
    };
  }
}