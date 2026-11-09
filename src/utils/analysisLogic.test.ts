import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyImpactScore,
  calculatePortfolioRisk,
  generateHeuristicAnalysis,
  validateAnalysisStructure,
} from './analysisLogic.ts';

test('classifyImpactScore correctly categorizes scores from 1 to 10', () => {
  assert.equal(classifyImpactScore(1).level, 'noise');
  assert.equal(classifyImpactScore(3).level, 'noise');
  assert.equal(classifyImpactScore(4).level, 'moderate');
  assert.equal(classifyImpactScore(6).level, 'moderate');
  assert.equal(classifyImpactScore(7).level, 'high');
  assert.equal(classifyImpactScore(8).level, 'high');
  assert.equal(classifyImpactScore(9).level, 'tectonic');
  assert.equal(classifyImpactScore(10).level, 'tectonic');
});

test('calculatePortfolioRisk identifies dangerous single-sector skew', () => {
  const portfolio = [
    { ticker: 'NVDA', weight_percent: 50 },
    { ticker: 'AAPL', weight_percent: 30 },
    { ticker: 'MSFT', weight_percent: 20 },
  ];
  const companies = {
    NVDA: { sector: 'Technology' },
    AAPL: { sector: 'Technology' },
    MSFT: { sector: 'Technology' },
  };

  const result = calculatePortfolioRisk(portfolio, companies);
  assert.equal(result.portfolio_risk_level, 'Dangerous');
  assert.equal(result.sector_allocation[0].sector, 'Technology');
  assert.equal(result.sector_allocation[0].weight_percent, 100);
  assert.match(result.main_vulnerability, /Критический перекос/);
});

test('calculatePortfolioRisk marks diversified multi-sector portfolio as conservative', () => {
  const portfolio = [
    { ticker: 'AAPL', weight_percent: 25 },
    { ticker: 'JNJ', weight_percent: 25 },
    { ticker: 'XOM', weight_percent: 25 },
    { ticker: 'JPM', weight_percent: 25 },
  ];
  const companies = {
    AAPL: { sector: 'Technology' },
    JNJ: { sector: 'Healthcare' },
    XOM: { sector: 'Energy' },
    JPM: { sector: 'Finance' },
  };

  const result = calculatePortfolioRisk(portfolio, companies);
  assert.equal(result.portfolio_risk_level, 'Conservative');
  assert.equal(result.sector_allocation.length, 4);
});

test('generateHeuristicAnalysis properly identifies clickbait and scale', () => {
  const analysis = generateHeuristicAnalysis(
    'AAPL',
    'Шок и паника! Новый дизайн иконки вызвал катастрофические обсуждения!',
    'Капитализация $3.5T, выручка $95B в квартал'
  );
  assert.equal(analysis.is_clickbait_or_noise, true);
  assert.ok(analysis.impact_score <= 3);
  assert.ok(analysis.risk_flags.some((f) => f.includes('Кликбейт') || f.includes('шум')));
});

test('validateAnalysisStructure checks required fields', () => {
  assert.equal(
    validateAnalysisStructure({
      impact_score: 5,
      voice_of_reason: 'Calm explanation',
      one_sentence_fact: 'Fact text',
    }),
    true
  );
  assert.equal(validateAnalysisStructure({ invalid: true }), false);
});
