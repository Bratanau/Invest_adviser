import { CompanyFundamental, PortfolioAnalysisResult, PortfolioItem, RiskLevel, NewsAnalysis } from '../types/index.ts';

/**
 * Returns human-readable label and UI styling category for an impact score (1-10)
 */
export function classifyImpactScore(score: number): {
  level: 'noise' | 'moderate' | 'high' | 'tectonic';
  labelRu: string;
  badgeClass: string;
} {
  const bounded = Math.max(1, Math.min(10, Math.round(score)));
  if (bounded <= 3) {
    return {
      level: 'noise',
      labelRu: 'Рыночный шум (1-3/10)',
      badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
  }
  if (bounded <= 6) {
    return {
      level: 'moderate',
      labelRu: 'Умеренное влияние (4-6/10)',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
  }
  if (bounded <= 8) {
    return {
      level: 'high',
      labelRu: 'Существенный фактор (7-8/10)',
      badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
  }
  return {
    level: 'tectonic',
    labelRu: 'Тектонический сдвиг (9-10/10)',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
  };
}

/**
 * Calculates sector allocation and determines portfolio risk level
 */
export function calculatePortfolioRisk(
  items: PortfolioItem[],
  knownCompanies: Record<string, { sector: string }>
): PortfolioAnalysisResult {
  if (!items || items.length === 0) {
    return {
      sector_allocation: [],
      portfolio_risk_level: 'Conservative',
      main_vulnerability: 'Портфель пуст. Добавьте акции для оценки диверсификации.',
      diversification_advice: 'Рекомендуется сформировать базовый портфель из 4-6 секторов.',
      educational_tip: 'Диверсификация — единственный бесплатный ланч на финансовых рынках.',
    };
  }

  // Normalize weights
  const totalWeight = items.reduce((sum, item) => sum + item.weight_percent, 0) || 100;
  const sectorWeights: Record<string, number> = {};

  items.forEach((item) => {
    const sector = knownCompanies[item.ticker.toUpperCase()]?.sector || 'Другое';
    const normalized = (item.weight_percent / totalWeight) * 100;
    sectorWeights[sector] = (sectorWeights[sector] || 0) + normalized;
  });

  const sector_allocation = Object.entries(sectorWeights).map(([sector, weight]) => ({
    sector,
    weight_percent: Math.round(weight),
  })).sort((a, b) => b.weight_percent - a.weight_percent);

  const topSector = sector_allocation[0];
  const topWeight = topSector ? topSector.weight_percent : 0;

  let portfolio_risk_level: RiskLevel = 'Moderate';
  let main_vulnerability = '';
  let diversification_advice = '';
  let educational_tip = '';

  if (topWeight >= 70) {
    portfolio_risk_level = 'Dangerous';
    main_vulnerability = `Критический перекос: более ${topWeight}% портфеля сосредоточено в секторе ${topSector.sector}.`;
    diversification_advice = `Снизьте долю ${topSector.sector} хотя бы до 35-40%, добавив защитные сектора: Consumer Defensive (потребительский сектор), Healthcare (здравоохранение) или Energy/Utilities.`;
    educational_tip = 'Принцип Марковица: риск портфеля падает не от количества бумаг одной отрасли, а от низкой корреляции между разными секторами экономики.';
  } else if (topWeight >= 45) {
    portfolio_risk_level = 'Aggressive';
    main_vulnerability = `Повышенная концентрация в секторе ${topSector.sector} (${topWeight}%). Высокая чувствительность к отраслевым циклам.`;
    diversification_advice = 'Рекомендуется добавить 1-2 некоррелирующих сектора (например, Finance или Healthcare) для стабилизации доходности.';
    educational_tip = 'Не путайте диверсификацию по тикерам с диверсификацией по рискам. Покупка 5 разных ИТ-компаний — это всё ещё 100% технологический риск.';
  } else if (sector_allocation.length >= 4 && topWeight < 35) {
    portfolio_risk_level = 'Conservative';
    main_vulnerability = 'Умеренная чувствительность к общерыночной макроэкономике и процентным ставкам ФРС.';
    diversification_advice = 'Портфель сбалансирован. Проводите ребалансировку раз в квартал для фиксации прибыли выросших секторов.';
    educational_tip = 'Ребалансировка автоматически заставляет вас продавать то, что подорожало, и докупать то, что временно подешевело.';
  } else {
    portfolio_risk_level = 'Moderate';
    main_vulnerability = `Умеренный перекос в сторону сектора ${topSector?.sector || 'Tech'} (${topWeight}%).`;
    diversification_advice = 'Хорошая база. Постепенно добирайте качественные дивидендные акции из защитных секторов.';
    educational_tip = 'Соблюдайте правило: ни один сектор не должен превышать 25-30% инвестиционного капитала.';
  }

  return {
    sector_allocation,
    portfolio_risk_level,
    main_vulnerability,
    diversification_advice,
    educational_tip,
    skew_summary: `${topSector ? topSector.sector : 'General'}: ${topWeight}% портфеля`,
  };
}

/**
 * Validates whether user-submitted news analysis JSON conforms to System Prompt #2 schema
 */
export function validateAnalysisStructure(data: unknown): data is Partial<NewsAnalysis> {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.impact_score === 'number' &&
    typeof d.voice_of_reason === 'string' &&
    typeof d.one_sentence_fact === 'string'
  );
}

/**
 * Deterministic fallback analyzer implementing System Prompt #2 logic in case LLM is offline
 */
export function generateHeuristicAnalysis(
  ticker: string,
  news_text: string,
  fundamentalContext: string
): Omit<NewsAnalysis, 'id' | 'published_at'> {
  const lower = news_text.toLowerCase();
  
  // Detect clickbait / noise keywords
  const isClickbait =
    lower.includes('ужас') ||
    lower.includes('катастроф') ||
    lower.includes('паник') ||
    lower.includes('обвал') ||
    lower.includes('рекордный взлет') ||
    lower.includes('раскрыл секрет') ||
    lower.includes('шок') ||
    lower.includes('новый дизайн') ||
    lower.includes('слухи') ||
    lower.includes('анонимный источник');

  // Detect scale indicators
  const isMillions = lower.includes('млн') || lower.includes('million') || lower.includes('$10 млн');
  const isRegulatory = lower.includes('банкрот') || lower.includes('sec') || lower.includes('расследован') || lower.includes('запрет');
  const isSeasonality = lower.includes('q1') || lower.includes('q4') || lower.includes('сезон') || lower.includes('новогодн');
  
  let score = 3;
  let direction: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';

  if (isRegulatory) {
    score = 8;
    direction = 'Negative';
  } else if (lower.includes('отчет') || lower.includes('выручк') || lower.includes('прибыль')) {
    if (lower.includes('рост') || lower.includes('превысил') || lower.includes('рекорд')) {
      score = 6;
      direction = 'Positive';
    } else {
      score = 5;
      direction = 'Negative';
    }
  } else if (isMillions) {
    score = 2; // small contract relative to billions market cap
    direction = 'Neutral';
  } else if (isClickbait) {
    score = 2;
    direction = 'Neutral';
  }

  const riskFlags: string[] = [];
  if (isClickbait) riskFlags.push('Эмоциональный шум / Кликбейт');
  if (isSeasonality) riskFlags.push('Сезонный фактор');
  if (score <= 3) riskFlags.push('Незначительный масштаб');
  if (direction === 'Positive' && score >= 5) riskFlags.push('Переоцененность рынком / FOMO');
  if (direction === 'Negative') riskFlags.push('Паническая реакция толпы / FUD');

  return {
    ticker: ticker.toUpperCase(),
    company_name: ticker.toUpperCase(),
    news_text,
    source: 'Рыночный монитор',
    impact_direction: direction,
    impact_score: score,
    is_clickbait_or_noise: isClickbait || score <= 3,
    one_sentence_fact: `Событие по компании ${ticker.toUpperCase()}: ${news_text.slice(0, 120)}...`,
    voice_of_reason: `Эмоциональная реакция толпы на подобные инфоповоды часто преувеличена. В фундаментальном масштабе бизнеса компании (${fundamentalContext || 'капитализация сотни млрд $'}) данное событие закладывает минимальное колебание денежного потока. Сохраняйте хладнокровие.`,
    historical_precedent: 'В прошлом аналогичные заголовки вызывали краткосрочную волатильность в пределах 1-2%, после чего котировки возвращались к фундаментальному тренду отчетов.',
    educational_takeaway: 'Всегда сопоставляйте абсолютный масштаб цифр из новости с капитализацией и квартальной выручкой компании. Контракт на несколько миллионов — это фоновый шум для гиганта.',
    risk_flags: riskFlags.length > 0 ? riskFlags : ['Локальный инфоповод', 'Рыночный шум'],
    fundamental_context: fundamentalContext,
  };
}
