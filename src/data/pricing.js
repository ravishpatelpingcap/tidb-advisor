// ═══════════════════════════════════════════════
//  TiDB Cloud Starter Pricing
//  Source: pingcap.com/tidb-cloud-starter-pricing-details
// ═══════════════════════════════════════════════
export const starterPricing = {
  name: 'TiDB Cloud Starter',
  regions: {
    'us-west-2':      { label: 'AWS Oregon (us-west-2)',           ruPer1M: 0.10, rowPerGiB: 0.20, colPerGiB: 0.05 },
    'us-east-1':      { label: 'AWS N. Virginia (us-east-1)',      ruPer1M: 0.10, rowPerGiB: 0.20, colPerGiB: 0.05 },
    'ap-southeast-1': { label: 'AWS Singapore (ap-southeast-1)',   ruPer1M: 0.12, rowPerGiB: 0.24, colPerGiB: 0.06 },
    'ap-northeast-1': { label: 'AWS Tokyo (ap-northeast-1)',       ruPer1M: 0.12, rowPerGiB: 0.24, colPerGiB: 0.06 },
    'eu-central-1':   { label: 'AWS Frankfurt (eu-central-1)',     ruPer1M: 0.12, rowPerGiB: 0.24, colPerGiB: 0.06 },
  },
  freeQuota: {
    rowStorageGiB: 25,
    colStorageGiB: 25,
    requestUnitsM: 250,
  },
};

// ═══════════════════════════════════════════════
//  TiDB Cloud Essential Pricing
//  Source: pingcap.com/tidb-cloud-essential-pricing-details
// ═══════════════════════════════════════════════
export const essentialPricing = {
  name: 'TiDB Cloud Essential',
  minRCU: 2000,
  regions: {
    'us-west-2':      { label: 'AWS Oregon (us-west-2)',           rcuPerMonth: 0.20, rowPerGiB: 0.20, rowEncPerGiB: 0.30, colPerGiB: 0.05, colEncPerGiB: 0.075 },
    'us-east-1':      { label: 'AWS N. Virginia (us-east-1)',      rcuPerMonth: 0.20, rowPerGiB: 0.20, rowEncPerGiB: 0.30, colPerGiB: 0.05, colEncPerGiB: 0.075 },
    'ap-southeast-1': { label: 'AWS Singapore (ap-southeast-1)',   rcuPerMonth: 0.24, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
    'ap-northeast-1': { label: 'AWS Tokyo (ap-northeast-1)',       rcuPerMonth: 0.24, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
    'eu-central-1':   { label: 'AWS Frankfurt (eu-central-1)',     rcuPerMonth: 0.24, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
    'ali-sg':         { label: 'Alibaba Cloud Singapore',          rcuPerMonth: 0.24, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
    'ali-tokyo':      { label: 'Alibaba Cloud Tokyo',              rcuPerMonth: 0.28, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
    'ali-frankfurt':  { label: 'Alibaba Cloud Frankfurt',          rcuPerMonth: 0.27, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
    'ali-virginia':   { label: 'Alibaba Cloud N. Virginia',        rcuPerMonth: 0.22, rowPerGiB: 0.20, rowEncPerGiB: 0.30, colPerGiB: 0.05, colEncPerGiB: 0.075 },
  },
};

// ═══════════════════════════════════════════════
//  TiDB Cloud Dedicated Pricing
//  Source: pingcap.com/tidb-cloud-pricing-details
//  Region: AWS Oregon (us-west-2)
// ═══════════════════════════════════════════════
export const dedicatedPricing = {
  name: 'TiDB Cloud Dedicated',

  // TiDB nodes (SQL layer, no storage)
  tidb: [
    { vcpu: 4,  memory: 16,  pricePerHr: 0.4416, label: '4 vCPU, 16 GiB' },
    { vcpu: 8,  memory: 16,  pricePerHr: 0.7820, label: '8 vCPU, 16 GiB' },
    { vcpu: 8,  memory: 32,  pricePerHr: 0.8832, label: '8 vCPU, 32 GiB' },
    { vcpu: 16, memory: 32,  pricePerHr: 1.5640, label: '16 vCPU, 32 GiB' },
    { vcpu: 16, memory: 64,  pricePerHr: 1.7664, label: '16 vCPU, 64 GiB' },
    { vcpu: 32, memory: 64,  pricePerHr: 3.1280, label: '32 vCPU, 64 GiB' },
  ],

  // TiKV nodes (storage layer)
  // Compute cost + Storage cost (Standard or Basic)
  tikv: [
    { vcpu: 4,  memory: 16,  pricePerHr: 0.4416, label: '4 vCPU, 16 GiB',
      storage: { standard: { perGiBHr: 0.000197, iopsHr: 0 }, basic: { perGiBHr: 0.000109, iopsHr: 0.001026 } } },
    { vcpu: 8,  memory: 32,  pricePerHr: 0.8832, label: '8 vCPU, 32 GiB',
      storage: { standard: { perGiBHr: 0.000197, iopsHr: 0 }, basic: { perGiBHr: 0.000109, iopsHr: 0.014802 } } },
    { vcpu: 8,  memory: 64,  pricePerHr: 1.3708, label: '8 vCPU, 64 GiB',
      storage: { standard: { perGiBHr: 0.000197, iopsHr: 0 }, basic: { perGiBHr: 0.000109, iopsHr: 0.014802 } } },
    { vcpu: 16, memory: 64,  pricePerHr: 1.7664, label: '16 vCPU, 64 GiB',
      storage: { standard: { perGiBHr: 0.000197, iopsHr: 0 }, basic: { perGiBHr: 0.000109, iopsHr: 0.055326 } } },
    { vcpu: 32, memory: 128, pricePerHr: 3.5328, label: '32 vCPU, 128 GiB',
      storage: { standard: { perGiBHr: 0.000197, iopsHr: 0 }, basic: { perGiBHr: 0.000109, iopsHr: 0.125250 } } },
  ],

  // TiFlash nodes (columnar analytics)
  // Only Basic storage type available
  tiflash: [
    { vcpu: 8,  memory: 64,  pricePerHr: 1.3708, label: '8 vCPU, 64 GiB',
      storage: { perGiBHr: 0.000109, iopsHr: 0.062802 } },
    { vcpu: 16, memory: 128, pricePerHr: 2.3184, label: '16 vCPU, 128 GiB',
      storage: { perGiBHr: 0.000109, iopsHr: 0.103326 } },
    { vcpu: 32, memory: 128, pricePerHr: 3.5328, label: '32 vCPU, 128 GiB',
      storage: { perGiBHr: 0.000109, iopsHr: 0.125250 } },
    { vcpu: 32, memory: 256, pricePerHr: 4.6368, label: '32 vCPU, 256 GiB',
      storage: { perGiBHr: 0.000109, iopsHr: 0.125250 } },
  ],

  // Backup pricing
  backup: {
    singleRegionPerGBMonth: 0.023,
    dualRegionPerGBMonth: 0.10,
  },

  // Changefeed & Data Migration
  changefeedRCUPerHr: 0.1307,
  dataMigrationRCUPerHr: 0.1307,
};

// ═══════════════════════════════════════════════
//  Calculator Functions
// ═══════════════════════════════════════════════

export function calculateStarterCost({ regionKey, rowStorageGiB, colStorageGiB, requestUnitsM }) {
  const region = starterPricing.regions[regionKey] || starterPricing.regions['us-west-2'];
  const free = starterPricing.freeQuota;

  const extraRow = Math.max(0, rowStorageGiB - free.rowStorageGiB);
  const extraCol = Math.max(0, colStorageGiB - free.colStorageGiB);
  const extraRU  = Math.max(0, requestUnitsM - free.requestUnitsM);

  const rowCost = round(extraRow * region.rowPerGiB);
  const colCost = round(extraCol * region.colPerGiB);
  const ruCost  = round(extraRU * region.ruPer1M);

  return {
    rowCost, colCost, ruCost,
    storageCost: round(rowCost + colCost),
    total: round(rowCost + colCost + ruCost),
    region: region.label,
    freeRow: free.rowStorageGiB,
    freeCol: free.colStorageGiB,
    freeRU: free.requestUnitsM,
  };
}

export function calculateEssentialCost({ regionKey, rcuCount, rowStorageGiB, colStorageGiB, dualEncryption }) {
  const region = essentialPricing.regions[regionKey] || essentialPricing.regions['us-west-2'];
  const rcu = Math.max(essentialPricing.minRCU, rcuCount);

  const rcuCost = round(rcu * region.rcuPerMonth);
  const rowRate = dualEncryption ? region.rowEncPerGiB : region.rowPerGiB;
  const colRate = dualEncryption ? region.colEncPerGiB : region.colPerGiB;
  const rowCost = round(rowStorageGiB * rowRate);
  const colCost = round(colStorageGiB * colRate);

  return {
    rcuCost, rowCost, colCost,
    storageCost: round(rowCost + colCost),
    total: round(rcuCost + rowCost + colCost),
    region: region.label,
    effectiveRCU: rcu,
    dailyCost: round((rcuCost + rowCost + colCost) / 30),
  };
}

/**
 * Dedicated cost = Compute + Storage (per node)
 *
 * Compute: pricePerHr × nodes × 730 hrs/mo
 * Storage (TiKV Standard): perGiBHr × storageGiB × 730 hrs/mo × nodes
 * Storage (TiKV Basic):    (perGiBHr × storageGiB + iopsHr) × 730 hrs/mo × nodes
 * Storage (TiFlash Basic): (perGiBHr × storageGiB + iopsHr) × 730 hrs/mo × nodes
 */
export function calculateDedicatedCost({
  tidbSpec, tidbNodes,
  tikvSpec, tikvNodes, tikvStorageGiB = 1024, tikvStorageType = 'standard',
  tiflashSpec, tiflashNodes, tiflashStorageGiB = 1024,
}) {
  const H = 730; // hours per month

  // TiDB: compute only (no storage)
  const tidbComputeHr = tidbSpec ? tidbSpec.pricePerHr * tidbNodes : 0;
  const tidbCost = round(tidbComputeHr * H);

  // TiKV: compute + storage
  let tikvComputeHr = 0;
  let tikvStorageHr = 0;
  if (tikvSpec) {
    tikvComputeHr = tikvSpec.pricePerHr * tikvNodes;
    const st = tikvSpec.storage[tikvStorageType] || tikvSpec.storage.standard;
    tikvStorageHr = (st.perGiBHr * tikvStorageGiB + st.iopsHr) * tikvNodes;
  }
  const tikvComputeCost = round(tikvComputeHr * H);
  const tikvStorageCost = round(tikvStorageHr * H);
  const tikvCost = round(tikvComputeCost + tikvStorageCost);

  // TiFlash: compute + storage (Basic only)
  let tiflashComputeHr = 0;
  let tiflashStorageHr = 0;
  if (tiflashSpec && tiflashNodes > 0) {
    tiflashComputeHr = tiflashSpec.pricePerHr * tiflashNodes;
    const st = tiflashSpec.storage;
    tiflashStorageHr = (st.perGiBHr * tiflashStorageGiB + st.iopsHr) * tiflashNodes;
  }
  const tiflashComputeCost = round(tiflashComputeHr * H);
  const tiflashStorageCost = round(tiflashStorageHr * H);
  const tiflashCost = round(tiflashComputeCost + tiflashStorageCost);

  const totalHr = tidbComputeHr + tikvComputeHr + tikvStorageHr + tiflashComputeHr + tiflashStorageHr;
  const total = round(tidbCost + tikvCost + tiflashCost);

  return {
    tidbCost,
    tikvCost,
    tikvComputeCost,
    tikvStorageCost,
    tiflashCost,
    tiflashComputeCost,
    tiflashStorageCost,
    total,
    hourly: round(totalHr),
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}
