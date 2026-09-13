'use client';

import { useEffect } from 'react';

/** Starts loading after mount and skips work if the effect is disposed before it starts. */
export function useLoadData(load: () => Promise<void>) {
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load();
    });
    return () => { active = false; };
  }, [load]);
}
