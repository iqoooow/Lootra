'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60dvh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-6">
        <AlertTriangle size={32} className="text-accent-red" />
      </div>
      <h2 className="text-xl font-display font-bold text-white mb-3">Xato yuz berdi</h2>
      <p className="text-dark-300 text-sm mb-6 max-w-sm">
        Kutilmagan xato yuz berdi. Iltimos, qayta urinib ko'ring.
      </p>
      <button onClick={reset} className="btn-primary">
        Qayta urinish
      </button>
    </div>
  );
}
