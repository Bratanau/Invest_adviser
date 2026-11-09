import React from 'react';

interface TelegramFrameProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  theme: 'dark' | 'light' | 'cyber';
}

export const TelegramFrame: React.FC<TelegramFrameProps> = ({ children, footer, theme }) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`flex h-dvh min-h-dvh flex-col overflow-hidden ${
        isLight ? 'bg-white text-slate-900' : 'bg-[#0b0f17] text-slate-100'
      }`}
    >
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-24">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      {footer && (
        <footer className="fixed inset-x-0 bottom-0 z-50">
          {footer}
        </footer>
      )}
    </div>
  );
};
