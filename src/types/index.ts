export type ImpactDirection = 'Positive' | 'Negative' | 'Neutral';

export interface NewsAnalysis {
  id: string;
  ticker: string;
  company_name: string;
  news_text: string;
  source: string;
  published_at: string;
  impact_direction: ImpactDirection;
  impact_score: number; // 1 to 10
  is_clickbait_or_noise: boolean;
  one_sentence_fact: string;
  voice_of_reason: string;
  historical_precedent: string;
  educational_takeaway: string;
  risk_flags: string[];
  fundamental_context?: string;
}

export interface CompanyFundamental {
  ticker: string;
  name: string;
  sector: string;
  pe_ratio: number;
  market_cap_billions: number;
  revenue_yoy_growth: number; // percentage e.g. 15.4
  quarterly_revenue: { quarter: string; revenue_billions: number }[];
  seasonality_note: string;
  high_base_effect_note?: string;
}

export interface PortfolioItem {
  ticker: string;
  shares?: number;
  weight_percent: number;
}

export interface SectorAllocation {
  sector: string;
  weight_percent: number;
}

export type RiskLevel = 'Conservative' | 'Moderate' | 'Aggressive' | 'Dangerous';

export interface PortfolioAnalysisResult {
  sector_allocation: SectorAllocation[];
  portfolio_risk_level: RiskLevel;
  main_vulnerability: string;
  diversification_advice: string;
  educational_tip: string;
  skew_summary?: string;
}

export interface QuizQuestion {
  id: string;
  ticker: string;
  headline: string;
  context: string;
  fundamental_snapshot: string;
  actual_analysis: NewsAnalysis;
  trap_bias: 'FUD (Паника на ровном месте)' | 'FOMO (Покупка на хаях)' | 'Игнорирование сезонности' | 'Шум против бизнеса';
}
