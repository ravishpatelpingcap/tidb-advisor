import { useState, useMemo } from 'react';
import {
  starterPricing, essentialPricing, dedicatedPricing,
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
  return (
    <div className="slider-group">
      <label className="slider-label">Region</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="region-select"
      >
        {Object.entries(regions).map(([key, r]) => (
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

/* ─── Starter ─── */

function StarterCalculator() {
  const [region, setRegion] = useState('us-west-2');
  const [rowStorage, setRowStorage] = useState(25);
  const [colStorage, setColStorage] = useState(25);
  const [requestUnitsM, setRequestUnitsM] = useState(250);

  const cost = useMemo(() => calculateStarterCost({ regionKey: region, rowStorageGiB: rowStorage, colStorageGiB: colStorage, requestUnitsM }), [region, rowStorage, colStorage, requestUnitsM]);
  const rd = starterPricing.regions[region];

  return (
    <div className="calc-layout">
      <div className="page-card">
        <h3 className="calc-tier-title">Starter</h3>
        <p className="calc-tier-desc">Pay-as-you-go with generous free quota. Best for dev/test and small apps.</p>
        <RegionSelect regions={starterPricing.regions} value={region} onChange={setRegion} />
        <SliderInput label="Row Storage" value={rowStorage} onChange={setRowStorage} min={0} max={500} unit="GiB" freeLimit={25} />
        <SliderInput label="Columnar Storage" value={colStorage} onChange={setColStorage} min={0} max={500} unit="GiB" freeLimit={25} />
        <SliderInput label="Request Units" value={requestUnitsM} onChange={setRequestUnitsM} min={0} max={5000} step={10} unit="M/mo" freeLimit={250} formatValue={(v) => `${v}M RUs`} />
      </div>
      <CostDisplay
        title="Estimated Monthly Cost" total={cost.total}
        items={[
          { label: 'Row Storage', detail: `${rowStorage} GiB × $${rd.rowPerGiB}/GiB`, value: `$${cost.rowCost}` },
          { label: 'Columnar Storage', detail: `${colStorage} GiB × $${rd.colPerGiB}/GiB`, value: `$${cost.colCost}` },
          { label: 'Request Units', detail: `${requestUnitsM}M RUs × $${rd.ruPer1M}/1M`, value: `$${cost.ruCost}` },
          { label: 'Free quota', value: 'Included', highlight: true, detail: '25 GiB row + 25 GiB col + 250M RUs' },
        ]}
        note={`Starter pricing for ${rd.label}. Free quota applies across up to 5 clusters per org.`}
      />
    </div>
  );
}

/* ─── Essential ─── */

function EssentialCalculator() {
  const [region, setRegion] = useState('us-west-2');
  const [rcuCount, setRcuCount] = useState(2000);
  const [rowStorage, setRowStorage] = useState(50);
  const [colStorage, setColStorage] = useState(0);
  const [dualEncryption, setDualEncryption] = useState(false);

  const cost = useMemo(() => calculateEssentialCost({ regionKey: region, rcuCount, rowStorageGiB: rowStorage, colStorageGiB: colStorage, dualEncryption }), [region, rcuCount, rowStorage, colStorage, dualEncryption]);
  const rd = essentialPricing.regions[region];

  return (
    <div className="calc-layout">
      <div className="page-card">
        <h3 className="calc-tier-title">Essential</h3>
        <p className="calc-tier-desc">Provisioned capacity with 99.99% availability. Best for production workloads.</p>
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
      </div>
      <CostDisplay
        title="Estimated Monthly Cost" total={cost.total} subtitle={`~$${cost.dailyCost}/day`}
        items={[
          { label: 'Compute (RCU)', detail: `${cost.effectiveRCU.toLocaleString()} RCU × $${rd.rcuPerMonth}/RCU/mo`, value: `$${cost.rcuCost.toLocaleString()}` },
          { label: 'Row Storage', detail: `${rowStorage} GiB × $${dualEncryption ? rd.rowEncPerGiB : rd.rowPerGiB}/GiB`, value: `$${cost.rowCost.toLocaleString()}` },
          { label: 'Columnar Storage', detail: colStorage > 0 ? `${colStorage} GiB × $${dualEncryption ? rd.colEncPerGiB : rd.colPerGiB}/GiB` : 'Not configured', value: colStorage > 0 ? `$${cost.colCost.toLocaleString()}` : '$0' },
        ]}
        note={`Essential pricing for ${rd.label}. Min 2,000 RCU/cluster. Includes 99.99% SLA, multi-AZ, PITR.`}
      />
    </div>
  );
}

/* ─── Dedicated ─── */

function NodeSelector({ label, icon, specs, specIdx, onSpecChange, nodes, onNodesChange, minNodes = 1 }) {
  return (
    <div className="node-selector">
      <h4 className="node-selector-title">
        <span className="node-selector-icon">{icon}</span>
        {label}
      </h4>
      <div className="node-selector-body">
        <select value={specIdx} onChange={(e) => onSpecChange(Number(e.target.value))} className="region-select">
          {specs.map((spec, i) => (
            <option key={i} value={i}>{spec.label} — ${spec.pricePerHr}/hr</option>
          ))}
        </select>
        <div className="node-counter">
          <label className="node-counter-label">Nodes {minNodes > 1 && `(min ${minNodes})`}</label>
          <div className="node-counter-controls">
            <button onClick={() => onNodesChange(Math.max(minNodes, nodes - 1))} className="node-counter-btn">−</button>
            <span className="node-counter-value">{nodes}</span>
            <button onClick={() => onNodesChange(nodes + 1)} className="node-counter-btn">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DedicatedCalculator() {
  const [tidbIdx, setTidbIdx] = useState(1); // default 8 vCPU, 16 GiB
  const [tidbNodes, setTidbNodes] = useState(2);
  const [tikvIdx, setTikvIdx] = useState(2); // default 8 vCPU, 64 GiB
  const [tikvNodes, setTikvNodes] = useState(3);
  const [tikvStorageGiB, setTikvStorageGiB] = useState(1024);
  const [tikvStorageType, setTikvStorageType] = useState('standard');
  const [useTiflash, setUseTiflash] = useState(false);
  const [tiflashIdx, setTiflashIdx] = useState(0);
  const [tiflashNodes, setTiflashNodes] = useState(1);
  const [tiflashStorageGiB, setTiflashStorageGiB] = useState(1024);

  const cost = useMemo(() => calculateDedicatedCost({
    tidbSpec: dedicatedPricing.tidb[tidbIdx], tidbNodes,
    tikvSpec: dedicatedPricing.tikv[tikvIdx], tikvNodes,
    tikvStorageGiB, tikvStorageType,
    tiflashSpec: useTiflash ? dedicatedPricing.tiflash[tiflashIdx] : null,
    tiflashNodes: useTiflash ? tiflashNodes : 0,
    tiflashStorageGiB,
  }), [tidbIdx, tidbNodes, tikvIdx, tikvNodes, tikvStorageGiB, tikvStorageType, useTiflash, tiflashIdx, tiflashNodes, tiflashStorageGiB]);

  const costItems = [
    { label: 'TiDB Compute', detail: `${tidbNodes} × ${dedicatedPricing.tidb[tidbIdx].label} @ $${dedicatedPricing.tidb[tidbIdx].pricePerHr}/hr`, value: `$${cost.tidbCost.toLocaleString()}` },
    { label: 'TiKV Compute', detail: `${tikvNodes} × ${dedicatedPricing.tikv[tikvIdx].label} @ $${dedicatedPricing.tikv[tikvIdx].pricePerHr}/hr`, value: `$${cost.tikvComputeCost.toLocaleString()}` },
    { label: 'TiKV Storage', detail: `${tikvNodes} × ${tikvStorageGiB} GiB (${tikvStorageType})`, value: `$${cost.tikvStorageCost.toLocaleString()}` },
  ];
  if (useTiflash) {
    costItems.push(
      { label: 'TiFlash Compute', detail: `${tiflashNodes} × ${dedicatedPricing.tiflash[tiflashIdx].label} @ $${dedicatedPricing.tiflash[tiflashIdx].pricePerHr}/hr`, value: `$${cost.tiflashComputeCost.toLocaleString()}` },
      { label: 'TiFlash Storage', detail: `${tiflashNodes} × ${tiflashStorageGiB} GiB`, value: `$${cost.tiflashStorageCost.toLocaleString()}` },
    );
  }

  return (
    <div className="calc-layout">
      <div className="page-card">
        <h3 className="calc-tier-title">Dedicated</h3>
        <p className="calc-tier-desc">Dedicated resources on AWS. Compute + storage priced separately per node.</p>

        <NodeSelector label="TiDB Nodes (SQL Layer)" icon="Ti" specs={dedicatedPricing.tidb} specIdx={tidbIdx} onSpecChange={setTidbIdx} nodes={tidbNodes} onNodesChange={setTidbNodes} />

        <NodeSelector label="TiKV Nodes (Storage Layer)" icon="KV" specs={dedicatedPricing.tikv} specIdx={tikvIdx} onSpecChange={setTikvIdx} nodes={tikvNodes} onNodesChange={setTikvNodes} minNodes={3} />

        <div className="slider-group" style={{ paddingLeft: '42px' }}>
          <div className="slider-header">
            <label className="slider-label">Storage per TiKV node</label>
            <span className="slider-value">{tikvStorageGiB.toLocaleString()} GiB</span>
          </div>
          <input type="range" min={200} max={8000} step={100} value={tikvStorageGiB} onChange={(e) => setTikvStorageGiB(Number(e.target.value))} className="w-full" />
          <div className="slider-range"><span>200 GiB</span><span>8,000 GiB</span></div>
        </div>

        <div className="slider-group" style={{ paddingLeft: '42px' }}>
          <label className="slider-label">Storage type</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setTikvStorageType('standard')}
              className={`pill-btn ${tikvStorageType === 'standard' ? 'pill-btn-dark' : 'pill-btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setTikvStorageType('basic')}
              className={`pill-btn ${tikvStorageType === 'basic' ? 'pill-btn-dark' : 'pill-btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Basic
            </button>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#86868b', marginTop: '6px' }}>
            {tikvStorageType === 'standard'
              ? 'Standard: IOPS & throughput included, no extra fees.'
              : 'Basic: Lower storage cost, separate IOPS & throughput fee.'}
          </p>
        </div>

        <label className="calc-checkbox">
          <input type="checkbox" checked={useTiflash} onChange={(e) => setUseTiflash(e.target.checked)} />
          <span className="calc-checkbox-label">Add TiFlash (Columnar Analytics)</span>
        </label>
        {useTiflash && (
          <div style={{ marginTop: '16px' }}>
            <NodeSelector label="TiFlash Nodes" icon="TF" specs={dedicatedPricing.tiflash} specIdx={tiflashIdx} onSpecChange={setTiflashIdx} nodes={tiflashNodes} onNodesChange={setTiflashNodes} />
            <div className="slider-group" style={{ paddingLeft: '42px' }}>
              <div className="slider-header">
                <label className="slider-label">Storage per TiFlash node</label>
                <span className="slider-value">{tiflashStorageGiB.toLocaleString()} GiB</span>
              </div>
              <input type="range" min={200} max={8000} step={100} value={tiflashStorageGiB} onChange={(e) => setTiflashStorageGiB(Number(e.target.value))} className="w-full" />
              <div className="slider-range"><span>200 GiB</span><span>8,000 GiB</span></div>
            </div>
          </div>
        )}
      </div>
      <CostDisplay
        title="Estimated Monthly Cost" total={cost.total} subtitle={`$${cost.hourly}/hr · 730 hrs/mo`}
        items={costItems}
        note="AWS Oregon (us-west-2) on-demand rates. Compute charged per hour, storage per GiB/hour. Contact PingCAP for reserved pricing and other regions."
      />
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
      <a
        href="https://www.pingcap.com/contact-us/"
        target="_blank"
        rel="noreferrer"
        className="selfmanaged-cta"
      >
        Contact Us
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      </a>
    </div>
  );
}

/* ─── Main ─── */

export default function CostCalculator() {
  const [tab, setTab] = useState('starter');

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Cost Calculator</h1>
          <p className="page-subtitle">Choose a TiDB Cloud tier and configure your workload to estimate monthly costs.</p>
        </div>

        <div className="calc-tabs">
          <TabButton active={tab === 'starter'} onClick={() => setTab('starter')}>Starter</TabButton>
          <TabButton active={tab === 'essential'} onClick={() => setTab('essential')}>Essential</TabButton>
          <TabButton active={tab === 'dedicated'} onClick={() => setTab('dedicated')}>Dedicated</TabButton>
          <TabButton active={tab === 'premium'} onClick={() => setTab('premium')}>Premium</TabButton>
          <TabButton active={tab === 'byoc'} onClick={() => setTab('byoc')}>BYOC</TabButton>
          <TabButton active={tab === 'selfmanaged'} onClick={() => setTab('selfmanaged')}>Self-Managed</TabButton>
        </div>

        {tab === 'starter' && <StarterCalculator />}
        {tab === 'essential' && <EssentialCalculator />}
        {tab === 'dedicated' && <DedicatedCalculator />}
        {tab === 'premium' && <PremiumCard />}
        {tab === 'byoc' && <BYOCCard />}
        {tab === 'selfmanaged' && <SelfManagedCard />}
      </div>
    </section>
  );
}
