'use client';

import { useEffect, useRef, useState, type ComponentProps, type SubmitEvent } from 'react';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type FieldError = { field: Field; message: string };

/** Keeps HTML constraints, but presents their errors consistently on mobile and desktop. */
export function Form({ children, onSubmit, ...props }: ComponentProps<'form'>) {
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [attempt, setAttempt] = useState(0);
  const summary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid: FieldError[] = [];

    for (const element of Array.from(event.currentTarget.elements)) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
      if (!element.willValidate) continue;

      const empty = element.required && !element.value.trim();
      if (element.validity.valid && !empty) {
        element.removeAttribute('aria-invalid');
        continue;
      }

      const label = (element.labels?.[0]?.textContent || element.getAttribute('aria-label') || element.parentElement?.querySelector('label')?.textContent || element.getAttribute('placeholder') || 'Campo').replace('*', '').trim();
      let message = `${label}: confira o valor informado.`;
      if (empty || element.validity.valueMissing) message = `${label}: ${element instanceof HTMLSelectElement ? 'selecione uma opção' : 'preencha este campo'}.`;
      else if (element.validity.badInput || element.validity.stepMismatch) message = `${label}: informe um número inteiro válido.`;
      else if (element.validity.rangeUnderflow) message = `${label}: o valor mínimo é ${element.getAttribute('min')}.`;
      else if (element.validity.rangeOverflow) message = `${label}: o valor máximo é ${element.getAttribute('max')}.`;
      else if (element.validity.typeMismatch) message = `${label}: informe um ${element.getAttribute('type') === 'email' ? 'e-mail' : 'valor'} válido.`;

      element.setAttribute('aria-invalid', 'true');
      invalid.push({ field: element, message });
    }

    setErrors(invalid);
    if (invalid.length) setAttempt((value) => value + 1);
    if (!invalid.length) void onSubmit?.(event);
  }

  return (
    <form {...props} noValidate onSubmit={submit} onInput={(event) => {
      props.onInput?.(event);
      const field = event.target;
      if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) && field.validity.valid && (!field.required || field.value.trim())) {
        field.removeAttribute('aria-invalid');
        setErrors((current) => current.filter((item) => item.field !== field));
      }
    }}>
      {errors.length > 0 && (
        <div ref={summary} className="form-error" role="alert" tabIndex={-1}>
          <strong>Revise os campos para continuar</strong>
          <ul>{errors.map(({ field, message }, index) => (
            <li key={index}><button type="button" onClick={() => field.focus()}>{message}</button></li>
          ))}</ul>
        </div>
      )}
      {children}
    </form>
  );
}
