import React from 'react';
import { Newspaper, PieChart, ShieldAlert, GraduationCap } from 'lucide-react';

export type TabType = 'feed' | 'portfolio' | 'sectors' | 'trainer';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  feedCount?: number;
  trainerScore?: number;
  theme?: 'dark' | 'light' | 'cyber';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  feedCount = 5,
  trainerScore = 0,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  const tabs = [
    {
      id: 'feed' as TabType,
      label: 'Лента',
      fullLabel: 'Лента анализа',
      icon: Newspaper,
      badge: feedCount > 0 ? feedCount : undefined,
    },
    {
      id: 'portfolio' as TabType,
      label: 'Портфель',
      fullLabel: 'Мой портфель',
      icon: PieChart,
    },
    {
      id: 'sectors' as TabType,
      label: 'Сектора',
      fullLabel: 'Аналитика рисков',
      icon: ShieldAlert,
    },
    {
      id: 'trainer' as TabType,
      label: 'Тренажер',
      fullLabel: 'Тренажер инвестора',
      icon: GraduationCap,
      badge: trainerScore > 0 ? `${trainerScore}` : undefined,
    },
  ];

  return (
    <nav
      className={`border-t sticky bottom-0 z-40 w-full px-2 py-1.5 transition-all ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-md'
          : 'bg-[#111827]/90 backdrop-blur-md border-slate-800/80'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? isLight
                    ? 'text-blue-600 font-bold'
                    : 'text-cyan-400 font-semibold'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? (isLight ? 'scale-110 text-blue-600' : 'scale-110 text-cyan-400') : ''
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm ${
                      isLight ? 'bg-blue-600 text-white' : 'bg-cyan-500 text-slate-950'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate w-full text-center">
                {tab.label}
              </span>
              {isActive && (
                <span
                  className={`absolute bottom-0 w-8 h-0.5 rounded-full ${
                    isLight
                      ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]'
                      : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
