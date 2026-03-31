import { useState, useMemo, useEffect } from 'react';
import {
  starterPricing, essentialPricing,
  dedicatedAllRegions,
  calculateStarterCost, calculateEssentialCost, calculateDedicatedCost,
} from '../data/pricing';

/* ─── Shared UI ─── */

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`pill-btn ${active ? 'pill-btn-dark' : 'pill-btn-ghost'}`}>
      {children}
    </button>
  );
}

function SliderInput({ label, value, onChange, min, max, step = 1, unit, freeLimit, formatValue }) {
  const displayValue = formatValue ? formatValue(value) : `${value.toLocaleString()} ${unit}`;
  const withinFree = freeLimit !== undefined && value <= freeLimit;

  return (
    <div className="slider-group">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <div className="slider-value-wrap">
          <span className="slider-value">{displayValue}</span>
          {withinFree && <span className="slider-free-badge">Free</span>}
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
      <div className="slider-range">
        <span>{min.toLocaleString()} {unit}</span>
        <span>{max.toLocaleString()} {unit}</span>
      </div>
    </div>
  );
}

function RegionSelect({ regions, value, onChange }) {
  // Auto-detect if regions should be grouped by provider
  const entries = Object.entries(regions);
  function detectProvider(key, r) {
    if (r.provider) return r.provider;
    if (key.startsWith('ali-') || r.label?.includes('Alibaba')) return 'Alibaba Cloud';
    if (key.startsWith('gcp') || r.label?.includes('GCP') || r.label?.includes('Google')) return 'Google Cloud';
    if (key.startsWith('azure') || r.label?.includes('Azure')) return 'Azure';
    return 'AWS';
  }
  const providers = new Set(entries.map(([key, r]) => detectProvider(key, r)));
  const useGroups = providers.size > 1;

  if (useGroups) {
    const groups = {};
    entries.forEach(([key, r]) => {
      const p = detectProvider(key, r);
      if (!groups[p]) groups[p] = [];
      groups[p].push({ key, label: r.label });
    });
    return (
      <div className="slider-group">
        <label className="slider-label">Region</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="region-select">
          {Object.entries(groups).map(([provider, regs]) => (
            <optgroup key={provider} label={provider}>
              {regs.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="slider-group">
      <label className="slider-label">Region</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="region-select"
      >
        {entries.map(([key, r]) => (
          <option key={key} value={key}>{r.label}</option>
        ))}
      </select>
    </div>
  );
}

function CostDisplay({ title, total, subtitle, items, note }) {
  return (
    <div className="cost-display">
      <p className="cost-display-title">{title}</p>
      <div className="cost-display-total">
        ${total.toLocaleString()}<span className="cost-display-period">/mo</span>
      </div>
      {subtitle && <p className="cost-display-sub">{subtitle}</p>}
      {!subtitle && <div style={{ marginBottom: '32px' }} />}
      <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 14px', marginBottom: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', margin: 0 }}>This is a rough estimate only. Final pricing may vary.</p>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Contact PingCAP for an accurate quote based on your specific requirements.</p>
      </div>

      <div className="cost-display-items">
        {items.map((item, i) => (
          <div key={i} className={`cost-display-item ${i < items.length - 1 ? 'cost-display-item-border' : ''}`}>
            <div>
              <span className="cost-display-item-label">{item.label}</span>
              {item.detail && <p className="cost-display-item-detail">{item.detail}</p>}
            </div>
            <span className={`cost-display-item-value ${item.highlight ? 'cost-display-item-highlight' : ''}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {note && <div className="cost-display-note">{note}</div>}
      {total === 0 && <div className="cost-display-free">You're within the free tier!</div>}
    </div>
  );
}

/* ─── RU Estimation from Workload ─── */

// Reference: TiDB Cloud internal pricing tool (March 2026)
// Read 1 row of 1024 bytes ≈ 1.49 RUs; Write 1 row of 1024 bytes ≈ 13.39 RUs
const RU_READ_PER_ROW_1KB = 1.49;
const RU_WRITE_PER_ROW_1KB = 13.39;

function estimateRUs({ baseQPS, peakQPS, peakTimePct, readRowBytes, writeRowBytes, rowsPerRead, rowsPerWrite, readRatio }) {
  const readRUPerRow = RU_READ_PER_ROW_1KB * (readRowBytes / 1024);
  const writeRUPerRow = RU_WRITE_PER_ROW_1KB * (writeRowBytes / 1024);
  const avgQPS = baseQPS * (1 - peakTimePct / 100) + peakQPS * (peakTimePct / 100);
  const readQPS = avgQPS * readRatio;
  const writeQPS = avgQPS * (1 - readRatio);
  const readRUsPerSec = readQPS * readRUPerRow * rowsPerRead;
  const writeRUsPerSec = writeQPS * writeRUPerRow * rowsPerWrite;
  const totalPerMonth = (readRUsPerSec + writeRUsPerSec) * 86400 * 30;
  const totalRUsPerSec = Math.round(readRUsPerSec + writeRUsPerSec);
  return { avgQPS: Math.round(avgQPS * 100) / 100, readRUsPerSec: Math.round(readRUsPerSec), writeRUsPerSec: Math.round(writeRUsPerSec), totalRUsPerSec, totalRUsM: Math.round(totalPerMonth / 1_000_000) };
}

const ROW_SIZE_OPTIONS = [
  { value: 64, label: '64 Bytes' },
  { value: 256, label: '256 Bytes' },
  { value: 512, label: '512 Bytes' },
  { value: 1024, label: '1 KiB' },
  { value: 2048, label: '2 KiB' },
  { value: 4096, label: '4 KiB' },
  { value: 8192, label: '8 KiB' },
  { value: 16384, label: '16 KiB' },
];

const RW_RATIO_OPTIONS = [
  { value: 1.0, label: '10:0 (read-only)' },
  { value: 0.9, label: '9:1 (read-heavy)' },
  { value: 0.7, label: '7:3' },
  { value: 0.5, label: '5:5 (balanced)' },
  { value: 0.3, label: '3:7' },
  { value: 0.1, label: '1:9 (write-heavy)' },
];

/* ─── Starter ─── */

function StarterCalculator({ initialContext }) {
  const [region, setRegion] = useState('us-west-2');
  const [rowStorage, setRowStorage] = useState(initialContext?.storageGiB ? Math.min(500, initialContext.storageGiB) : 5);
  const [colStorage, setColStorage] = useState(5);
  const [requestUnitsM, setRequestUnitsM] = useState(50);
  const [showWorkload, setShowWorkload] = useState(!!initialContext?.qps);

  // Workload estimator state
  const [baseQPS, setBaseQPS] = useState(initialContext?.qps || 1000);
  const [peakQPS, setPeakQPS] = useState(0);
  const [peakTimePct, setPeakTimePct] = useState(0);
  const [readRowBytes, setReadRowBytes] = useState(1024);
  const [writeRowBytes, setWriteRowBytes] = useState(1024);
  const [rowsPerRead, setRowsPerRead] = useState(1);
  const [rowsPerWrite, setRowsPerWrite] = useState(1);
  const [readRatio, setReadRatio] = useState(initialContext?.readRatio || 0.9);

  const workloadEstimate = useMemo(() => showWorkload ? estimateRUs({
    baseQPS, peakQPS, peakTimePct, readRowBytes, writeRowBytes, rowsPerRead, rowsPerWrite, readRatio,
  }) : null, [showWorkload, baseQPS, peakQPS, peakTimePct, readRowBytes, writeRowBytes, rowsPerRead, rowsPerWrite, readRatio]);

  // Sync workload estimate into RU slider
  useEffect(() => {
    if (workloadEstimate) setRequestUnitsM(Math.min(5000, Math.max(0, workloadEstimate.totalRUsM)));
  }, [workloadEstimate]);

  const cost = useMemo(() => calculateStarterCost({ regionKey: region, rowStorageGiB: rowStorage, colStorageGiB: colStorage, requestUnitsM }), [region, rowStorage, colStorage, requestUnitsM]);
  const rd = starterPricing.regions[region];

  return (
    <div className="calc-layout">
      <div className="page-card">
        <div className="calc-tier-header">
          <h3 className="selfmanaged-title">TiDB Cloud Starter</h3>
          <p className="selfmanaged-subtitle">Serverless, pay-as-you-go</p>
          <p className="selfmanaged-desc">Free for developers and AI agents — scales automatically with generous free quota. Pay only for what you use beyond the free tier.</p>
          <div className="selfmanaged-features">
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>Automatic scaling with no provisioning</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>50M free Request Units per month</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>5 GiB free row and columnar storage</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>No upfront cost or commitment</span>
            </div>
          </div>
        </div>
        <RegionSelect regions={starterPricing.regions} value={region} onChange={setRegion} />
        <SliderInput label="Row Storage" value={rowStorage} onChange={setRowStorage} min={0} max={500} unit="GiB" freeLimit={5} />
        <SliderInput label="Columnar Storage" value={colStorage} onChange={setColStorage} min={0} max={500} unit="GiB" freeLimit={5} />
        <SliderInput label="Request Units" value={requestUnitsM} onChange={setRequestUnitsM} min={0} max={5000} step={10} unit="M/mo" freeLimit={50} formatValue={(v) => `${v}M RUs`} />

        <button type="button" className="workload-toggle" onClick={() => setShowWorkload(!showWorkload)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showWorkload ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
          {showWorkload ? 'Hide workload estimator' : 'Estimate RUs from workload'}
        </button>

        {showWorkload && (() => {
          const readRUPerRow = Math.round(RU_READ_PER_ROW_1KB * (readRowBytes / 1024) * 100) / 100;
          const writeRUPerRow = Math.round(RU_WRITE_PER_ROW_1KB * (writeRowBytes / 1024) * 100) / 100;
          const est = workloadEstimate;
          return (
            <div className="workload-estimator">
              <div className="workload-grid">
                <SliderInput label="Base QPS" value={baseQPS} onChange={setBaseQPS} min={0} max={50000} step={100} unit="QPS" />
                <SliderInput label="Peak QPS" value={peakQPS} onChange={setPeakQPS} min={0} max={100000} step={100} unit="QPS" />
              </div>
              {peakQPS > 0 && (
                <SliderInput label="Peak Time" value={peakTimePct} onChange={setPeakTimePct} min={0} max={100} unit="%" formatValue={(v) => `${v}% of the time`} />
              )}
              <div className="workload-grid">
                <div className="slider-group">
                  <label className="slider-label">Read Row Size</label>
                  <select className="region-select" value={readRowBytes} onChange={(e) => setReadRowBytes(Number(e.target.value))}>
                    {ROW_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="workload-hint">Read 1 row = {readRUPerRow} RUs</p>
                </div>
                <div className="slider-group">
                  <label className="slider-label">Write Row Size</label>
                  <select className="region-select" value={writeRowBytes} onChange={(e) => setWriteRowBytes(Number(e.target.value))}>
                    {ROW_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="workload-hint">Write 1 row = {writeRUPerRow} RUs</p>
                </div>
              </div>
              <div className="workload-grid">
                <SliderInput label="Rows per Read" value={rowsPerRead} onChange={setRowsPerRead} min={1} max={100} unit="rows" />
                <SliderInput label="Rows per Write" value={rowsPerWrite} onChange={setRowsPerWrite} min={1} max={10} unit="rows" />
              </div>
              <div className="slider-group">
                <label className="slider-label">Read-Write Ratio</label>
                <select className="region-select" value={readRatio} onChange={(e) => setReadRatio(Number(e.target.value))}>
                  {RW_RATIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="workload-summary">
                <div className="workload-summary-row"><span>Effective Avg QPS</span><span>{est.avgQPS.toLocaleString()}</span></div>
                <div className="workload-summary-row"><span>Read RUs/sec</span><span>{est.readRUsPerSec.toLocaleString()}</span></div>
                <div className="workload-summary-row"><span>Write RUs/sec</span><span>{est.writeRUsPerSec.toLocaleString()}</span></div>
                <div className="workload-summary-row workload-summary-total"><span>Estimated RUs/month</span><span>{est.totalRUsM.toLocaleString()}M</span></div>
              </div>
              {est.totalRUsM > 5000 && (
                <p className="workload-warning">This workload exceeds typical Starter limits. Consider Essential or Dedicated for production use.</p>
              )}
            </div>
          );
        })()}
      </div>
      <CostDisplay
        title="Estimated Monthly Cost" total={cost.total}
        items={[
          { label: 'Row Storage', detail: `${rowStorage} GiB × $${rd.rowPerGiB}/GiB`, value: `$${cost.rowCost}` },
          { label: 'Columnar Storage', detail: `${colStorage} GiB × $${rd.colPerGiB}/GiB`, value: `$${cost.colCost}` },
          { label: 'Request Units', detail: `${requestUnitsM}M RUs × $${rd.ruPer1M}/1M`, value: `$${cost.ruCost}` },
          { label: 'Free quota', value: 'Included', highlight: true, detail: '5 GiB row + 5 GiB col + 50M RUs per cluster' },
        ]}
        note={`Starter pricing for ${rd.label}. Free quota is per cluster for the first 5 Starter clusters in an organization (25 GiB row + 25 GiB column + 250M RUs total). Excludes data transfer costs.`}
      />
      <a href="https://www.pingcap.com/contact-us/" target="_blank" rel="noreferrer" className="calc-contact-cta">
        Get an accurate quote
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
      </a>
    </div>
  );
}

/* ─── Essential ─── */

function EssentialCalculator({ initialContext }) {
  const [region, setRegion] = useState('us-west-2');
  const [rcuCount, setRcuCount] = useState(2000);
  const [rowStorage, setRowStorage] = useState(initialContext?.storageGiB ? Math.min(2000, initialContext.storageGiB) : 50);
  const [colStorage, setColStorage] = useState(0);
  const [dualEncryption, setDualEncryption] = useState(false);
  const [showWorkload, setShowWorkload] = useState(!!initialContext?.qps);

  // Workload estimator state
  const [baseQPS, setBaseQPS] = useState(initialContext?.qps || 1000);
  const [peakQPS, setPeakQPS] = useState(0);
  const [peakTimePct, setPeakTimePct] = useState(0);
  const [readRowBytes, setReadRowBytes] = useState(1024);
  const [writeRowBytes, setWriteRowBytes] = useState(1024);
  const [rowsPerRead, setRowsPerRead] = useState(1);
  const [rowsPerWrite, setRowsPerWrite] = useState(1);
  const [readRatio, setReadRatio] = useState(initialContext?.readRatio || 0.9);

  const workloadEstimate = useMemo(() => showWorkload ? estimateRUs({
    baseQPS, peakQPS, peakTimePct, readRowBytes, writeRowBytes, rowsPerRead, rowsPerWrite, readRatio,
  }) : null, [showWorkload, baseQPS, peakQPS, peakTimePct, readRowBytes, writeRowBytes, rowsPerRead, rowsPerWrite, readRatio]);

  // Sync workload estimate → RCU slider (1 RCU = 1 RU/s sustained)
  useEffect(() => {
    if (workloadEstimate) setRcuCount(Math.min(100000, Math.max(2000, workloadEstimate.totalRUsPerSec)));
  }, [workloadEstimate]);

  const cost = useMemo(() => calculateEssentialCost({ regionKey: region, rcuCount, rowStorageGiB: rowStorage, colStorageGiB: colStorage, dualEncryption }), [region, rcuCount, rowStorage, colStorage, dualEncryption]);
  const rd = essentialPricing.regions[region];

  return (
    <div className="calc-layout">
      <div className="page-card">
        <div className="calc-tier-header">
          <h3 className="selfmanaged-title">TiDB Cloud Essential</h3>
          <p className="selfmanaged-subtitle">Provisioned capacity for production</p>
          <p className="selfmanaged-desc">Performance, security, and scale without complex infrastructure management. Ideal for production workloads with predictable capacity needs.</p>
          <div className="selfmanaged-features">
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>99.99% SLA with Multi-AZ / Regional HA</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>Point-in-Time Recovery (PITR) backup</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>From 2,000 Request Capacity Units</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>Dual encryption at rest available</span>
            </div>
          </div>
        </div>
        <RegionSelect regions={essentialPricing.regions} value={region} onChange={setRegion} />
        <SliderInput label="Request Capacity Units (RCU)" value={rcuCount} onChange={setRcuCount} min={2000} max={100000} step={500} unit="RCU" formatValue={(v) => `${v.toLocaleString()} RCU`} />
        <SliderInput label="Row Storage" value={rowStorage} onChange={setRowStorage} min={0} max={2000} step={10} unit="GiB" />
        <SliderInput label="Columnar Storage" value={colStorage} onChange={setColStorage} min={0} max={2000} step={10} unit="GiB" />
        <label className="calc-checkbox">
          <input type="checkbox" checked={dualEncryption} onChange={(e) => setDualEncryption(e.target.checked)} />
          <div>
            <span className="calc-checkbox-label">Dual-layer encryption</span>
            <p className="calc-checkbox-desc">Additional encryption layer (higher storage cost)</p>
          </div>
        </label>

        <button type="button" className="workload-toggle" onClick={() => setShowWorkload(!showWorkload)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showWorkload ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
          {showWorkload ? 'Hide workload estimator' : 'Estimate RCUs from workload'}
        </button>

        {showWorkload && (() => {
          const readRUPerRow = Math.round(RU_READ_PER_ROW_1KB * (readRowBytes / 1024) * 100) / 100;
          const writeRUPerRow = Math.round(RU_WRITE_PER_ROW_1KB * (writeRowBytes / 1024) * 100) / 100;
          const est = workloadEstimate;
          return (
            <div className="workload-estimator">
              <div className="workload-grid">
                <SliderInput label="Base QPS" value={baseQPS} onChange={setBaseQPS} min={0} max={50000} step={100} unit="QPS" />
                <SliderInput label="Peak QPS" value={peakQPS} onChange={setPeakQPS} min={0} max={100000} step={100} unit="QPS" />
              </div>
              {peakQPS > 0 && (
                <SliderInput label="Peak Time" value={peakTimePct} onChange={setPeakTimePct} min={0} max={100} unit="%" formatValue={(v) => `${v}% of the time`} />
              )}
              <div className="workload-grid">
                <div className="slider-group">
                  <label className="slider-label">Read Row Size</label>
                  <select className="region-select" value={readRowBytes} onChange={(e) => setReadRowBytes(Number(e.target.value))}>
                    {ROW_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="workload-hint">Read 1 row = {readRUPerRow} RUs</p>
                </div>
                <div className="slider-group">
                  <label className="slider-label">Write Row Size</label>
                  <select className="region-select" value={writeRowBytes} onChange={(e) => setWriteRowBytes(Number(e.target.value))}>
                    {ROW_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="workload-hint">Write 1 row = {writeRUPerRow} RUs</p>
                </div>
              </div>
              <div className="workload-grid">
                <SliderInput label="Rows per Read" value={rowsPerRead} onChange={setRowsPerRead} min={1} max={100} unit="rows" />
                <SliderInput label="Rows per Write" value={rowsPerWrite} onChange={setRowsPerWrite} min={1} max={10} unit="rows" />
              </div>
              <div className="slider-group">
                <label className="slider-label">Read-Write Ratio</label>
                <select className="region-select" value={readRatio} onChange={(e) => setReadRatio(Number(e.target.value))}>
                  {RW_RATIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="workload-summary">
                <div className="workload-summary-row"><span>Effective Avg QPS</span><span>{est.avgQPS.toLocaleString()}</span></div>
                <div className="workload-summary-row"><span>Read RUs/sec</span><span>{est.readRUsPerSec.toLocaleString()}</span></div>
                <div className="workload-summary-row"><span>Write RUs/sec</span><span>{est.writeRUsPerSec.toLocaleString()}</span></div>
                <div className="workload-summary-row workload-summary-total"><span>Estimated RCUs needed</span><span>{est.totalRUsPerSec.toLocaleString()} RCU</span></div>
              </div>
              <p className="workload-hint" style={{ marginTop: '8px' }}>1 RCU = 1 RU/sec of sustained throughput. Min 2,000 RCU per cluster.</p>
              {est.totalRUsPerSec > 100000 && (
                <p className="workload-warning">This workload exceeds Essential's max RCU range. Consider Dedicated for this scale.</p>
              )}
              {est.totalRUsPerSec < 2000 && (
                <p className="workload-hint" style={{ marginTop: '4px', color: '#22c55e' }}>Your workload fits within the minimum 2,000 RCU tier.</p>
              )}
            </div>
          );
        })()}
      </div>
      <CostDisplay
        title="Estimated Monthly Cost" total={cost.total} subtitle={`~$${cost.dailyCost}/day`}
        items={[
          { label: 'Compute (RCU)', detail: `${cost.effectiveRCU.toLocaleString()} RCU × $${rd.rcuPerMonth}/RCU/mo`, value: `$${cost.rcuCost.toLocaleString()}` },
          { label: 'Row Storage', detail: `${rowStorage} GiB × $${dualEncryption ? rd.rowEncPerGiB : rd.rowPerGiB}/GiB`, value: `$${cost.rowCost.toLocaleString()}` },
          { label: 'Columnar Storage', detail: colStorage > 0 ? `${colStorage} GiB × $${dualEncryption ? rd.colEncPerGiB : rd.colPerGiB}/GiB` : 'Not configured', value: colStorage > 0 ? `$${cost.colCost.toLocaleString()}` : '$0' },
        ]}
        note={`Essential pricing for ${rd.label}. Min 2,000 RCU/cluster. Includes 99.99% SLA, multi-AZ, PITR. Excludes backup storage, data transfer, and changefeed costs.`}
      />
      <a href="https://www.pingcap.com/contact-us/" target="_blank" rel="noreferrer" className="calc-contact-cta">
        Get an accurate quote
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
      </a>
    </div>
  );
}

/* ─── Dedicated — Sizing Calculator ─── */

// Official TiDB Cloud performance benchmarks (per single node)
const TIDB_PERF = {
  // 8 vCPU, 16 GiB
  '8v16g': {
    read:  { p95_100: 18900, p99_300: 9450, p99_100: 6300 },
    mixed: { p95_100: 15500, p99_300: 7750, p99_100: 5200 },
    write: { p95_100: 18000, p99_300: 9000, p99_100: 6000 },
  },
};
// 16v32g ≈ 2× of 8v16g
TIDB_PERF['16v32g'] = Object.fromEntries(
  Object.entries(TIDB_PERF['8v16g']).map(([w, lats]) => [w, Object.fromEntries(Object.entries(lats).map(([l, v]) => [l, v * 2]))])
);

const TIKV_PERF = {
  '8v32g': {
    read:  { p95_100: 28000, p99_300: 14000, p99_100: 7000 },
    mixed: { p95_100: 17800, p99_300: 8900, p99_100: 4450 },
    write: { p95_100: 14500, p99_300: 7250, p99_100: 3625 },
  },
};
TIKV_PERF['16v64g'] = Object.fromEntries(
  Object.entries(TIKV_PERF['8v32g']).map(([w, lats]) => [w, Object.fromEntries(Object.entries(lats).map(([l, v]) => [l, v * 2]))])
);

// Deviation: for every 8 extra nodes, add 5%
function deviationCoeff(nodeCount) {
  return Math.floor(nodeCount / 8) * 0.05;
}

function calcNodeCount(targetQPS, perfPerNode, label) {
  if (!targetQPS || targetQPS <= 0) return { count: 2, spec: label };
  const raw = Math.ceil(targetQPS / perfPerNode);
  const dev = deviationCoeff(raw);
  const adjusted = Math.ceil(targetQPS / (perfPerNode * (1 - dev)));
  return { count: Math.max(2, adjusted), spec: label };
}

// Official formula: node_count = ceil(data_TB * 1024 * (1/compressionRatio) * replicas / (waterLevel/100) / maxStorageGiB / 3) * 3
function calcTikvByData(dataTB, compressionRatio, waterLevel, replicas, maxStorageGiB) {
  if (!dataTB || dataTB <= 0) return { count: 3, storagePerNode: 500 };
  const compressedGiB = dataTB * 1024 / compressionRatio; // e.g., 5TB / 1.25 = 4TB = 4096 GiB
  const totalGiB = compressedGiB * replicas; // × 3 replicas
  const rawCount = Math.ceil(totalGiB / (maxStorageGiB * (waterLevel / 100)) / 3) * 3;
  const count = Math.max(3, rawCount);
  const storagePerNode = Math.min(maxStorageGiB, Math.max(200, Math.ceil(totalGiB / count / (waterLevel / 100) / 100) * 100));
  return { count, storagePerNode };
}

function DedicatedCalculator({ initialContext }) {
  const [regionKey, setRegionKey] = useState('aws-us-west-2');
  const region = dedicatedAllRegions[regionKey] || dedicatedAllRegions['aws-us-west-2'];

  // Map read ratio to workload type
  const initWorkload = initialContext?.readRatio >= 0.8 ? 'read' : initialContext?.readRatio <= 0.4 ? 'write' : 'mixed';

  // Workload inputs
  const [qps, setQps] = useState(initialContext?.qps || 50000);
  const [workload, setWorkload] = useState(initialContext ? initWorkload : 'mixed');
  const [latency, setLatency] = useState('p95_100');
  const [dataTB, setDataTB] = useState(initialContext?.storageGiB ? Math.round(initialContext.storageGiB / 1024) || 1 : 5);
  const [compressionRatio, setCompressionRatio] = useState(1.25); // 1.25 = 1 GiB compresses to 0.8 GiB
  const [waterLevel, setWaterLevel] = useState(80); // storage usage %
  const [useTiflash, setUseTiflash] = useState(initialContext?.needsTiFlash || false);
  const [tiflashDataTB, setTiflashDataTB] = useState(1); // how much data to replicate into TiFlash

  // Sizing recommendation
  const sizing = useMemo(() => {
    const useHighSpec = qps > 80000;

    // TiDB sizing
    const tidbSpec = useHighSpec ? '16v32g' : '8v16g';
    const tidbPerf = TIDB_PERF[tidbSpec][workload][latency];
    const tidb = calcNodeCount(qps, tidbPerf, tidbSpec);

    // TiKV sizing by QPS
    const tikvSpec = useHighSpec ? '16v64g' : '8v32g';
    const tikvPerf = TIKV_PERF[tikvSpec][workload][latency];
    const tikvByQPS = calcNodeCount(qps, tikvPerf, tikvSpec);
    // Ensure TiKV count is multiple of 3
    tikvByQPS.count = Math.ceil(tikvByQPS.count / 3) * 3;

    // TiKV sizing by data volume (official formula)
    const maxStorage = 4096;
    const tikvByData = calcTikvByData(dataTB, compressionRatio, waterLevel, 3, maxStorage);

    // Take the larger
    const tikvCount = Math.max(tikvByQPS.count, tikvByData.count);
    const tikvStorage = tikvByData.storagePerNode;

    // TiFlash (if enabled) — min 2 nodes, storage based on user-specified TiFlash data
    let tiflashCount = 0;
    let tiflashStorage = 1024;
    if (useTiflash && tiflashDataTB > 0) {
      const tiflashDataGiB = tiflashDataTB * 1024 / compressionRatio; // 1 replica, compressed
      tiflashCount = Math.max(2, Math.ceil(tiflashDataGiB / 4096));
      tiflashStorage = Math.min(4096, Math.max(200, Math.ceil(tiflashDataGiB / tiflashCount / 100) * 100));
    }

    return {
      tidbSpec, tidbCount: tidb.count,
      tikvSpec, tikvCount, tikvStorage,
      tiflashCount, tiflashStorage,
      tidbLabel: useHighSpec ? '16 vCPU, 32 GiB' : '8 vCPU, 16 GiB',
      tikvLabel: useHighSpec ? '16 vCPU, 64 GiB' : '8 vCPU, 32 GiB',
      tiflashLabel: '8 vCPU, 64 GiB',
      dataNote: tikvCount === tikvByData.count && tikvCount > tikvByQPS.count
        ? 'TiKV count driven by data volume'
        : tikvCount === tikvByQPS.count && tikvCount > tikvByData.count
          ? 'TiKV count driven by QPS requirement'
          : null,
    };
  }, [qps, workload, latency, dataTB, compressionRatio, waterLevel, useTiflash, tiflashDataTB]);

  // Cost calculation using region pricing
  const cost = useMemo(() => {
    if (!region.tidb || !region.tikv) return null;
    const H = 730;

    // Find matching spec in region pricing (or closest)
    const useHigh = sizing.tidbSpec === '16v32g';
    const tidbPrice = useHigh
      ? (region.tidb.find(s => s.vcpu === 16 && s.memory === 32) || region.tidb.find(s => s.vcpu === 16) || region.tidb[region.tidb.length - 1])
      : (region.tidb.find(s => s.vcpu === 8 && s.memory === 16) || region.tidb.find(s => s.vcpu === 8) || region.tidb[0]);
    const tikvPrice = useHigh
      ? (region.tikv.find(s => s.vcpu === 16 && s.memory === 64) || region.tikv.find(s => s.vcpu === 16) || region.tikv[region.tikv.length - 1])
      : (region.tikv.find(s => s.vcpu === 8 && s.memory === 32) || region.tikv.find(s => s.vcpu === 8) || region.tikv[0]);
    const tiflashPrice = region.tiflash?.[0] || { pricePerHr: 0, storage: { perGiBHr: 0 } };

    const tidbCost = Math.round(tidbPrice.pricePerHr * sizing.tidbCount * H);
    const tikvCompute = Math.round(tikvPrice.pricePerHr * sizing.tikvCount * H);
    const storageRate = tikvPrice.storage?.standard?.perGiBHr || region.storage?.standardPerGiBHr || 0.000197;
    const tikvStorageCost = Math.round(storageRate * sizing.tikvStorage * sizing.tikvCount * H);
    const tiflashCompute = useTiflash ? Math.round(tiflashPrice.pricePerHr * sizing.tiflashCount * H) : 0;
    const tiflashStorageCost = useTiflash ? Math.round((tiflashPrice.storage?.perGiBHr || storageRate) * sizing.tiflashStorage * sizing.tiflashCount * H) : 0;

    const total = tidbCost + tikvCompute + tikvStorageCost + tiflashCompute + tiflashStorageCost;
    return {
      total,
      hourly: (total / H).toFixed(2),
      tidbCost, tikvCompute, tikvStorageCost, tiflashCompute, tiflashStorageCost,
      tidbPrice, tikvPrice, tiflashPrice,
    };
  }, [region, sizing, useTiflash]);

  const workloadOpts = [
    { value: 'read', label: 'Read-heavy' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'write', label: 'Write-heavy' },
  ];

  const latencyOpts = [
    { value: 'p95_100', label: 'P95 ≈ 100ms' },
    { value: 'p99_300', label: 'P99 ≈ 300ms' },
    { value: 'p99_100', label: 'P99 ≈ 100ms (strict)' },
  ];

  const costItems = cost ? [
    { label: 'TiDB Compute', detail: `${sizing.tidbCount} × ${sizing.tidbLabel} @ $${cost.tidbPrice.pricePerHr}/hr`, value: `$${cost.tidbCost.toLocaleString()}` },
    { label: 'TiKV Compute', detail: `${sizing.tikvCount} × ${sizing.tikvLabel} @ $${cost.tikvPrice.pricePerHr}/hr`, value: `$${cost.tikvCompute.toLocaleString()}` },
    { label: 'TiKV Storage', detail: `${sizing.tikvCount} × ${sizing.tikvStorage.toLocaleString()} GiB (standard)`, value: `$${cost.tikvStorageCost.toLocaleString()}` },
    ...(useTiflash ? [
      { label: 'TiFlash Compute', detail: `${sizing.tiflashCount} × ${sizing.tiflashLabel} @ $${cost.tiflashPrice.pricePerHr}/hr`, value: `$${cost.tiflashCompute.toLocaleString()}` },
      { label: 'TiFlash Storage', detail: `${sizing.tiflashCount} × ${sizing.tiflashStorage.toLocaleString()} GiB`, value: `$${cost.tiflashStorageCost.toLocaleString()}` },
    ] : []),
  ] : [];

  return (
    <div className="calc-layout">
      <div className="page-card">
        <div className="calc-tier-header">
          <h3 className="selfmanaged-title">TiDB Cloud Dedicated</h3>
          <p className="selfmanaged-subtitle">Enterprise-ready, dedicated resources</p>
          <p className="selfmanaged-desc">Business-critical deployments with dedicated compute and storage on AWS, Google Cloud, or Azure. Full control over cluster sizing and configuration.</p>
          <div className="selfmanaged-features">
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>Dedicated TiDB and TiKV nodes</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>VPC peering and private endpoints</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>CMEK encryption and Multi-AZ HA</span>
            </div>
            <div className="selfmanaged-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
              <span>TiFlash columnar analytics (HTAP)</span>
            </div>
          </div>
        </div>
        <RegionSelect regions={dedicatedAllRegions} value={regionKey} onChange={setRegionKey} />

        <div className="slider-group">
          <div className="slider-header">
            <label className="slider-label">Expected QPS</label>
            <span className="slider-value">{qps.toLocaleString()} QPS</span>
          </div>
          <input type="range" min={1000} max={500000} step={1000} value={qps} onChange={(e) => setQps(Number(e.target.value))} className="w-full" />
          <div className="slider-range"><span>1,000</span><span>500,000</span></div>
        </div>

        <div className="slider-group">
          <label className="slider-label">Workload Type</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {workloadOpts.map((o) => (
              <button key={o.value} type="button" onClick={() => setWorkload(o.value)}
                className={`pill-btn ${workload === o.value ? 'pill-btn-dark' : 'pill-btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="slider-group">
          <label className="slider-label">Latency Target</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {latencyOpts.map((o) => (
              <button key={o.value} type="button" onClick={() => setLatency(o.value)}
                className={`pill-btn ${latency === o.value ? 'pill-btn-dark' : 'pill-btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label className="slider-label">Data Volume</label>
            <span className="slider-value">{dataTB} TB</span>
          </div>
          <input type="range" min={1} max={100} step={1} value={dataTB} onChange={(e) => setDataTB(Number(e.target.value))} className="w-full" />
          <div className="slider-range"><span>1 TB</span><span>100 TB</span></div>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label className="slider-label">Compression Ratio</label>
            <span className="slider-value">{compressionRatio}× ({Math.round(100 / compressionRatio)}% of original)</span>
          </div>
          <input type="range" min={1} max={3} step={0.05} value={compressionRatio} onChange={(e) => setCompressionRatio(Number(e.target.value))} className="w-full" />
          <div className="slider-range"><span>1× (no compression)</span><span>3× (high compression)</span></div>
          <p style={{ fontSize: '0.72rem', color: '#86868b', marginTop: '4px' }}>TiKV default is ~1.25× (data compresses to 80% of original size).</p>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label className="slider-label">Storage Water Level</label>
            <span className="slider-value">{waterLevel}%</span>
          </div>
          <input type="range" min={50} max={95} step={5} value={waterLevel} onChange={(e) => setWaterLevel(Number(e.target.value))} className="w-full" />
          <div className="slider-range"><span>50%</span><span>95%</span></div>
          <p style={{ fontSize: '0.72rem', color: '#86868b', marginTop: '4px' }}>Max storage utilization per node. Default 80% leaves room for compaction and growth.</p>
        </div>

        <label className="calc-checkbox">
          <input type="checkbox" checked={useTiflash} onChange={(e) => setUseTiflash(e.target.checked)} />
          <span className="calc-checkbox-label">Need TiFlash (Columnar Analytics / HTAP)</span>
        </label>

        {useTiflash && (
          <div className="slider-group">
            <div className="slider-header">
              <label className="slider-label">TiFlash Data Volume</label>
              <span className="slider-value">{tiflashDataTB} TB</span>
            </div>
            <input type="range" min={1} max={Math.max(dataTB, 1)} step={1} value={Math.min(tiflashDataTB, dataTB)} onChange={(e) => setTiflashDataTB(Number(e.target.value))} className="w-full" />
            <div className="slider-range"><span>1 TB</span><span>{Math.max(dataTB, 1)} TB</span></div>
            <p style={{ fontSize: '0.72rem', color: '#86868b', marginTop: '4px' }}>How much data to replicate into TiFlash for columnar analytics. Typically a subset of your total data.</p>
          </div>
        )}

        {/* Recommendation summary */}
        <div style={{ marginTop: '24px', padding: '20px', background: '#f5f5f7', borderRadius: '16px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '12px' }}>Recommended Cluster Configuration</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
            <span style={{ color: '#86868b' }}>TiDB (SQL Layer)</span>
            <span style={{ fontWeight: 600 }}>{sizing.tidbCount} × {sizing.tidbLabel}</span>
            <span style={{ color: '#86868b' }}>TiKV (Storage Layer)</span>
            <span style={{ fontWeight: 600 }}>{sizing.tikvCount} × {sizing.tikvLabel}</span>
            <span style={{ color: '#86868b' }}>TiKV Storage / Node</span>
            <span style={{ fontWeight: 600 }}>{sizing.tikvStorage.toLocaleString()} GiB</span>
            {useTiflash && <>
              <span style={{ color: '#86868b' }}>TiFlash (Analytics)</span>
              <span style={{ fontWeight: 600 }}>{sizing.tiflashCount} × {sizing.tiflashLabel}</span>
              <span style={{ color: '#86868b' }}>TiFlash Storage / Node</span>
              <span style={{ fontWeight: 600 }}>{sizing.tiflashStorage.toLocaleString()} GiB</span>
            </>}
          </div>
          {sizing.dataNote && <p style={{ fontSize: '0.72rem', color: '#86868b', marginTop: '8px' }}>{sizing.dataNote}</p>}
          <p style={{ fontSize: '0.68rem', color: '#86868b', marginTop: '8px', fontStyle: 'italic' }}>Based on official TiDB Cloud cluster sizing guide. Validate with a PoC before production.</p>
        </div>
      </div>
      {cost && (
        <CostDisplay
          title="Estimated Monthly Cost" total={cost.total} subtitle={`$${cost.hourly}/hr · 730 hrs/mo`}
          items={costItems}
          note={`${region.label} on-demand ${region.provider} rates. Sizing based on ${qps.toLocaleString()} QPS (${workload}) with ${dataTB} TB data at ${compressionRatio}× compression. Excludes backup storage, data transfer, and changefeed replication costs.`}
        />
      )}
      <a href="https://www.pingcap.com/contact-us/" target="_blank" rel="noreferrer" className="calc-contact-cta">
        Get an accurate quote
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
      </a>
    </div>
  );
}

/* ─── Coming Soon cards ─── */

function ComingSoonCard({ title, subtitle, description, features }) {
  return (
    <div className="selfmanaged-card">
      <div className="selfmanaged-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '100px', background: '#f5f5f7', color: '#86868b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '12px' }}>Coming Soon</span>
      <h3 className="selfmanaged-title">{title}</h3>
      <p className="selfmanaged-subtitle">{subtitle}</p>
      <p className="selfmanaged-desc">{description}</p>
      <div className="selfmanaged-features">
        {features.map((f, i) => (
          <div key={i} className="selfmanaged-feature">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <a href="https://www.pingcap.com/contact-us/" target="_blank" rel="noreferrer" className="selfmanaged-cta">
        Contact Us
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
      </a>
    </div>
  );
}

function PremiumCard() {
  return (
    <ComingSoonCard
      title="TiDB Cloud Premium"
      subtitle="Enhanced performance and compliance"
      description="Fully-managed cloud DBaaS for applications with predictable traffic and advanced requirements, available on AWS, Google Cloud, and Azure."
      features={[
        '4 vCPU to 32 vCPU per node available',
        'PCI-DSS and SOC 2 Type II compliant',
        'Regional failover (Cross-AZ)',
        'VPC peering and CMEK support',
        'Recovery Group (Cross-Region)',
      ]}
    />
  );
}

function BYOCCard() {
  return (
    <ComingSoonCard
      title="TiDB Cloud BYOC"
      subtitle="Bring Your Own Cloud"
      description="Run TiDB Cloud in your own cloud account for maximum control over data residency, security, and cost management while PingCAP manages the database."
      features={[
        'Runs in your own AWS account',
        'Full data sovereignty and residency control',
        'Regional failover with Single-AZ planned',
        'Alerting and resource control included',
        'Managed by PingCAP, owned by you',
      ]}
    />
  );
}

/* ─── Self-Managed ─── */

function SelfManagedCard() {
  return (
    <div className="selfmanaged-card">
      <div className="selfmanaged-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <h3 className="selfmanaged-title">TiDB Self-Managed</h3>
      <p className="selfmanaged-subtitle">Pricing upon request</p>
      <p className="selfmanaged-desc">
        Deploy TiDB on your own infrastructure — public or private cloud, on-prem data centers,
        or hybrid environments. Highly compatible with Kubernetes, with integrations for
        Apache Spark, Apache Kafka, Apache Flink, and others.
      </p>
      <div className="selfmanaged-features">
        <div className="selfmanaged-feature">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
          <span>Deploy on any infrastructure of your choice</span>
        </div>
        <div className="selfmanaged-feature">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
          <span>Full control over configuration and tuning</span>
        </div>
        <div className="selfmanaged-feature">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
          <span>Kubernetes-native with TiDB Operator</span>
        </div>
        <div className="selfmanaged-feature">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7" /></svg>
          <span>Enterprise support and SLA available</span>
        </div>
      </div>
      <a href="https://www.pingcap.com/contact-us/" target="_blank" rel="noreferrer" className="selfmanaged-cta">
        Contact Us
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
      </a>
    </div>
  );
}

/* ─── Main ─── */

export default function CostCalculator({ initialContext, onContextConsumed }) {
  const [tab, setTab] = useState('starter');

  // Apply initial context from assessment
  useEffect(() => {
    if (initialContext?.tab) {
      setTab(initialContext.tab);
      if (onContextConsumed) onContextConsumed();
    }
  }, [initialContext]);

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Cost Calculator</h1>
          <p className="page-subtitle">Choose a TiDB deployment and configure your workload to estimate monthly costs.</p>
        </div>

        <div className="calc-tabs">
          <TabButton active={tab === 'starter'} onClick={() => setTab('starter')}>Starter</TabButton>
          <TabButton active={tab === 'essential'} onClick={() => setTab('essential')}>Essential</TabButton>
          <TabButton active={tab === 'dedicated'} onClick={() => setTab('dedicated')}>Dedicated</TabButton>
          <TabButton active={tab === 'premium'} onClick={() => setTab('premium')}>Premium</TabButton>
          <TabButton active={tab === 'byoc'} onClick={() => setTab('byoc')}>BYOC</TabButton>
          <TabButton active={tab === 'selfmanaged'} onClick={() => setTab('selfmanaged')}>Self-Managed</TabButton>
        </div>

        {tab === 'starter' && <StarterCalculator initialContext={initialContext?.tab === 'starter' ? initialContext : null} />}
        {tab === 'essential' && <EssentialCalculator initialContext={initialContext?.tab === 'essential' ? initialContext : null} />}
        {tab === 'dedicated' && <DedicatedCalculator initialContext={initialContext?.tab === 'dedicated' ? initialContext : null} />}
        {tab === 'premium' && <PremiumCard />}
        {tab === 'byoc' && <BYOCCard />}
        {tab === 'selfmanaged' && <SelfManagedCard />}
      </div>
    </section>
  );
}
