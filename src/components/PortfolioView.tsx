import React, { useState } from 'react';
import { Plus, Trash2, PieChart, Sparkles, TrendingUp, Layers, Info } from 'lucide-react';
import { PortfolioItem, CompanyFundamental } from '../types/index.ts';

interface PortfolioViewProps {
  portfolio: PortfolioItem[];
  companies: Record<string, CompanyFundamental>;
  onUpdatePortfolio: (newPortfolio: PortfolioItem[]) => void;
  onGoToSectorAnalysis: () => void;
  theme?: 'dark' | 'light' | 'cyber';
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  companies,
  onUpdatePortfolio,
  onGoToSectorAnalysis,
  theme = 'light',
}) => {
  const [selectedTickerToAdd, setSelectedTickerToAdd] = useState('');
  const [newWeight, setNewWeight] = useState(15);

  const isLight = theme === 'light';

  const availableTickers = Object.keys(companies).filter(
    (t) => !portfolio.some((p) => p.ticker === t)
  );

  const totalWeight = portfolio.reduce((sum, item) => sum + item.weight_percent, 0);

  const handleWeightChange = (index: number, val: number) => {
    const updated = [...portfolio];
    updated[index].weight_percent = Math.max(1, Math.min(100, val));
    onUpdatePortfolio(updated);
  };

  const handleRemoveTicker = (index: number) => {
    const updated = portfolio.filter((_, i) => i !== index);
    onUpdatePortfolio(updated);
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTickerToAdd) return;
    const updated = [
      ...portfolio,
      { ticker: selectedTickerToAdd, weight_percent: Number(newWeight) || 10 },
    ];
    onUpdatePortfolio(updated);
    setSelectedTickerToAdd('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div
        className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-slate-900 shadow-xs'
            : 'bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border-indigo-900/40 text-slate-100'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieChart className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <h2 className="text-sm font-bold">Мой инвестиционный портфель</h2>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            ИИ сопоставляет выходящие новости именно с вашими активами и оценивает риски перекоса.
          </p>
        </div>
        <button
          onClick={onGoToSectorAnalysis}
          className={`self-start sm:self-auto px-3.5 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
            isLight
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Оценить риски портфеля
        </button>
      </div>

      {/* Total Weight Warning if not 100% */}
      {totalWeight !== 100 && (
        <div
          className={`border rounded-xl p-3 text-xs flex items-center justify-between ${
            isLight
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            Сумма долей: {totalWeight}%. Рекомендуется 100%.
          </span>
          <button
            onClick={() => {
              if (portfolio.length === 0) return;
              const perItem = Math.floor(100 / portfolio.length);
              const remainder = 100 - perItem * portfolio.length;
              const normalized = portfolio.map((item, idx) => ({
                ...item,
                weight_percent: perItem + (idx === 0 ? remainder : 0),
              }));
              onUpdatePortfolio(normalized);
            }}
            className="text-[11px] underline font-bold hover:opacity-80"
          >
            Сбалансировать поровну
          </button>
        </div>
      )}

      {/* Add New Ticker Form */}
      {availableTickers.length > 0 && (
        <form
          onSubmit={handleAddTicker}
          className={`border rounded-xl p-3 flex flex-wrap items-center gap-2 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111827] border-slate-800'
          }`}
        >
          <span className={`text-xs font-bold flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            <Plus className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            Добавить акцию:
          </span>
          <select
            value={selectedTickerToAdd}
            onChange={(e) => setSelectedTickerToAdd(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                : 'bg-[#0b0f17] border-slate-700 text-slate-200 focus:border-cyan-500'
            }`}
          >
            <option value="">Выберите тикер...</option>
            {availableTickers.map((t) => (
              <option key={t} value={t}>
                ${t} — {companies[t]?.name} ({companies[t]?.sector})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Доля:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
              className={`w-16 border rounded-lg px-2 py-1.5 text-xs text-center font-bold ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-[#0b0f17] border-slate-700 text-slate-200'
              }`}
            />
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>%</span>
          </div>
          <button
            type="submit"
            disabled={!selectedTickerToAdd}
            className={`px-3 py-1.5 disabled:opacity-40 text-xs font-bold rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            Добавить
          </button>
        </form>
      )}

      {/* Portfolio Items List */}
      <div className="space-y-3">
        {portfolio.map((item, index) => {
          const comp = companies[item.ticker];
          return (
            <div
              key={item.ticker}
              className={`border rounded-xl p-3.5 transition-all flex flex-col gap-2.5 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                  : 'bg-[#131b2a] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-xs rounded-lg border px-2.5 py-1 ${
                      isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-800/60'
                    }`}
                  >
                    ${item.ticker}
                  </span>
                  <div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      {comp ? comp.name : item.ticker}
                    </h4>
                    <span className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Layers className={`w-3 h-3 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                      Сектор: {comp ? comp.sector : 'Технологии'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0f17] border-slate-800'
                    }`}
                  >
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Вес:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={item.weight_percent}
                      onChange={(e) => handleWeightChange(index, Number(e.target.value))}
                      className={`w-12 bg-transparent text-xs font-bold text-center focus:outline-none ${
                        isLight ? 'text-blue-600' : 'text-cyan-400'
                      }`}
                    />
                    <span className={`text-xs font-bold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>%</span>
                  </div>

                  <button
                    onClick={() => handleRemoveTicker(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Удалить из портфеля"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Fundamental Metrics Strip */}
              {comp && (
                <div
                  className={`grid grid-cols-3 gap-2 rounded-lg p-2 text-center text-xs border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0f17] border-slate-800/80'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>P/E Ratio</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{comp.pe_ratio}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Капитализация</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      ${comp.market_cap_billions}B
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Рост выручки YoY</span>
                    <span className="font-mono font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />+{comp.revenue_yoy_growth}%
                    </span>
                  </div>
                </div>
              )}

              {/* Seasonality Insight */}
              {comp && (
                <p
                  className={`text-[11px] p-2 rounded-lg border leading-tight ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-slate-900/60 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Фактор сезонности:</span>{' '}
                  {comp.seasonality_note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
