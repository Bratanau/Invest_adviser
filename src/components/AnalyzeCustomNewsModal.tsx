import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { KNOWN_COMPANIES } from '../data/mockData.ts';
import { NewsAnalysis } from '../types/index.ts';

interface AnalyzeCustomNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: NewsAnalysis) => void;
  theme?: 'dark' | 'light' | 'cyber';
}

export const AnalyzeCustomNewsModal: React.FC<AnalyzeCustomNewsModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  theme = 'light',
}) => {
  const [ticker, setTicker] = useState('NVDA');
  const [newsText, setNewsText] = useState('');
  const [fundamentalContext, setFundamentalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const popularTickers = ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'SBER', 'JNJ'];

  const exampleNews = [
    {
      label: 'Слух о микро-контракте',
      ticker: 'MSFT',
      text: 'Microsoft выиграла тендер на поставку облачных лицензий для сети аптек на $8.5 млн',
    },
    {
      label: 'Сезонное падение продаж',
      ticker: 'AAPL',
      text: 'Выручка Apple в первом квартале упала на 18% по сравнению с рекордным праздничным Q4',
    },
    {
      label: 'Паника по поставкам',
      ticker: 'NVDA',
      text: 'Аналитик заявил о 10-дневной задержке упаковки чипов B200 в Тайване, котировки упали на 3%',
    },
  ];

  const handleSelectTicker = (selectedTicker: string) => {
    setTicker(selectedTicker);
    const company = KNOWN_COMPANIES[selectedTicker];
    if (company) {
      setFundamentalContext(
        `Капитализация $${company.market_cap_billions}B, P/E ${company.pe_ratio}, Рост выручки YoY ${company.revenue_yoy_growth}%, сезонность: ${company.seasonality_note}`
      );
    }
  };

  const handleApplyExample = (ex: { ticker: string; text: string }) => {
    handleSelectTicker(ex.ticker);
    setNewsText(ex.text);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !newsText.trim()) {
      setError('Укажите тикер и текст новости');
      return;
    }

    setError(null);
    setLoading(true);

    const steps = [
      '1/4. Проверка сезонности и эффекта высокой базы...',
      '2/4. Сопоставление масштаба события с капитализацией...',
      '3/4. Фильтрация эмоционального шума и кликбейта...',
      '4/4. Формирование вердикта «Голос Разума»...',
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 700);

    try {
      const response = await fetch('/api/analyze-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          news_text: newsText.trim(),
          fundamental_context: fundamentalContext.trim() || undefined,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error('Ошибка при вызове аналитического ядра');
      }

      const data: NewsAnalysis = await response.json();
      onAnalysisComplete(data);
      onClose();
      setNewsText('');
    } catch (err: unknown) {
      clearInterval(stepInterval);
      console.error(err);
      setError((err as Error).message || 'Не удалось выполнить анализ');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#111827] border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Разобрать новость (Аналитическое Ядро)</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Отсечение FUD/FOMO и сопоставление с фундаменталом
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleAnalyze} className="p-4 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick ticker chips */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Тикер компании
            </label>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {popularTickers.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleSelectTicker(t)}
                  className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                    ticker === t
                      ? isLight
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-cyan-500 text-slate-950 shadow-xs'
                      : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  ${t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="AAPL, NVDA, TSLA..."
              className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-blue-700 focus:border-blue-500'
                  : 'bg-[#0b0f17] border-slate-800 text-cyan-300 focus:border-cyan-500'
              }`}
              required
            />
          </div>

          {/* Preset examples */}
          <div>
            <span className={`text-[11px] font-medium block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Быстрые примеры для проверки критического мышления:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {exampleNews.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyExample(ex)}
                  className={`text-left p-2 rounded-lg border transition-colors text-xs ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <span className={`font-bold mr-2 text-[11px] ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                    {ex.label} (${ex.ticker}):
                  </span>
                  <span className="truncate inline-block max-w-[280px]">
                    {ex.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* News text input */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Заголовок или текст новости
            </label>
            <textarea
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              placeholder="Вставьте заголовок или новость, вызвавшую эмоции (панику или эйфорию)..."
              rows={3}
              className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                  : 'bg-[#0b0f17] border-slate-800 text-slate-200 focus:border-cyan-500 placeholder:text-slate-600'
              }`}
              required
            />
          </div>

          {/* Fundamental Context input */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Фундаментальный контекст (автозаполняется для топ-компаний)
            </label>
            <input
              type="text"
              value={fundamentalContext}
              onChange={(e) => setFundamentalContext(e.target.value)}
              placeholder="P/E, капитализация, выручка YoY, сезонность..."
              className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                  : 'bg-[#0b0f17] border-slate-800 text-slate-300 focus:border-cyan-500'
              }`}
            />
          </div>

          {/* Animated loading step state */}
          {loading && (
            <div
              className={`p-3 border rounded-xl space-y-2 ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-cyan-950/30 border-cyan-800/50 text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <Loader2 className={`w-4 h-4 animate-spin ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                <span>{loadingStep || 'Анализ...'}</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-blue-100' : 'bg-slate-800'}`}>
                <div className={`h-full animate-pulse w-3/4 ${isLight ? 'bg-blue-600' : 'bg-cyan-400'}`} />
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 disabled:opacity-50'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обработка алгоритмом...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Разобрать новость (Голос Разума)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
