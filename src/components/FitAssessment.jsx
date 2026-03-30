import { useEffect, useMemo, useState } from 'react';
import { assessmentQuestions, evaluateAssessment, tierDetails } from '../data/assessmentQuestions';

const coreQuestionIds = ['db_size', 'workload_type', 'qps', 'current_db', 'budget', 'cloud_preference', 'availability'];
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
                <div className="assess-option-content">
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

function ResultCard({ result }) {
  const tier = tierDetails[result.tier];
  const scoreColor = result.score >= 80 ? '#34C759' : result.score >= 60 ? '#FF9F0A' : '#FF3B30';

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0 }}>
      <div className="assess-score-wrap">
        <div className="assess-score-ring">
          <svg className="assess-score-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f5f5f7" strokeWidth="7" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={scoreColor} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${result.score * 3.267} 326.7`}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
            />
          </svg>
          <div className="assess-score-inner">
            <span className="assess-score-num" style={{ color: scoreColor }}>{result.score}</span>
            <span className="assess-score-label">out of 100</span>
          </div>
        </div>
        <h3 className="assess-score-title">
          {result.isGoodFit
            ? <span style={{ color: '#34C759' }}>TiDB is a great fit!</span>
            : <span style={{ color: '#FF9F0A' }}>TiDB may work with adjustments</span>
          }
        </h3>
      </div>

      {tier && (
        <div className="assess-tier-card" style={{ borderColor: tier.color + '30' }}>
          <div className="assess-tier-header">
            <div className="assess-tier-icon" style={{ background: tier.color + '12' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <p className="assess-tier-label">Recommended Tier</p>
              <h4 className="assess-tier-name" style={{ color: tier.color }}>{tier.name}</h4>
              <p className="assess-tier-tagline">{tier.tagline}</p>
              <p className="assess-tier-price">{tier.price}</p>
            </div>
          </div>
          <div className="assess-tier-features">
            {tier.features.map((f, i) => (
              <div key={i} className="assess-tier-feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13L9 17L19 7" />
                </svg>
                <span>{f}</span>
              </div>
            ))}
          </div>
          {tier.limitations.length > 0 && (
            <div className="assess-tier-limits">
              {tier.limitations.map((l, i) => (
                <div key={i} className="assess-tier-limit">
                  <span className="assess-tier-limit-icon">!</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result.advantages.length > 0 && <InfoSection title="Why TiDB Works" items={result.advantages} type="success" />}
      {result.warnings.length > 0 && <InfoSection title="Things to Consider" items={result.warnings} type="warning" />}
      {result.reasons.length > 0 && <InfoSection title="Additional Notes" items={result.reasons} type="info" />}
    </div>
  );
}

function InfoSection({ title, items, type }) {
  const styles = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  };
  const s = styles[type];
  return (
    <div className="assess-info-section">
      <h4 className="assess-info-title">{title}</h4>
      {items.map((item, i) => (
        <div key={i} className="assess-info-item" style={{ background: s.bg, borderColor: s.border, color: s.text }}>
          {item}
        </div>
      ))}
    </div>
  );
}

export default function FitAssessment() {
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
          <p className="page-subtitle">Answer a few questions about your workload to get a TiDB deployment recommendation.</p>
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
                <ResultCard result={result} />
                <div className="assess-result-actions">
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
