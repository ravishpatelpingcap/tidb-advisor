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
    'ali-sg':         { label: 'Alibaba Cloud Singapore',          ruPer1M: 0.12, rowPerGiB: 0.24, colPerGiB: 0.06 },
  },
  freeQuota: {
    rowStorageGiB: 5,
    colStorageGiB: 5,
    requestUnitsM: 50,
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
    'mx-central-1':   { label: 'AWS Mexico (Querétaro)',             rcuPerMonth: 0.22, rowPerGiB: 0.24, rowEncPerGiB: 0.36, colPerGiB: 0.06, colEncPerGiB: 0.09 },
  },
};

// ═══════════════════════════════════════════════
//  TiDB Cloud Dedicated Pricing
//  Source: TiDB Cloud console + internal pricing tool (March 2026)
//  All 13 AWS regions, 13 GCP regions, 3 Azure regions
//
//  Pricing basis: per-node rates for TiDB 8v16g, TiKV 8v32g, Standard storage
//  Internal tool totals divided by node counts (2 TiDB, 3 TiKV, 3×1024 GiB)
// ═══════════════════════════════════════════════

// Helper: build a region pricing object from base rates
function awsRegion(label, tidb8v16g, tikv8v32g, storagePerGiBHr) {
  const tiflash8v64g = round4(tikv8v32g * 1.55);
  return {
    label,
    tidb: [
      { vcpu: 8,  memory: 16, pricePerHr: tidb8v16g,              label: '8 vCPU, 16 GiB' },
      { vcpu: 16, memory: 32, pricePerHr: round4(tidb8v16g * 2),  label: '16 vCPU, 32 GiB' },
    ],
    tikv: [
      { vcpu: 8,  memory: 32, pricePerHr: tikv8v32g,              label: '8 vCPU, 32 GiB',  storage: { standard: { perGiBHr: storagePerGiBHr, iopsHr: 0 } } },
      { vcpu: 16, memory: 64, pricePerHr: round4(tikv8v32g * 2),  label: '16 vCPU, 64 GiB', storage: { standard: { perGiBHr: storagePerGiBHr, iopsHr: 0 } } },
    ],
    tiflash: [
      { vcpu: 8,  memory: 64,  pricePerHr: tiflash8v64g,              label: '8 vCPU, 64 GiB',   storage: { perGiBHr: storagePerGiBHr, iopsHr: 0 } },
      { vcpu: 16, memory: 128, pricePerHr: round4(tiflash8v64g * 2),  label: '16 vCPU, 128 GiB', storage: { perGiBHr: storagePerGiBHr, iopsHr: 0 } },
    ],
  };
}

function gcpRegion(label, tidb8v16g, tikv8v32g, storagePerGiBHr) {
  const tiflash8v64g = round4(tikv8v32g * 1.55);
  return {
    label,
    tidb: [
      { vcpu: 8,  memory: 16, pricePerHr: tidb8v16g,              label: '8 vCPU, 16 GiB' },
      { vcpu: 16, memory: 32, pricePerHr: round4(tidb8v16g * 2),  label: '16 vCPU, 32 GiB' },
    ],
    tikv: [
      { vcpu: 8,  memory: 32, pricePerHr: tikv8v32g,              label: '8 vCPU, 32 GiB',  storage: { standard: { perGiBHr: storagePerGiBHr, iopsHr: 0 } } },
      { vcpu: 16, memory: 64, pricePerHr: round4(tikv8v32g * 2),  label: '16 vCPU, 64 GiB', storage: { standard: { perGiBHr: storagePerGiBHr, iopsHr: 0 } } },
    ],
    tiflash: [
      { vcpu: 8,  memory: 64,  pricePerHr: tiflash8v64g,              label: '8 vCPU, 64 GiB',   storage: { perGiBHr: storagePerGiBHr, iopsHr: 0 } },
      { vcpu: 16, memory: 128, pricePerHr: round4(tiflash8v64g * 2),  label: '16 vCPU, 128 GiB', storage: { perGiBHr: storagePerGiBHr, iopsHr: 0 } },
    ],
  };
}

function azureRegion(label, tidb8v16g, tikv8v32g, storagePerGiBHr) {
  const tiflash8v64g = round4(tikv8v32g * 1.55);
  return {
    label,
    tidb: [
      { vcpu: 8,  memory: 16, pricePerHr: tidb8v16g,              label: '8 vCPU, 16 GiB' },
      { vcpu: 16, memory: 32, pricePerHr: round4(tidb8v16g * 2),  label: '16 vCPU, 32 GiB' },
    ],
    tikv: [
      { vcpu: 8,  memory: 32, pricePerHr: tikv8v32g,              label: '8 vCPU, 32 GiB',  storage: { standard: { perGiBHr: storagePerGiBHr, iopsHr: 0 } } },
      { vcpu: 16, memory: 64, pricePerHr: round4(tikv8v32g * 2),  label: '16 vCPU, 64 GiB', storage: { standard: { perGiBHr: storagePerGiBHr, iopsHr: 0 } } },
    ],
    tiflash: [
      { vcpu: 8,  memory: 64,  pricePerHr: tiflash8v64g,              label: '8 vCPU, 64 GiB',   storage: { perGiBHr: storagePerGiBHr, iopsHr: 0 } },
      { vcpu: 16, memory: 128, pricePerHr: round4(tiflash8v64g * 2),  label: '16 vCPU, 128 GiB', storage: { perGiBHr: storagePerGiBHr, iopsHr: 0 } },
    ],
  };
}

function round4(n) { return Math.round(n * 10000) / 10000; }
function round6(n) { return Math.round(n * 1000000) / 1000000; }

export const dedicatedPricing = {
  name: 'TiDB Cloud Dedicated',
  provider: 'AWS',
  regions: {
    // ── US regions ─────────────────────────────────────────────
    'us-east-1':      awsRegion('AWS N. Virginia (us-east-1)',    0.7820, 0.8832, round6(0.6052 / 3072)),
    'us-west-2':      awsRegion('AWS Oregon (us-west-2)',         0.7820, 0.8832, round6(0.6052 / 3072)),

    // ── Asia-Pacific ────────────────────────────────────────────
    'ap-northeast-1': awsRegion('AWS Tokyo (ap-northeast-1)',     0.9844, 1.1408, round6(0.7281 / 3072)),
    'ap-northeast-2': awsRegion('AWS Seoul (ap-northeast-2)',     0.8832, 1.0856, round6(0.6912 / 3072)),
    'ap-south-1':     awsRegion('AWS Mumbai (ap-south-1)',        0.7820, 0.9292, round6(0.6912 / 3072)),
    'ap-southeast-1': awsRegion('AWS Singapore (ap-southeast-1)', 0.9016, 1.1040, round6(0.7281 / 3072)),
    'ap-southeast-2': awsRegion('AWS Sydney (ap-southeast-2)',    1.0212, 1.1040, round6(0.7281 / 3072)),
    'ap-southeast-3': awsRegion('AWS Jakarta (ap-southeast-3)',   0.9016, 1.1040, round6(0.7281 / 3072)),
    'ap-east-1':      awsRegion('AWS Hong Kong (ap-east-1)',      0.9936, 1.2144, round6(0.7956 / 3072)),

    // ── Europe ──────────────────────────────────────────────────
    'eu-central-1':   awsRegion('AWS Frankfurt (eu-central-1)',   0.8924, 1.0580, round6(0.7219 / 3072)),
    'eu-west-1':      awsRegion('AWS Ireland (eu-west-1)',        0.8391, 0.9844, round6(0.3686 / 3072)),
    'eu-west-2':      awsRegion('AWS London (eu-west-2)',         0.9292, 0.9844, round6(0.3901 / 3072)),

    // ── South America ───────────────────────────────────────────
    'sa-east-1':      awsRegion('AWS São Paulo (sa-east-1)',      1.2052, 1.4076, round6(1.1520 / 3072)),
  },

  // Backup pricing
  backup: {
    singleRegionPerGBMonth: 0.023,
    dualRegionPerGBMonth: 0.10,
  },

  // Changefeed & Data Migration
  changefeedRCUPerHr: 0.1307,
  dataMigrationRCUPerHr: 0.1307,
};

export const dedicatedProviderOptions = {
  aws: {
    label: 'AWS',
    supportsFullClusterEstimate: true,
    regions: dedicatedPricing.regions,
    tiproxy: {
      small: {
        'us-west-2': 0.1955,
        'us-east-1': 0.1955,
        'ap-northeast-2': 0.2208,
        'ap-southeast-1': 0.2254,
        'ap-northeast-1': 0.2461,
        'eu-central-1': 0.2231,
        'ap-south-1': 0.1955,
        'ap-southeast-3': 0.2254,
        'ap-southeast-2': 0.2254,
        'ap-east-1': 0.2461,
        'eu-west-1': 0.2231,
        'eu-west-2': 0.2231,
        'sa-east-1': 0.2461,
      },
      large: {
        'us-west-2': 0.7820,
        'us-east-1': 0.7820,
        'ap-northeast-2': 0.8832,
        'ap-southeast-1': 0.9016,
        'ap-northeast-1': 0.9844,
        'eu-central-1': 0.8924,
        'ap-south-1': 0.7820,
        'ap-southeast-3': 0.9016,
        'ap-southeast-2': 0.9016,
        'ap-east-1': 0.9844,
        'eu-west-1': 0.8924,
        'eu-west-2': 0.8924,
        'sa-east-1': 0.9844,
      },
    },
    backup: {
      single: {
        'us-west-2': 0.023,
        'us-east-1': 0.023,
        'ap-northeast-2': 0.025,
        'ap-southeast-1': 0.025,
        'ap-northeast-1': 0.025,
        'eu-central-1': 0.0245,
        'ap-south-1': 0.025,
        'ap-southeast-3': 0.025,
        'ap-southeast-2': 0.025,
        'ap-east-1': 0.025,
        'eu-west-1': 0.0245,
        'eu-west-2': 0.0245,
        'sa-east-1': 0.025,
      },
      dual: {
        'us-west-2': 0.10,
        'us-east-1': 0.10,
        'ap-northeast-2': 0.109,
        'ap-southeast-1': 0.109,
        'ap-northeast-1': 0.109,
        'eu-central-1': 0.1065,
        'ap-south-1': 0.109,
        'ap-southeast-3': 0.109,
        'ap-southeast-2': 0.109,
        'ap-east-1': 0.109,
        'eu-west-1': 0.1065,
        'eu-west-2': 0.1065,
        'sa-east-1': 0.109,
      },
    },
  },
};

// ═══════════════════════════════════════════════
//  GCP — per-region pricing (13 regions)
// ═══════════════════════════════════════════════
const gcpRegions = {
  'us-central1':      gcpRegion('GCP Iowa (us-central1)',              0.7745, 0.8934, round6(0.7127 / 3072)),
  'us-east4':         gcpRegion('GCP N. Virginia (us-east4)',          0.8723, 1.0062, round6(0.7864 / 3072)),
  'us-west1':         gcpRegion('GCP Oregon (us-west1)',               0.7745, 0.8934, round6(0.7127 / 3072)),
  'asia-east1':       gcpRegion('GCP Taiwan (asia-east1)',             0.8967, 1.0345, round6(0.7127 / 3072)),
  'asia-northeast1':  gcpRegion('GCP Tokyo (asia-northeast1)',         0.9942, 1.1462, round6(0.9277 / 3072)),
  'asia-northeast2':  gcpRegion('GCP Osaka (asia-northeast2)',         0.9946, 2.2924, round6(0.9277 / 3072)),
  'asia-southeast1':  gcpRegion('GCP Singapore (asia-southeast1)',     0.9554, 1.1022, round6(0.7864 / 3072)),
  'asia-southeast2':  gcpRegion('GCP Jakarta (asia-southeast2)',       1.0414, 1.2013, round6(0.9277 / 3072)),
  'asia-east2':       gcpRegion('GCP Hong Kong (asia-east2)',          1.0836, 0.3125, round6(0.7864 / 3072)), // TiKV suspect — raw total $0.9375 likely captured with wrong node size; needs verification
  'eu-west4':         gcpRegion('GCP Netherlands (eu-west4)',          0.9837, 0.9836, round6(0.7864 / 3072)),
  'eu-west3':         gcpRegion('GCP Frankfurt (eu-west3)',            1.1512, 1.1511, round6(0.8571 / 3072)),
  'eu-west2':         gcpRegion('GCP London (eu-west2)',               1.1512, 1.1511, round6(0.8571 / 3072)),
  'asia-south1':      gcpRegion('GCP Mumbai (asia-south1)',            0.9302, 1.0731, round6(0.8571 / 3072)),
};

// ═══════════════════════════════════════════════
//  Azure — per-region pricing (3 regions)
// ═══════════════════════════════════════════════
const azureRegions = {
  'eastus2':        azureRegion('Azure Virginia (eastus2)',           0.8832, 0.8832, round6(0.7158 / 3072)),
  'southeastasia':  azureRegion('Azure Singapore (southeastasia)',    1.1040, 1.1040, round6(0.8509 / 3072)),
  'japaneast':      azureRegion('Azure Tokyo (japaneast)',            1.1408, 1.1408, round6(0.8509 / 3072)),
};

// ═══════════════════════════════════════════════
//  Merged Dedicated regions for a single grouped dropdown
//  Each entry has a `provider` and `fullEstimate` flag
// ═══════════════════════════════════════════════
export const dedicatedAllRegions = {};

// AWS — full cluster estimate with per-region pricing
Object.entries(dedicatedPricing.regions).forEach(([key, r]) => {
  dedicatedAllRegions['aws-' + key] = { ...r, provider: 'AWS', fullEstimate: true };
});

// GCP — 13 regions, per-region pricing
Object.entries(gcpRegions).forEach(([key, r]) => {
  dedicatedAllRegions['gcp-' + key] = { ...r, provider: 'Google Cloud', fullEstimate: true };
});

// Azure — 3 regions, per-region pricing
Object.entries(azureRegions).forEach(([key, r]) => {
  dedicatedAllRegions['azure-' + key] = { ...r, provider: 'Azure', fullEstimate: true };
});

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
  region,
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
    tikvStorageHr = (st.perGiBHr * tikvStorageGiB + (st.iopsHr || 0)) * tikvNodes;
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
    tiflashStorageHr = (st.perGiBHr * tiflashStorageGiB + (st.iopsHr || 0)) * tiflashNodes;
  }
  const tiflashComputeCost = round(tiflashComputeHr * H);
  const tiflashStorageCost = round(tiflashStorageHr * H);
  const tiflashCost = round(tiflashComputeCost + tiflashStorageCost);

  const totalHr = tidbComputeHr + tikvComputeHr + tikvStorageHr + tiflashComputeHr + tiflashStorageHr;
  const total = round(tidbCost + tikvCost + tiflashCost);

  return {
    region: region?.label,
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
