import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  databases, tidb, featureLabels, featureSections, categoryOrder,
  rowPresets, competitorArchetypes, defaultArchetype,
  qualificationRisks,
} from '../data/databases';

const featuredDatabaseIds = [
  'mysql', 'postgresql', 'aurora', 'oracle',
  'sqlserver', 'cockroachdb', 'spanner', 'mongodb',
];

const limitedWords = [
  'limited', 'partial', 'experimental', 'preview', 'manual', 'basic', 'select region',
  'beta', 'rolling out', 'via pg', 'via redi', 'via plugin', 'plugin', 'extension',
  'app-level', 'plan-dependent', 'per-shard', 'per-partition', 'managed only',
  'server-side event', 'check current', 'not to zero', 'sleep mode',
  'cross-db', 'geohash', 'pgvector', 'cql-compatible',
];

const redWords = ['no native', 'unsupported'];

function getStrengthScore(value) {
  if (value === true) return 2;
  if (value === false || value === undefined || value === null) return 0;
  const str = String(value).toLowerCase();
  if (redWords.some((w) => str.includes(w))) return 0;
  if (limitedWords.some((w) => str.includes(w))) return 1;
  return 2;
}

function FeatureValue({ value }) {
  if (value === true) {
    return (
      <div className="fv-wrap">
        <span className="feature-badge feature-badge-yes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
        </span>
      </div>
    );
  }
  if (value === false || value === undefined || value === null) {
    return (
      <div className="fv-wrap">
        <span className="feature-badge feature-badge-no">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18" /></svg>
        </span>
      </div>
    );
  }
  const str = String(value);
  const lower = str.toLowerCase();
  const isRed = redWords.some((w) => lower.includes(w));
  const isLimited = !isRed && limitedWords.some((w) => lower.includes(w));
  if (isRed) {
    return (
      <div className="fv-wrap">
        <span className="feature-badge feature-badge-no">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18" /></svg>
        </span>
        <span className="fv-detail">{str}</span>
      </div>
    );
  }
  return (
    <div className="fv-wrap">
      <span className={`feature-badge ${isLimited ? 'feature-badge-partial' : 'feature-badge-yes'}`}>
        {isLimited ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
        )}
      </span>
      <span className="fv-detail">{str}</span>
    </div>
  );
}

function SymbolLegend() {
  return (
    <div className="symbol-legend">
      <div className="symbol-legend-item">
        <span className="feature-badge feature-badge-yes" style={{ width: 18, height: 18 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg></span>
        <span>Full support</span>
      </div>
      <div className="symbol-legend-item">
        <span className="feature-badge feature-badge-partial" style={{ width: 18, height: 18 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /></svg></span>
        <span className="symbol-legend-label">Partial / qualified
          <span className="symbol-legend-hint">beta, limited rollout, extension/plugin-based, plan-dependent, or app-layer pattern</span>
        </span>
      </div>
      <div className="symbol-legend-item">
        <span className="feature-badge feature-badge-no" style={{ width: 18, height: 18 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18" /></svg></span>
        <span>Not available</span>
      </div>
    </div>
  );
}

/* ─── Dynamic Summary Card ─── */
function SummaryCard({ selectedDbs }) {
  const analysis = useMemo(() => {
    const selectedIds = selectedDbs.map((db) => db.id);
    const archetypes = selectedIds.map((id) => competitorArchetypes[id] || defaultArchetype);

    const mergeUnique = (arrays) => {
      const seen = new Set();
      return arrays.flat().filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      });
    };

    const strengths = mergeUnique(archetypes.map((a) => a.strengths)).slice(0, 5);
    const competitorBetter = mergeUnique(archetypes.map((a) => a.competitorBetter)).slice(0, 4);
    const bestFit = mergeUnique(archetypes.map((a) => a.bestFit)).slice(0, 3);
    const notIdeal = mergeUnique(archetypes.map((a) => a.notIdeal)).slice(0, 4);

    return { strengths, competitorBetter, bestFit, notIdeal };
  }, [selectedDbs]);

  return (
    <div className="summary-card">
      <div className="summary-grid">
        <div className="summary-quadrant summary-q-strength">
          <h4 className="summary-q-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
            Where TiDB is strongest
          </h4>
          <ul className="summary-q-list">{analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="summary-quadrant summary-q-competitor">
          <h4 className="summary-q-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /></svg>
            Where competitors may be better
          </h4>
          <ul className="summary-q-list">{analysis.competitorBetter.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="summary-quadrant summary-q-bestfit">
          <h4 className="summary-q-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>
            Best fit for TiDB
          </h4>
          <ul className="summary-q-list">{analysis.bestFit.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="summary-quadrant summary-q-notideal">
          <h4 className="summary-q-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            Not ideal when...
          </h4>
          <ul className="summary-q-list">{analysis.notIdeal.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

/* ─── Qualification Risks ─── */
function QualificationRisks({ selectedDbs }) {
  const [expanded, setExpanded] = useState(false);
  const selectedIds = selectedDbs.map((db) => db.id);
  const risks = qualificationRisks.filter((r) => r.condition.some((id) => selectedIds.includes(id)));

  if (risks.length === 0) return null;

  return (
    <div className="qual-risks">
      <button type="button" className="qual-risks-toggle" onClick={() => setExpanded(!expanded)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="10" /></svg>
        <span>Qualification risks for this comparison</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {expanded && (
        <div className="qual-risks-body">
          <p className="qual-risks-note">These are things to validate early before moving forward.</p>
          <ul className="qual-risks-list">
            {risks.map((r, i) => <li key={i}>{r.text}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function DatabaseCard({ db, selected, onToggle }) {
  return (
    <button type="button" onClick={() => onToggle(db.id)} className={`db-card ${selected ? 'db-card-selected' : ''}`}>
      <div className="db-card-top">
        <div className="db-card-logo">
          <img src={db.logo} alt={db.name} className="db-card-logo-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = db.name[0]; e.currentTarget.parentElement.style.fontSize = '1.1rem'; e.currentTarget.parentElement.style.fontWeight = '700'; e.currentTarget.parentElement.style.color = '#86868b'; }} />
        </div>
        <span className={`db-card-badge ${selected ? 'db-card-badge-active' : ''}`}>{db.category}</span>
      </div>
      <strong className="db-card-name">{db.name}</strong>
      <span className="db-card-type">{db.type}</span>
    </button>
  );
}

function DatabasePicker({ searchTerm, onSearchChange, selected, onToggle, showAll, onToggleAll }) {
  const featured = databases.filter((db) => featuredDatabaseIds.includes(db.id));
  const filtered = databases.filter((db) => {
    const term = searchTerm.toLowerCase();
    return db.name.toLowerCase().includes(term) || db.type.toLowerCase().includes(term) || db.category.toLowerCase().includes(term);
  });
  const grouped = categoryOrder.map((cat) => ({ category: cat, items: filtered.filter((db) => db.category === cat) })).filter((g) => g.items.length > 0);

  return (
    <div className="db-picker">
      <div className="db-search-wrap">
        <svg className="db-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21L16.65 16.65" /></svg>
        <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search databases..." className="db-search-input" />
      </div>
      {searchTerm ? (
        grouped.length > 0 ? grouped.map(({ category, items }) => (
          <div key={category}>
            <p className="db-section-label">{category}</p>
            <div className="db-grid db-grid-3">{items.map((db) => <DatabaseCard key={db.id} db={db} selected={selected.includes(db.id)} onToggle={onToggle} />)}</div>
          </div>
        )) : <p style={{ textAlign: 'center', color: '#86868b', padding: '2rem 0' }}>No databases found for &quot;{searchTerm}&quot;</p>
      ) : (
        <>
          <div>
            <p className="db-section-label">Common comparisons</p>
            <div className="db-grid db-grid-4">{featured.map((db) => <DatabaseCard key={db.id} db={db} selected={selected.includes(db.id)} onToggle={onToggle} />)}</div>
          </div>
          <div className="db-browse-row">
            <button type="button" onClick={onToggleAll} className="pill-btn pill-btn-outline">{showAll ? 'Hide all databases' : 'Browse all databases'}</button>
          </div>
          {showAll && grouped.map(({ category, items }) => (
            <div key={category}>
              <p className="db-section-label">{category}</p>
              <div className="db-grid db-grid-3">{items.map((db) => <DatabaseCard key={db.id} db={db} selected={selected.includes(db.id)} onToggle={onToggle} />)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function ComparisonTool() {
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllDatabases, setShowAllDatabases] = useState(false);
  const [activePreset, setActivePreset] = useState('all');
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const tableRef = useRef(null);

  const toggleDb = useCallback((id) => {
    setSelected((prev) => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter((e) => e !== id) : (prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]);
      if (!isRemoving && next.length > 0) {
        setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
      return next;
    });
  }, []);

  const selectedDbs = useMemo(
    () => selected.map((id) => databases.find((db) => db.id === id)).filter(Boolean),
    [selected]
  );

  const currentPreset = rowPresets.find((p) => p.id === activePreset) || rowPresets[0];

  const visibleSections = useMemo(() => {
    return featureSections
      .map((group) => {
        if (currentPreset.sections && !currentPreset.sections.includes(group.section)) return null;
        let features = group.features;
        if (currentPreset.features) features = features.filter((f) => currentPreset.features.includes(f));
        if (differencesOnly && selectedDbs.length > 0) {
          features = features.filter((f) => {
            const tidbScore = getStrengthScore(tidb.features[f]);
            return selectedDbs.some((db) => getStrengthScore(db.features[f]) !== tidbScore);
          });
        }
        if (features.length === 0) return null;
        return { ...group, features };
      })
      .filter(Boolean);
  }, [currentPreset, differencesOnly, selectedDbs]);

  const totalVisible = visibleSections.reduce((sum, g) => sum + g.features.length, 0);

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Compare Databases</h1>
          <p className="page-subtitle">Pick up to three databases and see how TiDB compares across scalability, security, and features.</p>
        </div>

        <div className="page-card page-card-lg">
          <div className="compare-bar">
            <div className="compare-pills">
              <span className="pill-btn pill-btn-dark">TiDB</span>
              {selectedDbs.map((db) => (
                <button key={db.id} className="pill-btn pill-btn-light pill-btn-removable" onClick={() => toggleDb(db.id)}>
                  {db.name}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18" /></svg>
                </button>
              ))}
              {selectedDbs.length === 0 && <span className="pill-btn pill-btn-ghost">Select a database below</span>}
            </div>
            {selectedDbs.length > 0 && (
              <button className="compare-clear-btn" onClick={() => setSelected([])}>Clear all</button>
            )}
          </div>
          <DatabasePicker searchTerm={searchTerm} onSearchChange={setSearchTerm} selected={selected} onToggle={toggleDb} showAll={showAllDatabases} onToggleAll={() => setShowAllDatabases((v) => !v)} />
        </div>

        {/* Summary + Proof + Risks + Next Step */}
        {selectedDbs.length > 0 && (
          <>
            <SummaryCard selectedDbs={selectedDbs} />
            <QualificationRisks selectedDbs={selectedDbs} />
          </>
        )}

        {/* Comparison Table */}
        {selectedDbs.length > 0 ? (
          <div ref={tableRef} className="page-card compare-table-wrap">
            <div className="compare-toolbar">
              <div className="compare-toolbar-left">
                <label className="diff-toggle">
                  <input type="checkbox" checked={differencesOnly} onChange={(e) => setDifferencesOnly(e.target.checked)} />
                  <span>Differences only</span>
                </label>
              </div>
              <div className="compare-toolbar-right">
                <span className="compare-row-count">{totalVisible} features</span>
              </div>
            </div>

            <div className="preset-bar">
              {rowPresets.map((preset) => (
                <button key={preset.id} type="button" className={`preset-pill ${activePreset === preset.id ? 'preset-pill-active' : ''}`} onClick={() => setActivePreset(preset.id)}>{preset.label}</button>
              ))}
            </div>

            <SymbolLegend />

            <div className="compare-table-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-th-label">Capability</th>
                    <th className="compare-th-tidb">
                      <div className="compare-th-inner">
                        <img src="/tidb-mark.svg" alt="TiDB" className="compare-th-logo" />
                        <div><div className="compare-th-name compare-th-name-primary">TiDB</div><div className="compare-th-type">Distributed HTAP</div></div>
                      </div>
                    </th>
                    {selectedDbs.map((db) => (
                      <th key={db.id} className="compare-th-db">
                        <div className="compare-th-inner">
                          <div className="compare-th-logo-wrap">
                            <img src={db.logo} alt={db.name} className="compare-th-logo-img" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = db.name[0]; }} />
                          </div>
                          <div><div className="compare-th-name">{db.name}</div><div className="compare-th-type">{db.type}</div></div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleSections.map((group) => (
                    <React.Fragment key={group.section}>
                      <tr className="compare-section-row">
                        <td colSpan={2 + selectedDbs.length} className="compare-section-label">{group.section}</td>
                      </tr>
                      {group.description && (
                        <tr className="compare-section-intro-row">
                          <td colSpan={2 + selectedDbs.length} className="compare-section-intro">{group.description}</td>
                        </tr>
                      )}
                      {group.features.map((feature, i) => (
                        <tr key={feature} className={i % 2 === 0 ? '' : 'compare-row-alt'}>
                          <td className="compare-td-label">
                            <div className="compare-feature-name">{featureLabels[feature]?.label || feature}</div>
                            <p className="compare-feature-desc">{featureLabels[feature]?.description}</p>
                          </td>
                          <td className="compare-td compare-td-tidb"><FeatureValue value={tidb.features[feature]} /></td>
                          {selectedDbs.map((db) => (
                            <td key={db.id} className="compare-td"><FeatureValue value={db.features[feature]} /></td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="page-card compare-empty">
            <p>Select at least one database to start the comparison.</p>
          </div>
        )}
      </div>
    </section>
  );
}
