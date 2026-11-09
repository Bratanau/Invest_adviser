/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { Navigation, TabType } from './components/Navigation.tsx';
import { NewsCard } from './components/NewsCard.tsx';
import { AnalyzeCustomNewsModal } from './components/AnalyzeCustomNewsModal.tsx';
import { PortfolioView } from './components/PortfolioView.tsx';
import { SectorAnalyticsView } from './components/SectorAnalyticsView.tsx';
import { InvestorTrainerQuiz } from './components/InvestorTrainerQuiz.tsx';
import { TelegramFrame } from './components/TelegramFrame.tsx';
import {
  NewsAnalysis,
  PortfolioItem,
  CompanyFundamental,
} from './types/index.ts';
import {
  INITIAL_NEWS_FEED,
  KNOWN_COMPANIES,
  DEFAULT_PORTFOLIO,
} from './data/mockData.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [news, setNews] = useState<NewsAnalysis[]>(INITIAL_NEWS_FEED);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO);
  const [companies, setCompanies] = useState<Record<string, CompanyFundamental>>(KNOWN_COMPANIES);
  const [selectedTickerFilter, setSelectedTickerFilter] = useState<string | null>(null);
  const [selectedRiskFlagFilter, setSelectedRiskFlagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trainerScore, setTrainerScore] = useState(0);
  const theme = 'light';

  const isLight = theme === 'light';

  // Load feed from backend on mount if available
  useEffect(() => {
    fetch('/api/feed')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
        }
      })
      .catch((err) => console.log('Feed loaded from local mock data:', err));

    fetch('/api/tickers')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setCompanies(data);
        }
      })
      .catch((err) => console.log('Tickers loaded from local mock data:', err));
  }, []);

  // Filtered news
  const filteredNews = news.filter((item) => {
    if (selectedTickerFilter && item.ticker !== selectedTickerFilter) {
      return false;
    }
    if (selectedRiskFlagFilter && !item.risk_flags?.includes(selectedRiskFlagFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = item.news_text.toLowerCase().includes(q);
      const matchTicker = item.ticker.toLowerCase().includes(q);
      const matchVoice = item.voice_of_reason.toLowerCase().includes(q);
      return matchText || matchTicker || matchVoice;
    }
    return true;
  });

  const handleAnalysisComplete = (newAnalysis: NewsAnalysis) => {
    setNews((prev) => [newAnalysis, ...prev]);
    setActiveTab('feed');
  };

  const handleAddDefensiveAssets = () => {
    const defensivePortfolio: PortfolioItem[] = [
      { ticker: 'NVDA', weight_percent: 25 },
      { ticker: 'AAPL', weight_percent: 20 },
      { ticker: 'MSFT', weight_percent: 20 },
      { ticker: 'JNJ', weight_percent: 20 },
      { ticker: 'XOM', weight_percent: 15 },
    ];
    setPortfolio(defensivePortfolio);
  };

  return (
    <TelegramFrame
      theme={theme}
      footer={
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          feedCount={news.length}
          trainerScore={trainerScore}
          theme={theme}
        />
      }
    >
      {/* Tab: Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-3.5">
          {/* Feed Header & Action */}
          <div
            className={`border rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
                : 'bg-[#131b2a] border-slate-800 text-slate-100'
            }`}
          >
            <div>
              <h1 className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                Лента анализа «Голос Разума»
              </h1>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Фильтрация паники (FUD) и жадности (FOMO) через фундаментал
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                isLight
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Разобрать новость
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по тикеру, новости или вердикту..."
                className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-xs'
                    : 'bg-[#111827] border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-2.5 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Active Tickers Pill Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => {
                  setSelectedTickerFilter(null);
                  setSelectedRiskFlagFilter(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  !selectedTickerFilter && !selectedRiskFlagFilter
                    ? isLight
                      ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                      : 'bg-cyan-500 text-slate-950 font-bold border-cyan-500 shadow-sm'
                    : isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-transparent'
                }`}
              >
                Все тикеры ({news.length})
              </button>

              {Array.from(new Set(news.map((n) => n.ticker))).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTickerFilter(selectedTickerFilter === t ? null : t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-colors border ${
                    selectedTickerFilter === t
                      ? isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                      : isLight
                      ? 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-transparent'
                  }`}
                >
                  ${t}
                </button>
              ))}
            </div>

            {/* Active Filter Chips */}
            {(selectedTickerFilter || selectedRiskFlagFilter) && (
              <div className={`flex items-center gap-2 text-xs pt-0.5 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                <span>Фильтр:</span>
                {selectedTickerFilter && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono text-[11px] font-bold ${
                      isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-800/60'
                    }`}
                  >
                    ${selectedTickerFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedTickerFilter(null)}
                    />
                  </span>
                )}
                {selectedRiskFlagFilter && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    #{selectedRiskFlagFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedRiskFlagFilter(null)}
                    />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* News List */}
          {filteredNews.length === 0 ? (
            <div
              className={`border rounded-2xl p-8 text-center space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
              }`}
            >
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                По выбранным фильтрам новостей не найдено
              </p>
              <button
                onClick={() => {
                  setSelectedTickerFilter(null);
                  setSelectedRiskFlagFilter(null);
                  setSearchQuery('');
                }}
                className={`text-xs hover:underline font-bold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  analysis={item}
                  onFilterByTicker={(t) => setSelectedTickerFilter(t)}
                  onFilterByRiskFlag={(f) => setSelectedRiskFlagFilter(f)}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Portfolio */}
      {activeTab === 'portfolio' && (
        <PortfolioView
          portfolio={portfolio}
          companies={companies}
          onUpdatePortfolio={setPortfolio}
          onGoToSectorAnalysis={() => setActiveTab('sectors')}
          theme={theme}
        />
      )}

      {/* Tab: Sectors */}
      {activeTab === 'sectors' && (
        <SectorAnalyticsView
          portfolio={portfolio}
          onAddDefensiveAssets={handleAddDefensiveAssets}
          theme={theme}
        />
      )}

      {/* Tab: Trainer */}
      {activeTab === 'trainer' && (
        <InvestorTrainerQuiz
          score={trainerScore}
          onUpdateScore={setTrainerScore}
          theme={theme}
        />
      )}

      {/* Modal: Analyze Custom News */}
      <AnalyzeCustomNewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        theme={theme}
      />
    </TelegramFrame>
  );
}
