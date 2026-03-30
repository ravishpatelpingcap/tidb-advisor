import { useCallback, useMemo, useRef, useState } from 'react';
import { databases, tidb, featureLabels, featureOrder, categoryOrder } from '../data/databases';

const featuredDatabaseIds = [
  'mysql', 'postgresql', 'aurora', 'oracle',
  'sqlserver', 'cockroachdb', 'spanner', 'mongodb',
];

// primaryFeatureOrder removed — featureOrder is used for all views

const limitedWords = ['limited', 'partial', 'experimental', 'preview', 'manual', 'basic', 'select region'];

function FeatureValue({ value }) {
  if (value === true) {
    return (
      <div className="fv-wrap">
        <span className="feature-badge feature-badge-yes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13L9 17L19 7" />
          </svg>
        </span>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="fv-wrap">
        <span className="feature-badge feature-badge-no">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
        </span>
      </div>
    );
  }
  if (value === undefined || value === null) {
    return (
      <div className="fv-wrap">
        <span className="feature-badge feature-badge-no">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
        </span>
      </div>
    );
  }
  const str = String(value);
  const isLimited = limitedWords.some((w) => str.toLowerCase().includes(w));
  return (
    <div className="fv-wrap">
      <span className={`feature-badge ${isLimited ? 'feature-badge-partial' : 'feature-badge-yes'}`}>
        {isLimited ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13L9 17L19 7" />
          </svg>
        )}
      </span>
      <span className="fv-detail">{str}</span>
    </div>
  );
}

function DatabaseCard({ db, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(db.id)}
      className={`db-card ${selected ? 'db-card-selected' : ''}`}
    >
      <div className="db-card-top">
        <div className="db-card-logo">
          <img
            src={db.logo}
            alt={db.name}
            className="db-card-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.textContent = db.name[0];
              e.currentTarget.parentElement.style.fontSize = '1.1rem';
              e.currentTarget.parentElement.style.fontWeight = '700';
              e.currentTarget.parentElement.style.color = '#86868b';
            }}
          />
        </div>
        <span className={`db-card-badge ${selected ? 'db-card-badge-active' : ''}`}>
          {db.category}
        </span>
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
    return (
      db.name.toLowerCase().includes(term) ||
      db.type.toLowerCase().includes(term) ||
      db.category.toLowerCase().includes(term)
    );
  });
  const grouped = categoryOrder
    .map((cat) => ({ category: cat, items: filtered.filter((db) => db.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="db-picker">
      <div className="db-search-wrap">
        <svg className="db-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21L16.65 16.65" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search databases..."
          className="db-search-input"
        />
      </div>

      {searchTerm ? (
        /* Search results — grouped by category */
        grouped.length > 0 ? grouped.map(({ category, items }) => (
          <div key={category}>
            <p className="db-section-label">{category}</p>
            <div className="db-grid db-grid-3">
              {items.map((db) => (
                <DatabaseCard key={db.id} db={db} selected={selected.includes(db.id)} onToggle={onToggle} />
              ))}
            </div>
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: '#86868b', padding: '2rem 0' }}>No databases found for "{searchTerm}"</p>
        )
      ) : (
        /* Default view — featured + browse all */
        <>
          <div>
            <p className="db-section-label">Common comparisons</p>
            <div className="db-grid db-grid-4">
              {featured.map((db) => (
                <DatabaseCard key={db.id} db={db} selected={selected.includes(db.id)} onToggle={onToggle} />
              ))}
            </div>
          </div>

          <div className="db-browse-row">
            <button type="button" onClick={onToggleAll} className="pill-btn pill-btn-outline">
              {showAll ? 'Hide all databases' : 'Browse all databases'}
            </button>
          </div>

          {showAll && grouped.map(({ category, items }) => (
            <div key={category}>
              <p className="db-section-label">{category}</p>
              <div className="db-grid db-grid-3">
                {items.map((db) => (
                  <DatabaseCard key={db.id} db={db} selected={selected.includes(db.id)} onToggle={onToggle} />
                ))}
              </div>
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


  return (
    <section className="page-section">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Compare Databases</h1>
          <p className="page-subtitle">Pick up to three databases and see how TiDB compares across scalability, security, and features.</p>
        </div>

        <div className="page-card page-card-lg">
          {/* Selection bar */}
          <div className="compare-bar">
            <div className="compare-pills">
              <span className="pill-btn pill-btn-dark">TiDB</span>
              {selectedDbs.map((db) => (
                <span key={db.id} className="pill-btn pill-btn-light">{db.name}</span>
              ))}
              {selectedDbs.length === 0 && (
                <span className="pill-btn pill-btn-ghost">Select a database below</span>
              )}
            </div>
          </div>

          <DatabasePicker
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selected={selected}
            onToggle={toggleDb}
            showAll={showAllDatabases}
            onToggleAll={() => setShowAllDatabases((v) => !v)}
          />
        </div>

        {/* Comparison Table */}
        {selectedDbs.length > 0 ? (
          <div ref={tableRef} className="page-card compare-table-wrap">
            <div className="compare-table-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-th-label">Capability</th>
                    <th className="compare-th-tidb">
                      <div className="compare-th-inner">
                        <img src="/tidb-mark.svg" alt="TiDB" className="compare-th-logo" />
                        <div><div className="compare-th-name compare-th-name-primary">TiDB</div>
                        <div className="compare-th-type">Distributed HTAP</div></div>
                      </div>
                    </th>
                    {selectedDbs.map((db) => (
                      <th key={db.id} className="compare-th-db">
                        <div className="compare-th-inner">
                          <div className="compare-th-logo-wrap">
                            <img
                              src={db.logo} alt={db.name} className="compare-th-logo-img"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.textContent = db.name[0];
                              }}
                            />
                          </div>
                          <div><div className="compare-th-name">{db.name}</div>
                          <div className="compare-th-type">{db.type}</div></div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureOrder.map((feature, i) => (
                    <tr key={feature} className={i % 2 === 0 ? '' : 'compare-row-alt'}>
                      <td className="compare-td-label">
                        <div className="compare-feature-name">{featureLabels[feature]?.label || feature}</div>
                        <p className="compare-feature-desc">{featureLabels[feature]?.description}</p>
                      </td>
                      <td className="compare-td compare-td-tidb">
                        <FeatureValue value={tidb.features[feature]} />
                      </td>
                      {selectedDbs.map((db) => (
                        <td key={db.id} className="compare-td">
                          <FeatureValue value={db.features[feature]} />
                        </td>
                      ))}
                    </tr>
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
