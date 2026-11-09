import React from 'react';
import { Smartphone, Monitor, Moon, Sun, CheckCircle2, Shield, MoreVertical } from 'lucide-react';

interface TelegramFrameProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  theme: 'dark' | 'light' | 'cyber';
  onThemeChange: (theme: 'dark' | 'light' | 'cyber') => void;
}

export const TelegramFrame: React.FC<TelegramFrameProps> = ({
  children,
  footer,
  isPhoneFrame,
  onTogglePhoneFrame,
  theme,
  onThemeChange,
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight
          ? 'bg-[#f1f5f9] text-slate-900'
          : theme === 'cyber'
          ? 'bg-[#050811] text-cyan-50'
          : 'bg-[#0b0f17] text-slate-100'
      }`}
    >
      {/* Top Global Control Bar */}
      <header
        className={`border-b px-3 py-2 flex items-center justify-between text-xs sticky top-0 z-50 backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-white/90 border-slate-200 shadow-xs'
            : 'bg-[#0e1626]/80 border-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Shield className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">Telegram Mini App •</span>
            <span className={isLight ? 'text-slate-900 font-extrabold' : 'text-slate-100'}>
              Голос Разума
            </span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold border ${
              isLight
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
            }`}
          >
            TMA
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Frame Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
            }`}
            title="Переключить рамку смартфона Telegram"
          >
            {isPhoneFrame ? (
              <>
                <Monitor className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                <span className="hidden md:inline">Широкий экран</span>
              </>
            ) : (
              <>
                <Smartphone className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                <span className="hidden md:inline">Рамка Telegram</span>
              </>
            )}
          </button>

          {/* Theme switcher */}
          <div
            className={`flex items-center rounded-lg p-0.5 border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1 rounded-md text-[11px] transition-colors ${
                isLight ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Белый фон (Светлая тема)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1 rounded-md text-[11px] transition-colors ${
                !isLight ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Темная тема"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="py-2 sm:py-6 px-2 flex justify-center">
        {isPhoneFrame ? (
          /* Telegram Mobile Shell Simulation */
          <div
            className={`w-full max-w-[420px] rounded-[36px] overflow-hidden border-[6px] shadow-2xl flex flex-col min-h-[780px] max-h-[92vh] relative transition-colors ${
              isLight
                ? 'border-slate-300/80 bg-white shadow-slate-300/50'
                : 'border-slate-800 bg-[#0e1621] shadow-black/80'
            }`}
          >
            {/* Telegram App Bar */}
            <div
              className={`px-4 py-2.5 flex items-center justify-between border-b text-xs shrink-0 select-none ${
                isLight
                  ? 'bg-[#f4f6f8] border-slate-200 text-slate-800'
                  : 'bg-[#17212b] border-slate-800/80 text-slate-100'
              }`}
            >
              <button
                className={`text-xs font-semibold ${
                  isLight ? 'text-blue-600 hover:text-blue-700' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Закрыть
              </button>

              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center gap-1 font-bold text-xs ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  <span>Голос Разума</span>
                  <CheckCircle2
                    className={`w-3 h-3 ${isLight ? 'text-blue-600 fill-blue-100' : 'text-cyan-400 fill-cyan-400/20'}`}
                  />
                </div>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  бот
                </span>
              </div>

              <button className={isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'}>
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable View Area (White background) */}
            <div
              className={`flex-1 overflow-y-auto p-3 space-y-3 pb-4 custom-scrollbar ${
                isLight ? 'bg-white text-slate-900' : 'bg-[#0e1621] text-slate-100'
              }`}
            >
              {children}
            </div>

            {/* Pinned Bottom Navigation */}
            {footer && <div className="shrink-0">{footer}</div>}
          </div>
        ) : (
          /* Fullscreen Responsive Workstation View */
          <div className="w-full max-w-4xl px-2 sm:px-4 pb-20 space-y-4">
            {children}
            {footer && <div className="fixed bottom-0 left-0 right-0 z-40">{footer}</div>}
          </div>
        )}
      </main>
    </div>
  );
};
