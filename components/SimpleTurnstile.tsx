'use client';
import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function SimpleTurnstile({ siteKey, onSuccess, onError, onExpire }: TurnstileProps) {
  const [token, setToken] = useState('');

  useEffect(() => {
    // Listener para mensajes del iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://challenges.cloudflare.com') return;
      
      if (event.data.type === 'turnstile-callback') {
        setToken(event.data.token);
        onSuccess(event.data.token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  return (
    <div>
      <iframe
        src={`https://challenges.cloudflare.com/turnstile/v0/b/${siteKey}/light/normal`}
        width="300"
        height="65"
        frameBorder="0"
        title="Cloudflare Turnstile"
        style={{
          border: 'none',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}