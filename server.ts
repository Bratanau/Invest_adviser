import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { KNOWN_COMPANIES, INITIAL_NEWS_FEED } from './src/data/mockData.ts';
import { generateHeuristicAnalysis, calculatePortfolioRisk } from './src/utils/analysisLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini API client
const rawApiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = rawApiKey && !rawApiKey.includes('MY_GEMINI_API_KEY') && rawApiKey.trim().length > 10;
let ai: GoogleGenAI | null = null;
if (isRealApiKey) {
  ai = new GoogleGenAI({
    apiKey: rawApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
  ]);
}

// In-memory news storage seeded with curated feed
let newsFeed = [...INITIAL_NEWS_FEED];

// System Prompt #2: The Core AI Engine
const SYSTEM_PROMPT_CORE_AI = `
Ты — опытный, хладнокровный аналитик инвестиционного фонда с 15-летним стажем. Твоя специализация — фундаментальный анализ и защита частных инвесторов от рыночного шума, FUD (страха) и FOMO (жадности).

Твоя цель: Получив новость о компании и базовые фундаментальные/исторические данные, выдать трезвую оценку реального влияния события на бизнес. Ты учишь пользователя мыслить как профессионал.

Правила анализа:
1. Проверяй сезонность: падение продаж в Q1 после рекордного новогоднего Q4 — это норма, а не кризис.
2. Ищи базу сравнения: падение прибыли может быть следствием высокой базы прошлого года.
3. Отделяй шум от фактов: громкие заголовки вроде "Компания представила новый дизайн" часто имеют нулевое влияние на операционную прибыль.
4. Учитывай масштаб: контракт на $10 млн для компании с капитализацией $500 млрд — это 0.002% бизнеса (шум).
5. НИКАКИХ прямых рекомендаций "купить" или "продать" (юридическое ограничение). Оперируй понятиями: "влияние незначительно", "риск переоценен", "требует подтверждения в отчете".
`;

// System Prompt #3: Portfolio Balancer & Sector Risk Evaluator
const SYSTEM_PROMPT_PORTFOLIO_BALANCER = `
Ты — финансовый советник и риск-менеджер. Твоя задача — оценить диверсификацию портфеля пользователя и дать образовательные советы по балансировке.

Входные данные:
Список тикеров и их процентные доли в портфеле пользователя.

Твоя задача:
1. Сгруппировать тикеры по секторам (Technology, Healthcare, Energy, Finance, Consumer Defensive, Consumer Discretionary, Utilities и т.д.).
2. Определить коэффициент перекоса (например: "80% в акциях технологического сектора").
3. Выявить уязвимости портфеля (например: "Высокая чувствительность к процентным ставкам ФРС и мультипликаторам переоцененности").
4. Предложить 2-3 сектора для балансировки с объяснением "Зачем?", без конкретного призыва покупать конкретную акцию (предлагай смотреть на защитные отрасли/индексы).
`;

// API: Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: !!isRealApiKey, timestamp: new Date().toISOString() });
});

// API: Known companies fundamentals
app.get('/api/tickers', (_req: Request, res: Response) => {
  res.json(KNOWN_COMPANIES);
});

// API: News feed
app.get('/api/feed', (_req: Request, res: Response) => {
  res.json(newsFeed);
});

// API: Prompts and architecture metadata
app.get('/api/prompts', (_req: Request, res: Response) => {
  res.json({
    prompt1_architect: `Промпт №1: Архитектор и разработчик (FastAPI + Telegram WebApp + Postgres)`,
    prompt2_core_ai: SYSTEM_PROMPT_CORE_AI,
    prompt3_portfolio_balancer: SYSTEM_PROMPT_PORTFOLIO_BALANCER,
    database_schema: `
-- PostgreSQL DDL for "Голос Разума" TMA
CREATE TABLE users (
  id BIGINT PRIMARY KEY, -- Telegram user ID
  username VARCHAR(64),
  first_name VARCHAR(128),
  risk_profile VARCHAR(32) DEFAULT 'Moderate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tickers (
  ticker VARCHAR(16) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  sector VARCHAR(64) NOT NULL,
  market_cap_billions NUMERIC,
  pe_ratio NUMERIC,
  revenue_yoy_growth NUMERIC,
  fundamental_context TEXT
);

CREATE TABLE user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  ticker VARCHAR(16) REFERENCES tickers(ticker),
  weight_percent NUMERIC NOT NULL CHECK (weight_percent >= 0 AND weight_percent <= 100),
  UNIQUE(user_id, ticker)
);

CREATE TABLE news_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(16) REFERENCES tickers(ticker),
  headline TEXT NOT NULL,
  impact_direction VARCHAR(16) NOT NULL, -- 'Positive' | 'Negative' | 'Neutral'
  impact_score INT NOT NULL CHECK (impact_score >= 1 AND impact_score <= 10),
  is_clickbait_or_noise BOOLEAN DEFAULT false,
  one_sentence_fact TEXT NOT NULL,
  voice_of_reason TEXT NOT NULL,
  historical_precedent TEXT,
  educational_takeaway TEXT,
  risk_flags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `,
  });
});

// API: Analyze News with Prompt #2
app.post('/api/analyze-news', async (req: Request, res: Response) => {
  try {
    const { ticker, news_text, fundamental_context } = req.body;
    if (!ticker || !news_text) {
      res.status(400).json({ error: 'Параметры ticker и news_text обязательны' });
      return;
    }

    const upperTicker = (ticker as string).toUpperCase();
    const company = KNOWN_COMPANIES[upperTicker];
    const resolvedFundamental =
      fundamental_context ||
      (company
        ? `Капитализация $${company.market_cap_billions} млрд, P/E ${company.pe_ratio}, Рост выручки YoY ${company.revenue_yoy_growth}%, сезонность: ${company.seasonality_note}`
        : 'Рыночные данные отсутствуют');

    if (ai) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Проанализируй следующую новость строго по правилам инвестиционного аналитика:\nТикер компании: ${upperTicker}\nТекст новости: ${news_text}\nФундаментальный контекст: ${resolvedFundamental}`,
            config: {
              systemInstruction: SYSTEM_PROMPT_CORE_AI,
              responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                impact_direction: {
                  type: Type.STRING,
                  enum: ['Positive', 'Negative', 'Neutral'],
                  description: 'Positive, Negative, or Neutral',
                },
                impact_score: {
                  type: Type.INTEGER,
                  description: 'Integer from 1 to 10 (1 - noise, 10 - tectonic shift)',
                },
                is_clickbait_or_noise: {
                  type: Type.BOOLEAN,
                  description: 'Whether headline is clickbait or noise',
                },
                one_sentence_fact: {
                  type: Type.STRING,
                  description: 'Short essence of the news without water (1 sentence)',
                },
                voice_of_reason: {
                  type: Type.STRING,
                  description: 'Explanation in simple words why crowd panics or hypes, but reality is calmer. 2-3 sentences.',
                },
                historical_precedent: {
                  type: Type.STRING,
                  description: 'What happened before in a similar situation and what market did',
                },
                educational_takeaway: {
                  type: Type.STRING,
                  description: 'What this teaches the investor',
                },
                risk_flags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Array of tag strings',
                },
              },
              required: [
                'impact_direction',
                'impact_score',
                'is_clickbait_or_noise',
                'one_sentence_fact',
                'voice_of_reason',
                'historical_precedent',
                'educational_takeaway',
                'risk_flags',
              ],
            },
          },
        }));

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const newAnalysis = {
            id: `analysis-${Date.now()}`,
            ticker: upperTicker,
            company_name: company ? company.name : upperTicker,
            news_text,
            source: 'AI Аналитическое Ядро (Gemini 3.8 Flash)',
            published_at: 'Только что',
            impact_direction: parsed.impact_direction || 'Neutral',
            impact_score: parsed.impact_score || 3,
            is_clickbait_or_noise: Boolean(parsed.is_clickbait_or_noise),
            one_sentence_fact: parsed.one_sentence_fact || 'Факты проверяются.',
            voice_of_reason: parsed.voice_of_reason || '',
            historical_precedent: parsed.historical_precedent || '',
            educational_takeaway: parsed.educational_takeaway || '',
            risk_flags: Array.isArray(parsed.risk_flags) ? parsed.risk_flags : ['Рыночный шум'],
            fundamental_context: resolvedFundamental,
          };

          // Prepend to feed
          newsFeed = [newAnalysis, ...newsFeed];
          res.json(newAnalysis);
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini generateContent error, falling back to heuristic engine:', geminiError);
      }
    }

    // Heuristic fallback
    const heuristic = generateHeuristicAnalysis(upperTicker, news_text, resolvedFundamental);
    const newAnalysis = {
      id: `analysis-${Date.now()}`,
      ...heuristic,
      published_at: 'Только что',
    };
    newsFeed = [newAnalysis, ...newsFeed];
    res.json(newAnalysis);
  } catch (error) {
    console.error('Error analyzing news:', error);
    res.status(500).json({ error: 'Ошибка сервера при анализе новости' });
  }
});

// API: Analyze Portfolio with Prompt #3
app.post('/api/analyze-portfolio', async (req: Request, res: Response) => {
  try {
    const { portfolio } = req.body;
    if (!Array.isArray(portfolio) || portfolio.length === 0) {
      res.status(400).json({ error: 'Портфель должен содержать массив тикеров' });
      return;
    }

    if (ai) {
      try {
        const portfolioDescription = portfolio
          .map((item) => `${item.ticker}: ${item.weight_percent}% (Сектор: ${KNOWN_COMPANIES[item.ticker]?.sector || 'Неизвестен'})`)
          .join('\n');

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Оцени данный инвестиционный портфель по правилам риск-менеджмента:\n${portfolioDescription}`,
            config: {
              systemInstruction: SYSTEM_PROMPT_PORTFOLIO_BALANCER,
              responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sector_allocation: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      sector: { type: Type.STRING },
                      weight_percent: { type: Type.NUMBER },
                    },
                    required: ['sector', 'weight_percent'],
                  },
                },
                portfolio_risk_level: {
                  type: Type.STRING,
                  enum: ['Conservative', 'Moderate', 'Aggressive', 'Dangerous'],
                },
                main_vulnerability: { type: Type.STRING },
                diversification_advice: { type: Type.STRING },
                educational_tip: { type: Type.STRING },
              },
              required: [
                'sector_allocation',
                'portfolio_risk_level',
                'main_vulnerability',
                'diversification_advice',
                'educational_tip',
              ],
            },
          },
        }));

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          res.json(parsed);
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini portfolio evaluation error, using heuristic evaluator:', geminiError);
      }
    }

    // Heuristic fallback
    const result = calculatePortfolioRisk(portfolio, KNOWN_COMPANIES);
    res.json(result);
  } catch (error) {
    console.error('Error evaluating portfolio:', error);
    res.status(500).json({ error: 'Ошибка сервера при оценке портфеля' });
  }
});

// Setup Vite development server middleware or static serve for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telegram Mini App "Голос Разума" running on http://localhost:${PORT}`);
  });
}

startServer();
