import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Brain,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/mockData.ts';
import { classifyImpactScore } from '../utils/analysisLogic.ts';

interface InvestorTrainerQuizProps {
  score: number;
  onUpdateScore: (newScore: number) => void;
  theme?: 'dark' | 'light' | 'cyber';
}

export const InvestorTrainerQuiz: React.FC<InvestorTrainerQuizProps> = ({
  score,
  onUpdateScore,
  theme = 'light',
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userGuessIsNoise, setUserGuessIsNoise] = useState<boolean | null>(null);
  const [userEstimatedScore, setUserEstimatedScore] = useState<number>(3);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);

  const isLight = theme === 'light';
  const question = QUIZ_QUESTIONS[currentIdx % QUIZ_QUESTIONS.length];
  const actualAnalysis = question.actual_analysis;

  const handleReveal = () => {
    if (userGuessIsNoise === null) return;
    setRevealed(true);

    const correctNoise = userGuessIsNoise === actualAnalysis.is_clickbait_or_noise;
    const diff = Math.abs(userEstimatedScore - actualAnalysis.impact_score);
    const scoreAccuracy = diff <= 2;

    if (correctNoise || scoreAccuracy) {
      const added = 100 + (correctNoise && scoreAccuracy ? 50 : 0);
      onUpdateScore(score + added);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setRevealed(false);
    setUserGuessIsNoise(null);
    setUserEstimatedScore(3);
    setCurrentIdx((i) => (i + 1) % QUIZ_QUESTIONS.length);
  };

  const handleResetTrainer = () => {
    onUpdateScore(0);
    setStreak(0);
    setCurrentIdx(0);
    setRevealed(false);
    setUserGuessIsNoise(null);
  };

  const rank =
    score >= 400
      ? 'Магистр фундаментального анализа 🏆'
      : score >= 200
      ? 'Хладнокровный аналитик фонда 💼'
      : score >= 100
      ? 'Рациональный инвестор 🛡️'
      : 'Начинающий исследователь 📚';

  return (
    <div className="space-y-4">
      {/* Top Gamification Status Bar */}
      <div
        className={`border rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-slate-900 shadow-xs'
            : 'bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border-cyan-900/50 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isLight ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Тренажер критического мышления
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isLight
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}
              >
                Кейс {currentIdx + 1}/{QUIZ_QUESTIONS.length}
              </span>
            </h2>
            <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Ранг: {rank}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b0f17] border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{streak} streak</span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b0f17] border-slate-800'
            }`}
          >
            <Award className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <span className={`text-xs font-mono font-bold ${isLight ? 'text-blue-700' : 'text-cyan-300'}`}>
              {score} pts
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div
        className={`border rounded-2xl p-4 space-y-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#131b2a] border-slate-800 text-slate-100 shadow-xl'
        }`}
      >
        {/* Ticker & Trap Bias */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-bold text-xs rounded-lg border px-2.5 py-1 ${
                isLight
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800/60'
              }`}
            >
              ${question.ticker}
            </span>
            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {question.context}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              isLight
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-amber-500/10 text-amber-300/90 border-amber-500/20'
            }`}
          >
            Ловушка: {question.trap_bias}
          </span>
        </div>

        {/* Big Provocative Headline */}
        <div
          className={`p-3.5 border rounded-xl ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0f17] border-slate-800'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Рыночный инфоповод:
          </span>
          <p className="text-sm font-bold leading-snug">
            {question.headline}
          </p>
        </div>

        {/* Fundamental Context Snapshot */}
        <div
          className={`border rounded-xl p-3 text-xs space-y-1 ${
            isLight
              ? 'bg-blue-50/50 border-blue-200 text-slate-800'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
          }`}
        >
          <span className={`font-bold block text-[11px] ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
            Фундаментальный контекст компании:
          </span>
          <p className="font-mono">{question.fundamental_snapshot}</p>
        </div>

        {/* Interactive Choice Form */}
        {!revealed ? (
          <div className="space-y-4 pt-1">
            {/* Question 1: Noise or Real Shift */}
            <div>
              <label className="block text-xs font-bold mb-2">
                1. Это реальный тектонический сдвиг бизнеса или рыночный шум?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserGuessIsNoise(true)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    userGuessIsNoise === true
                      ? isLight
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                        : 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                  Рыночный шум / FUD / FOMO
                </button>
                <button
                  type="button"
                  onClick={() => setUserGuessIsNoise(false)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    userGuessIsNoise === false
                      ? 'bg-rose-100 border-rose-500 text-rose-800 shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-rose-500" />
                  Реальный сдвиг в бизнесе
                </button>
              </div>
            </div>

            {/* Question 2: Score slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span>2. Ваша оценка силы влияния (Impact Score 1-10):</span>
                <span className={`font-mono text-sm font-bold ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
                  {userEstimatedScore}/10 • {classifyImpactScore(userEstimatedScore).labelRu}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={userEstimatedScore}
                onChange={(e) => setUserEstimatedScore(Number(e.target.value))}
                className={`w-full cursor-pointer h-2 rounded-lg ${isLight ? 'accent-blue-600 bg-slate-200' : 'accent-cyan-400 bg-slate-800'}`}
              />
              <div className={`flex justify-between text-[10px] mt-1 font-mono ${isLight ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                <span>1 (Фоновый шум)</span>
                <span>5 (Умеренно)</span>
                <span>10 (Крах/Поглощение)</span>
              </div>
            </div>

            {/* Submit Guess Button */}
            <button
              onClick={handleReveal}
              disabled={userGuessIsNoise === null}
              className={`w-full py-3 disabled:opacity-40 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
              }`}
            >
              <Brain className="w-4 h-4" />
              Проверить вердикт (Голос Разума)
            </button>
          </div>
        ) : (
          /* Revealed Analysis & Verdict */
          <div className="space-y-3.5 pt-2 animate-in fade-in">
            {/* Feedback alert */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                userGuessIsNoise === actualAnalysis.is_clickbait_or_noise
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : isLight
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              {userGuessIsNoise === actualAnalysis.is_clickbait_or_noise ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-xs block">
                  {userGuessIsNoise === actualAnalysis.is_clickbait_or_noise
                    ? 'Верно! Вы не поддались эмоциям толпы (+100 очков)'
                    : 'Ошибка мышления! Вы попались в ловушку толпы'}
                </span>
                <span className="text-[11px] opacity-90">
                  Реальная оценка влияния: {actualAnalysis.impact_score}/10 (
                  {classifyImpactScore(actualAnalysis.impact_score).labelRu}).
                </span>
              </div>
            </div>

            {/* Voice of Reason explanation */}
            <div
              className={`border rounded-xl p-3.5 space-y-1.5 ${
                isLight
                  ? 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                  : 'bg-indigo-950/30 border-indigo-900/50 text-slate-200'
              }`}
            >
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-indigo-800' : 'text-indigo-300'
                }`}
              >
                <Brain className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                Вердикт аналитика:
              </span>
              <p className="text-xs leading-relaxed font-medium">
                {actualAnalysis.voice_of_reason}
              </p>
            </div>

            {/* Historical precedent */}
            <div
              className={`border rounded-xl p-3 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <span className={`font-bold block text-[11px] mb-0.5 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                Исторический прецедент:
              </span>
              <p className="text-xs leading-normal">{actualAnalysis.historical_precedent}</p>
            </div>

            {/* Next question button */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleNext}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                Следующий кейс
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetTrainer}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
                title="Начать заново"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
