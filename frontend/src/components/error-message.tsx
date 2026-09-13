'use client';

import { useEffect, useRef } from 'react';

export function ErrorMessage({ message }: { message: string | string[] }) {
  const element = useRef<HTMLDivElement>(null);
  const text = Array.isArray(message) ? message.join(' ') : message;

  useEffect(() => {
    if (text) element.current?.focus();
  }, [text]);

  if (!text) return null;
  return <div ref={element} role="alert" tabIndex={-1} className="form-error"><strong>Não foi possível continuar</strong><p>{text}</p></div>;
}
