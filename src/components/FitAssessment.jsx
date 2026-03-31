import { useEffect, useMemo, useState } from 'react';
import {
  assessmentQuestions,
  coreQuestionIds,
  evaluateAssessment,
  tierDetails,
  alternativeRecommendations,
  personaCopy,
} from '../data/assessmentQuestions';

const MIN_CORE_FOR_SKIP = 5;

function QuestionCard({ question, answer, onAnswer }) {
  if (question.type === 'select') {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: '0s', opacity: 0 }}>
        <div className="assess-q-header">
          <h3 className="assess-q-title">{question.question}</h3>
        </div>
        <div className="assess-options">
          {question.options.map((opt) => {
            const isActive = answer === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onAnswer(question.id, opt.value)}
                className={`assess-option ${isActive ? 'assess-option-active' : ''}`}
              >
                <div className="assess-option-content">
                  <div className="assess-option-text">
                    <span className={`assess-option-label ${isActive ? 'assess-option-label-active' : ''}`}>
                      {opt.label}
                    </span>
                    {opt.description && <p className="assess-option-desc">{opt.description}</p>}
                  </div>
                  <span className={`assess-radio ${isActive ? 'assess-radio-active' : ''}`}>
                    {isActive && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13L9 17L19 7" />
                      </svg>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'multiselect') {
    const selected = answer || [];
    const toggleOption = (value) => {
      if (value === 'none') { onAnswer(question.id, ['none']); return; }
      let next = selected.filter((v) => v !== 'none');
      next = next.includes(value) ? next.filter((v) => v !== value) : [...next, value];
      onAnswer(question.id, next.length === 0 ? ['none'] : next);
    };

    return (
      <div className="animate-fade-in-up" style={{ animationDelay: '0s', opacity: 0 }}>
        <div className="assess-q-header">
          <div>
            <h3 className="assess-q-title">{question.question}</h3>
            <p className="assess-q-hint">Select all that apply</p>
          </div>
        </div>
        <div className="assess-options">
          {question.options.map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={`assess-option ${isChecked ? 'assess-option-active' : ''}`}
              >
                <div className="assess-option-content" style={{ justifyContent: 'flex-start' }}>
                  <span className={`assess-checkbox ${isChecked ? 'assess-checkbox-active' : ''}`}>
                    {isChecked && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13L9 17L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`assess-option-label ${isChecked ? 'assess-option-label-active' : ''}`}>
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'input') {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: '0s', opacity: 0 }}>
        <div className="assess-q-header">
          <h3 className="assess-q-title">{question.question}</h3>
        </div>
        <div className="assess-input-wrap">
          <input
            type="number"
            value={answer || ''}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="assess-input"
          />
          {question.unit && <span className="assess-input-unit">{question.unit}</span>}
        </div>
      </div>
    );
  }

  return null;
}

// Map assessment answers → pricing context
function buildPricingContext(answers, result) {
  const tierMap = { starter: 'starter', essential: 'essential', dedicated: 'dedicated', byoc: 'dedicated', selfmanaged: 'selfmanaged' };
  const tab = tierMap[result.tier] || 'starter';

  const qpsMap = { low: 500, medium: 5000, high: 50000, very_high: 150000 };
  const qps = qpsMap[answers.qps] || 5000;

  const writeRatioMap = { read_heavy: 0.9, balanced: 0.6, write_heavy: 0.3 };
  const readRatio = writeRatioMap[answers.write_ratio] || 0.9;

  const storageSizeMap = { small: 5, medium: 50, large: 500, xlarge: 3000, massive: 10000 };
  const storageGiB = storageSizeMap[answers.db_size] || 50;

  const advancedFeatures = answers.advanced_features || [];
  const needsTiFlash = answers.workload_type === 'htap' || advancedFeatures.includes('htap');

  return { tab, qps, readRatio, storageGiB, needsTiFlash };
}

// ── Fit Score Ring ──
function FitScoreRing({ score, fitMessage }) {
  const scoreColor = score >= 70 ? '#34C759' : score >= 50 ? '#FF9F0A' : score >= 30 ? '#FF9F0A' : '#FF3B30';

  const fitMessages = {
    great_fit: { text: 'TiDB is a great fit!', emoji: '🎯' },
    good_fit: { text: 'TiDB is a good fit', emoji: '✅' },
    possible_with_effort: { text: 'TiDB could work with effort', emoji: '⚠️' },
    not_recommended: { text: 'TiDB may not be the right choice', emoji: '🔴' },
  };
  const fitInfo = fitMessages[fitMessage] || fitMessages.good_fit;

  return (
    <div className="assess-score-wrap">
      <div className="assess-score-ring">
        <svg className="assess-score-svg" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#f5f5f7" strokeWidth="7" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke={scoreColor} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${score * 3.267} 326.7`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          />
        </svg>
        <div className="assess-score-inner">
          <span className="assess-score-num" style={{ color: scoreColor }}>{score}</span>
          <span className="assess-score-label">fit score</span>
        </div>
      </div>
      <h3 className="assess-score-title">
        <span style={{ color: scoreColor }}>{fitInfo.emoji} {fitInfo.text}</span>
      </h3>
    </div>
  );
}

// ── Result Section Components ──

function ResultSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="assess-result-section">
      <button className="assess-result-section-header" onClick={() => setOpen(!open)}>
        <span className="assess-result-section-icon">{icon}</span>
        <h4 className="assess-result-section-title">{title}</h4>
        <span className={`assess-result-chevron ${open ? 'open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && <div className="assess-result-section-body">{children}</div>}
    </div>
  );
}

function BulletList({ items, type = 'success' }) {
  const icons = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>,
    warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M12 3L2 21h20L12 3z" /></svg>,
    info: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>,
  };
  if (!items || items.length === 0) return null;
  return (
    <div className="assess-bullet-list">
      {items.map((item, i) => (
        <div key={i} className={`assess-bullet assess-bullet-${type}`}>
          <span className="assess-bullet-icon">{icons[type]}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TierCard({ tier, tierExplanation }) {
  const t = tierDetails[tier];
  if (!t) return null;

  return (
    <div className="assess-tier-card" style={{ borderColor: t.color + '30' }}>
      <div className="assess-tier-header">
        <div className="assess-tier-icon" style={{ background: t.color + '12' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div>
          <p className="assess-tier-label">Recommended Tier</p>
          <h4 className="assess-tier-name" style={{ color: t.color }}>{t.name}</h4>
          <p className="assess-tier-tagline">{t.tagline}</p>
          <p className="assess-tier-price">{t.price}</p>
        </div>
      </div>
      {tierExplanation && (
        <p className="assess-tier-explanation">{tierExplanation}</p>
      )}
      <div className="assess-tier-features">
        {t.features.map((f, i) => (
          <div key={i} className="assess-tier-feature">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13L9 17L19 7" />
            </svg>
            <span>{f}</span>
          </div>
        ))}
      </div>
      {t.limitations.length > 0 && (
        <div className="assess-tier-limits">
          {t.limitations.map((l, i) => (
            <div key={i} className="assess-tier-limit">
              <span className="assess-tier-limit-icon">!</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlternativeRecommendation({ category }) {
  const alt = alternativeRecommendations[category];
  if (!alt) return null;

  return (
    <div className="assess-alternative">
      <div className="assess-alternative-header">
        <span className="assess-alternative-icon">💡</span>
        <h4>{alt.title}</h4>
      </div>
      <p className="assess-alternative-desc">{alt.description}</p>
      <div className="assess-alternative-dbs">
        {alt.databases.map((db, i) => (
          <span key={i} className="assess-alternative-chip">{db}</span>
        ))}
      </div>
      <p className="assess-alternative-caveat">{alt.caveat}</p>
    </div>
  );
}

function CompatibilityWorkshopBanner() {
  return (
    <div className="assess-workshop-banner">
      <div className="assess-workshop-icon">🔧</div>
      <div>
        <h4>Compatibility Workshop Recommended</h4>
        <p>Your current database uses features (stored procedures, triggers, or PL extensions) that need careful migration planning. A compatibility workshop will map out the refactoring path and estimate effort.</p>
      </div>
    </div>
  );
}

function NextStepCTA({ step, persona }) {
  const stepConfig = {
    'Migration Feasibility Check': {
      description: 'Validate schema compatibility, identify migration blockers, and get a timeline estimate.',
      icon: '🔄',
    },
    'Architecture Workshop': {
      description: 'Design the target architecture, map your data model to relational/SQL patterns, and plan the migration.',
      icon: '🏗️',
    },
    'HTAP Proof of Value': {
      description: 'Run your analytical queries on TiFlash alongside transactional workloads to measure real-time analytics performance.',
      icon: '📊',
    },
    'Compatibility Workshop': {
      description: 'Map stored procedures, triggers, and extensions to application-layer equivalents with effort estimates.',
      icon: '🔧',
    },
    'Performance & Operations PoC': {
      description: 'Benchmark your workload on TiDB, validate latency and throughput, and evaluate operational workflows.',
      icon: '⚡',
    },
  };

  const config = stepConfig[step] || stepConfig['Performance & Operations PoC'];
  const pc = persona ? personaCopy[persona] : null;

  return (
    <div className="assess-next-step">
      <div className="assess-next-step-header">
        <span className="assess-next-step-icon">{config.icon}</span>
        <div>
          <h4>Next Step: {step}</h4>
          <p>{config.description}</p>
        </div>
      </div>
      <div className="assess-next-step-actions">
        {pc && (
          <a href={pc.ctaUrl} target="_blank" rel="noopener noreferrer" className="pill-btn pill-btn-dark">
            {pc.ctaLabel}
          </a>
        )}
        <a href="https://tidbcloud.com/free-trial" target="_blank" rel="noopener noreferrer" className="pill-btn pill-btn-outline">
          Start a free cluster
        </a>
      </div>
    </div>
  );
}

// ── Main Result Card ──

function ResultCard({ result, answers }) {
  const persona = answers.primary_buyer;
  const pc = persona ? personaCopy[persona] : null;

  return (
    <div className="animate-fade-in-up assess-result-full" style={{ opacity: 0 }}>
      {/* Persona headline */}
      {pc && <p className="assess-persona-headline">{pc.headline}</p>}

      {/* Score ring */}
      <FitScoreRing score={result.score} fitMessage={result.fitMessage} />

      {/* Alternative recommendation if weak fit */}
      {result.alternativeCategory && result.score < 50 && (
        <AlternativeRecommendation category={result.alternativeCategory} />
      )}

      {/* Compatibility workshop banner */}
      {result.compatibilityWorkshop && <CompatibilityWorkshopBanner />}

      {/* Why TiDB fits */}
      {result.advantages.length > 0 && (
        <ResultSection title="Why TiDB Fits" icon="✅" defaultOpen={true}>
          <BulletList items={result.advantages} type="success" />
        </ResultSection>
      )}

      {/* What to validate first */}
      {result.validationChecklist.length > 0 && (
        <ResultSection title="What to Validate First" icon="🔍" defaultOpen={true}>
          <BulletList items={result.validationChecklist} type="check" />
        </ResultSection>
      )}

      {/* Things to consider */}
      {result.warnings.length > 0 && (
        <ResultSection title="Things to Consider" icon="⚠️" defaultOpen={true}>
          <BulletList items={result.warnings} type="warning" />
        </ResultSection>
      )}

      {/* Deployment recommendation */}
      <ResultSection title="Deployment Recommendation" icon="🚀" defaultOpen={true}>
        <TierCard tier={result.tier} tierExplanation={result.tierExplanation} />
        {result.deploymentNotes.length > 0 && (
          <BulletList items={result.deploymentNotes} type="info" />
        )}
      </ResultSection>

      {/* Next best step */}
      <ResultSection title="Recommended Next Step" icon="👉" defaultOpen={true}>
        <NextStepCTA step={result.nextBestStep} persona={persona} />
      </ResultSection>
    </div>
  );
}

export default function FitAssessment({ onEstimateCosts }) {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleQuestions = useMemo(() =>
    assessmentQuestions.filter((q) => !q.condition || q.condition(answers)),
    [answers]
  );

  const answeredCount = visibleQuestions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== '' && a !== null && (!Array.isArray(a) || a.length > 0);
  }).length;

  const progress = visibleQuestions.length > 0 ? (answeredCount / visibleQuestions.length) * 100 : 0;
  const allAnswered = answeredCount === visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentIndex];

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setShowResult(false);
  };

  const result = useMemo(() => showResult ? evaluateAssessment(answers) : null, [showResult, answers]);

  useEffect(() => {
    if (currentIndex > visibleQuestions.length - 1) setCurrentIndex(Math.max(visibleQuestions.length - 1, 0));
  }, [currentIndex, visibleQuestions.length]);

  const handleReset = () => { setAnswers({}); setShowResult(false); setCurrentIndex(0); };

  const currentAnswered = currentQuestion
    ? answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '' && answers[currentQuestion.id] !== null && (!Array.isArray(answers[currentQuestion.id]) || answers[currentQuestion.id].length > 0)
    : false;

  const canSkipEarly = useMemo(() => {
    const coreAnswered = coreQuestionIds.filter((id) => {
      const a = answers[id];
      return a !== undefined && a !== '' && a !== null;
    }).length;
    return coreAnswered >= MIN_CORE_FOR_SKIP && answeredCount >= 7 && currentIndex < visibleQuestions.length - 1;
  }, [answers, answeredCount, currentIndex, visibleQuestions.length]);

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Fit Assessment</h1>
          <p className="page-subtitle">Answer a few questions about your workload and pain points to see if TiDB is the right fit — and which tier to start with.</p>
        </div>

        <div className="assess-wrap">
          <div className="page-card">
            {/* Progress */}
            <div className="assess-progress">
              <div className="assess-progress-track">
                <div className="assess-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {!showResult && currentQuestion && (
              <div>
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswer={handleAnswer}
                />

                <div className="assess-nav">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((v) => Math.max(v - 1, 0))}
                    disabled={currentIndex === 0}
                    className="pill-btn pill-btn-outline"
                  >
                    Back
                  </button>
                  <div className="assess-nav-right">
                    {answeredCount > 0 && (
                      <button type="button" onClick={handleReset} className="pill-btn pill-btn-ghost">Reset</button>
                    )}
                    {currentIndex < visibleQuestions.length - 1 ? (
                      <>
                        {canSkipEarly && currentAnswered && (
                          <button
                            type="button"
                            onClick={() => setShowResult(true)}
                            className="pill-btn pill-btn-outline"
                          >
                            Get recommendation
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentIndex((v) => Math.min(v + 1, visibleQuestions.length - 1))}
                          disabled={!currentAnswered}
                          className="pill-btn pill-btn-dark"
                        >
                          Next
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResult(true)}
                        disabled={!allAnswered}
                        className="pill-btn pill-btn-dark"
                      >
                        Get recommendation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showResult && result && (
              <div>
                <ResultCard result={result} answers={answers} />
                <div className="assess-result-actions">
                  {onEstimateCosts && result.tier !== 'selfmanaged' && (
                    <button
                      onClick={() => onEstimateCosts(buildPricingContext(answers, result))}
                      className="pill-btn pill-btn-dark"
                    >
                      Estimate costs for {tierDetails[result.tier]?.name || result.tier}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  )}
                  <button onClick={() => setShowResult(false)} className="pill-btn pill-btn-outline">Edit answers</button>
                  <button onClick={handleReset} className="pill-btn pill-btn-ghost">Start over</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
