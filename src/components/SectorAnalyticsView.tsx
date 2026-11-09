import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Compass,
  Sparkles,
  Loader2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { PortfolioItem, PortfolioAnalysisResult } from '../types/index.ts';

interface SectorAnalyticsViewProps {
  portfolio: PortfolioItem[];
  onAddDefensiveAssets?: () => void;
  theme?: 'dark' | 'light' | 'cyber';
}

export const SectorAnalyticsView: React.FC<SectorAnalyticsViewProps> = ({
  portfolio,
  onAddDefensiveAssets,
  theme = 'light',
}) => {
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLight = theme === 'light';

  const evaluatePortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio }),
      });
      if (!response.ok) {
        throw new Error('Не удалось получить оценку портфеля');
      }
      const data: PortfolioAnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Ошибка анализа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluatePortfolio();
  }, [portfolio]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Dangerous':
        return {
          label: 'Опасный уровень риска (Критический перекос)',
          badgeClass: isLight
            ? 'bg-rose-100 text-rose-800 border-rose-300'
            : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          icon: ShieldAlert,
        };
      case 'Aggressive':
        return {
          label: 'Агрессивный риск (Высокая концентрация)',
          badgeClass: isLight
            ? 'bg-orange-100 text-orange-800 border-orange-300'
            : 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          icon: AlertTriangle,
        };
      case 'Moderate':
        return {
          label: 'Умеренный риск (Стандартная диверсификация)',
          badgeClass: isLight
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: Compass,
        };
      default:
        return {
          label: 'Консервативный / Сбалансированный',
          badgeClass: isLight
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: ShieldCheck,
        };
    }
  };

  const riskBadge = analysis ? getRiskBadge(analysis.portfolio_risk_level) : null;
  const RiskIcon = riskBadge?.icon;

  const sectorColors: Record<string, string> = {
    Technology: isLight ? 'bg-blue-600' : 'bg-cyan-500',
    'Consumer Discretionary': isLight ? 'bg-indigo-600' : 'bg-violet-500',
    Healthcare: isLight ? 'bg-emerald-600' : 'bg-emerald-500',
    Finance: isLight ? 'bg-amber-600' : 'bg-amber-500',
    Energy: isLight ? 'bg-orange-600' : 'bg-orange-500',
    'Consumer Defensive': isLight ? 'bg-teal-600' : 'bg-teal-500',
    Utilities: isLight ? 'bg-sky-600' : 'bg-blue-500',
    Другое: isLight ? 'bg-slate-500' : 'bg-slate-500',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
            : 'bg-[#131b2a] border-slate-800 text-slate-100'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <h2 className="text-sm font-bold">Аналитика секторов и стресс-тест портфеля</h2>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Оценка по алгоритмам риск-менеджмента фонда без навязывания покупок.
          </p>
        </div>
        <button
          onClick={evaluatePortfolio}
          disabled={loading}
          className={`self-start sm:self-auto px-3 py-1.5 disabled:opacity-50 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Пересчитать
        </button>
      </div>

      {loading && !analysis && (
        <div
          className={`border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
          }`}
        >
          <Loader2 className={`w-6 h-6 animate-spin ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            ИИ рассчитывает коэффициенты корреляции и секторные веса...
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {analysis && (
        <>
          {/* Risk Level Banner */}
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Уровень риска текущего портфеля:
              </span>
              {riskBadge && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskBadge.badgeClass}`}
                >
                  {RiskIcon && <RiskIcon className="w-4 h-4" />}
                  <span>{riskBadge.label}</span>
                </div>
              )}
            </div>

            {/* Main Vulnerability Callout */}
            <div
              className={`border-l-2 p-3 rounded-r-xl ${
                isLight
                  ? 'bg-rose-50 border-rose-600 text-slate-900'
                  : 'bg-rose-950/20 border-rose-500 text-slate-200'
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-rose-700' : 'text-rose-400'
                }`}
              >
                Главная уязвимость портфеля:
              </span>
              <p className="text-xs font-medium leading-relaxed">
                {analysis.main_vulnerability}
              </p>
            </div>
          </div>

          {/* Sector Allocation Breakdown */}
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131b2a] border-slate-800'
            }`}
          >
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Распределение капитала по секторам:
            </h3>

            {/* Combined progress bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden flex shadow-inner ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
              {analysis.sector_allocation.map((sec, idx) => {
                const color = sectorColors[sec.sector] || 'bg-slate-400';
                return (
                  <div
                    key={idx}
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${sec.weight_percent}%` }}
                    title={`${sec.sector}: ${sec.weight_percent}%`}
                  />
                );
              })}
            </div>

            {/* Sector rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {analysis.sector_allocation.map((sec, idx) => {
                const color = sectorColors[sec.sector] || 'bg-slate-400';
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0f17] border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                        {sec.sector}
                      </span>
                    </div>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {sec.weight_percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diversification Advice */}
          <div
            className={`border rounded-2xl p-4 space-y-2 ${
              isLight
                ? 'bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border-indigo-200 text-slate-800'
                : 'bg-gradient-to-br from-indigo-950/30 to-slate-900/60 border-indigo-900/40 text-slate-200'
            }`}
          >
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-indigo-800' : 'text-indigo-300'}`}>
              <Compass className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              Совет риск-менеджера по балансировке:
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed font-medium">
              {analysis.diversification_advice}
            </p>

            {onAddDefensiveAssets && analysis.portfolio_risk_level === 'Dangerous' && (
              <button
                onClick={onAddDefensiveAssets}
                className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border ${
                  isLight
                    ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
                    : 'bg-indigo-900/40 hover:bg-indigo-800/50 text-indigo-200 border-indigo-700/60'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Смоделировать добавление защитных секторов (Healthcare + Energy)
              </button>
            )}
          </div>

          {/* Educational Principle Tip */}
          <div
            className={`border rounded-2xl p-4 space-y-1.5 ${
              isLight
                ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                : 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
            }`}
          >
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
              <Lightbulb className="w-4 h-4" />
              Инвестиционный принцип против ошибок:
            </div>
            <p className="text-xs leading-relaxed italic font-medium">
              «{analysis.educational_tip}»
            </p>
          </div>
        </>
      )}
    </div>
  );
};
