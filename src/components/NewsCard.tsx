import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
  Brain,
  History,
  Lightbulb,
  Share2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { NewsAnalysis } from '../types/index.ts';
import { classifyImpactScore } from '../utils/analysisLogic.ts';

interface NewsCardProps {
  analysis: NewsAnalysis;
  onFilterByTicker?: (ticker: string) => void;
  onFilterByRiskFlag?: (flag: string) => void;
  theme?: 'dark' | 'light' | 'cyber';
}

export const NewsCard: React.FC<NewsCardProps> = ({
  analysis,
  onFilterByTicker,
  onFilterByRiskFlag,
  theme = 'light',
}) => {
  const [showFundamentals, setShowFundamentals] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const isLight = theme === 'light';
  const impact = classifyImpactScore(analysis.impact_score);

  const handleShare = () => {
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2400);

    const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (url: string) => void } } }).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      const shareText = encodeURIComponent(
        `📊 Голос Разума: ${analysis.ticker}\nНовость: "${analysis.news_text.slice(0, 100)}..."\nОценка влияния: ${analysis.impact_score}/10 (${impact.labelRu})\n\n💡 Вердикт: ${analysis.voice_of_reason}`
      );
      tg.openTelegramLink(`https://t.me/share/url?url=https://t.me/MarketCalmerBot&text=${shareText}`);
    }
  };

  const directionBadge = () => {
    switch (analysis.impact_direction) {
      case 'Positive':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isLight
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
            Позитивно
          </span>
        );
      case 'Negative':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isLight
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
          }`}>
            <TrendingDown className="w-3.5 h-3.5" />
            Негативно
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isLight
              ? 'bg-slate-100 text-slate-700 border border-slate-200'
              : 'bg-slate-500/15 text-slate-300 border border-slate-500/20'
          }`}>
            <Minus className="w-3.5 h-3.5" />
            Нейтрально
          </span>
        );
    }
  };

  const scorePercent = (analysis.impact_score / 10) * 100;

  return (
    <article
      className={`border rounded-2xl p-4 shadow-sm transition-all flex flex-col gap-3 relative overflow-hidden group ${
        isLight
          ? 'bg-white border-slate-200/90 text-slate-900 hover:shadow-md'
          : 'bg-[#131b2a] border-slate-800/90 text-slate-100 hover:border-slate-700/80'
      }`}
    >
      {/* Top Bar: Ticker, Direction & Impact */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFilterByTicker && onFilterByTicker(analysis.ticker)}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold text-sm tracking-wider transition-colors ${
              isLight
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/60'
            }`}
            title="Фильтровать по тикеру"
          >
            ${analysis.ticker}
          </button>
          <span className={`text-xs truncate max-w-[150px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {analysis.company_name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {analysis.is_clickbait_or_noise && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              isLight
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Шум / Кликбейт
            </span>
          )}
          {directionBadge()}
        </div>
      </div>

      {/* Headline / Raw News */}
      <div>
        <p className={`font-semibold text-sm leading-snug ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          {analysis.news_text}
        </p>
        <div className={`flex items-center justify-between text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>{analysis.source}</span>
          <span>{analysis.published_at}</span>
        </div>
      </div>

      {/* Impact Score Visual Meter */}
      <div className={`border rounded-xl p-3 flex flex-col gap-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0f17] border-slate-800/80'}`}>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            Реальное влияние на бизнес (Impact Score):
          </span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${impact.badgeClass}`}>
            {analysis.impact_score}/10 • {impact.labelRu}
          </span>
        </div>
        <div className={`w-full rounded-full h-2 overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-slate-800/80'}`}>
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              analysis.impact_score <= 3
                ? 'bg-slate-400 shadow-sm'
                : analysis.impact_score <= 6
                ? 'bg-amber-500 shadow-sm'
                : analysis.impact_score <= 8
                ? 'bg-orange-500 shadow-sm'
                : 'bg-rose-500 shadow-sm'
            }`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* One-Sentence Fact */}
      <div className={`border-l-2 pl-3 py-1.5 text-xs ${
        isLight
          ? 'bg-blue-50/70 border-blue-600 text-slate-800'
          : 'bg-cyan-950/20 border-cyan-500 text-slate-200'
      }`}>
        <span className={`font-bold block text-[11px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
          Суть факта без «воды»:
        </span>
        {analysis.one_sentence_fact}
      </div>

      {/* Voice of Reason Main Block */}
      <div className={`border rounded-xl p-3.5 relative ${
        isLight
          ? 'bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border-indigo-200/80 text-slate-800'
          : 'bg-gradient-to-br from-indigo-950/30 to-slate-900/40 border-indigo-900/40 text-slate-200'
      }`}>
        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5 ${
          isLight ? 'text-indigo-800' : 'text-indigo-300'
        }`}>
          <Brain className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          Голос Разума (Анализ фундаментала):
        </div>
        <p className="text-xs sm:text-[13px] leading-relaxed font-medium">
          {analysis.voice_of_reason}
        </p>
      </div>

      {/* Historical Precedent */}
      {analysis.historical_precedent && (
        <div className={`flex items-start gap-2 border rounded-xl p-2.5 text-xs ${
          isLight
            ? 'bg-amber-50/70 border-amber-200 text-slate-800'
            : 'bg-slate-900/40 border-slate-800/60 text-slate-300'
        }`}>
          <History className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
          <div>
            <span className={`font-bold block text-[11px] ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
              Исторический прецедент:
            </span>
            <p className="text-xs leading-normal">
              {analysis.historical_precedent}
            </p>
          </div>
        </div>
      )}

      {/* Educational Takeaway */}
      {analysis.educational_takeaway && (
        <div className={`flex items-start gap-2 border rounded-xl p-2.5 text-xs ${
          isLight
            ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
            : 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
        }`}>
          <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <div>
            <span className={`font-bold block text-[11px] ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
              Урок для инвестора:
            </span>
            <p className="text-xs leading-normal">
              {analysis.educational_takeaway}
            </p>
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {analysis.risk_flags && analysis.risk_flags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Флаги:</span>
          {analysis.risk_flags.map((flag, idx) => (
            <button
              key={idx}
              onClick={() => onFilterByRiskFlag && onFilterByRiskFlag(flag)}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
              }`}
            >
              #{flag}
            </button>
          ))}
        </div>
      )}

      {/* Collapsible Fundamental Context */}
      {analysis.fundamental_context && (
        <div className={`border-t pt-2 mt-1 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <button
            onClick={() => setShowFundamentals(!showFundamentals)}
            className={`flex items-center justify-between w-full text-xs font-semibold py-1 transition-colors ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <BarChart3 className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              Фундаментальный контекст компании
            </span>
            {showFundamentals ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showFundamentals && (
            <div className={`mt-2 p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b0f17] border-slate-800/80 text-slate-300'
            }`}>
              <p>{analysis.fundamental_context}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Footer: Share to Telegram */}
      <div className={`flex items-center justify-between pt-1 text-xs border-t ${
        isLight ? 'border-slate-200' : 'border-slate-800/40'
      }`}>
        <span className={`text-[11px] ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
          TMA AI Engine • Вердикт подтвержден
        </span>
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
            isLight
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
              : 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-400 border-cyan-800/40'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          Поделиться
        </button>
      </div>

      {/* Toast Notification */}
      {sharedToast && (
        <div className="absolute top-3 right-3 bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 z-20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ссылка скопирована в Telegram!
        </div>
      )}
    </article>
  );
};
