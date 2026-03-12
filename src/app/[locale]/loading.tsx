export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-dark-950/60 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
        <p className="text-dark-300 text-sm animate-pulse">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
