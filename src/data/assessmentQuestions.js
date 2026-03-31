export const assessmentQuestions = [
  // ── Core context ──
  {
    id: 'primary_buyer',
    question: 'What best describes your role?',
    type: 'select',
    options: [
      { value: 'dev', label: 'Developer / Tech Lead', description: 'Building or migrating an application' },
      { value: 'dba', label: 'DBA / Platform Engineer', description: 'Managing database infrastructure' },
      { value: 'architect', label: 'Architect / VP Engineering', description: 'Evaluating strategic fit' },
      { value: 'manager', label: 'Product Manager / Business', description: 'Exploring options for a project' },
      { value: 'other', label: 'Other', description: 'Just browsing or evaluating' },
    ],
  },
  {
    id: 'current_db',
    question: 'What database are you using today?',
    type: 'select',
    options: [
      { value: 'mysql', label: 'MySQL', description: 'Including Percona, MariaDB, Vitess' },
      { value: 'aurora', label: 'Amazon Aurora', description: 'MySQL- or PostgreSQL-compatible' },
      { value: 'postgresql', label: 'PostgreSQL', description: 'Including CockroachDB, AlloyDB, Supabase' },
      { value: 'oracle', label: 'Oracle', description: 'Oracle Database' },
      { value: 'sqlserver', label: 'SQL Server', description: 'Microsoft SQL Server' },
      { value: 'mongodb', label: 'MongoDB / NoSQL', description: 'Document or NoSQL databases' },
      { value: 'dynamodb', label: 'DynamoDB / KV Store', description: 'Key-value or wide-column stores' },
      { value: 'other', label: 'Other / Starting fresh', description: 'New project or unlisted database' },
    ],
  },
  {
    id: 'architecture_today',
    question: 'How is your current database set up?',
    type: 'select',
    condition: (answers) => answers.current_db && answers.current_db !== 'other',
    options: [
      { value: 'single', label: 'Single instance', description: 'One primary, maybe a read replica' },
      { value: 'read_replicas', label: 'Primary + read replicas', description: 'Read scaling via replicas, writes go to one node' },
      { value: 'sharded', label: 'Manually sharded', description: 'Data split across multiple instances by app logic or proxy' },
      { value: 'managed_cluster', label: 'Managed cluster', description: 'Aurora, AlloyDB, PlanetScale, Vitess, etc.' },
      { value: 'nosql_cluster', label: 'NoSQL cluster / replica set', description: 'MongoDB replica set, DynamoDB tables, etc.' },
    ],
  },
  // ── Pain signals ──
  {
    id: 'biggest_pain',
    question: 'What is your biggest database pain right now?',
    type: 'select',
    options: [
      { value: 'scaling_writes', label: 'Write bottlenecks', description: 'Single-master limit, shard complexity, write hotspots' },
      { value: 'scaling_reads', label: 'Read performance / query latency', description: 'Slow queries, replica lag, cache misses' },
      { value: 'sharding_complexity', label: 'Sharding or partitioning headaches', description: 'Cross-shard queries, rebalancing, app-level routing' },
      { value: 'availability', label: 'Downtime or failover issues', description: 'Unplanned outages, slow failover, maintenance windows' },
      { value: 'cost', label: 'Cost is growing too fast', description: 'Licensing, I/O charges, overprovisioned capacity' },
      { value: 'analytics_gap', label: 'Need real-time analytics on live data', description: 'ETL lag, separate warehouse, stale dashboards' },
      { value: 'operational', label: 'DBA toil / maintenance burden', description: 'Manual scaling, patching, backup complexity' },
      { value: 'none', label: 'No major pain — just exploring', description: 'Evaluating options for a future project' },
    ],
  },
  {
    id: 'workload_type',
    question: 'What best describes your workload?',
    type: 'select',
    options: [
      { value: 'oltp', label: 'Transactions (OLTP)', description: 'User-facing reads & writes, APIs, CRUD operations' },
      { value: 'olap', label: 'Analytics (OLAP)', description: 'Dashboards, reporting, aggregations, data warehouse' },
      { value: 'htap', label: 'Both — transactions + analytics', description: 'Real-time analytics on live transactional data' },
      { value: 'kv', label: 'Simple key-value lookups', description: 'High-throughput gets/puts, caching layer' },
    ],
  },
  {
    id: 'db_size',
    question: 'How much data do you have (or expect)?',
    type: 'select',
    options: [
      { value: 'small', label: 'Under 5 GB', description: 'Small app or prototype' },
      { value: 'medium', label: '5 – 100 GB', description: 'Growing production workload' },
      { value: 'large', label: '100 GB – 1 TB', description: 'Established production system' },
      { value: 'xlarge', label: '1 – 10 TB', description: 'Large-scale system' },
      { value: 'massive', label: 'Over 10 TB', description: 'Enterprise / data-intensive' },
    ],
  },
  {
    id: 'qps',
    question: 'How many queries per second do you need?',
    type: 'select',
    options: [
      { value: 'low', label: 'Under 1,000 QPS', description: 'Low traffic — internal tools, small apps' },
      { value: 'medium', label: '1,000 – 10,000 QPS', description: 'Moderate traffic — typical SaaS / web apps' },
      { value: 'high', label: '10,000 – 100,000 QPS', description: 'High traffic — large consumer apps' },
      { value: 'very_high', label: 'Over 100,000 QPS', description: 'Very high traffic — real-time systems, gaming' },
    ],
  },
  {
    id: 'write_ratio',
    question: 'What does your read/write mix look like?',
    type: 'select',
    options: [
      { value: 'read_heavy', label: 'Mostly reads (80%+ reads)', description: 'Content sites, dashboards, search-heavy apps' },
      { value: 'balanced', label: 'Balanced mix', description: 'Roughly equal reads and writes' },
      { value: 'write_heavy', label: 'Mostly writes (60%+ writes)', description: 'Logging, IoT ingestion, event tracking' },
    ],
  },
  {
    id: 'growth',
    question: 'How fast is your data or traffic growing?',
    type: 'select',
    options: [
      { value: 'stable', label: 'Stable — not growing much', description: 'Mature product, predictable workload' },
      { value: 'moderate', label: 'Moderate growth', description: '2–5x growth expected over the next 1–2 years' },
      { value: 'fast', label: 'Fast growth', description: '5–10x+ growth expected, need to scale quickly' },
    ],
  },
  {
    id: 'availability',
    question: 'How much downtime can you tolerate?',
    type: 'select',
    options: [
      { value: 'standard', label: 'Some downtime is OK', description: '99.9% — about 8 hours/year, fine for non-critical apps' },
      { value: 'high', label: 'Very little downtime', description: '99.99% — under an hour/year, production SaaS' },
      { value: 'ultra', label: 'Near-zero downtime', description: '99.999% — minutes/year, mission-critical systems' },
    ],
  },
  {
    id: 'cloud_preference',
    question: 'Where do you want to deploy?',
    type: 'select',
    options: [
      { value: 'aws', label: 'AWS' },
      { value: 'gcp', label: 'Google Cloud' },
      { value: 'azure', label: 'Azure' },
      { value: 'multi', label: 'Multi-cloud' },
      { value: 'onprem', label: 'On-premises / self-managed' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your monthly database budget?',
    type: 'select',
    options: [
      { value: 'free', label: 'Free / under $50', description: 'Side project, prototype, dev/test' },
      { value: 'small', label: '$50 – $500', description: 'Early startup, small production app' },
      { value: 'medium', label: '$500 – $5,000', description: 'Growing production workload' },
      { value: 'large', label: '$5,000 – $50,000', description: 'Established company, significant traffic' },
      { value: 'enterprise', label: '$50,000+', description: 'Enterprise-grade infrastructure' },
    ],
  },
  // ── Migration compatibility (conditional) ──
  {
    id: 'migration_blockers',
    question: 'Do you rely on any of these database features?',
    type: 'multiselect',
    condition: (answers) => answers.current_db && answers.current_db !== 'other',
    options: [
      { value: 'none', label: 'None of these' },
      { value: 'stored_procedures', label: 'Stored procedures (complex business logic in the DB)' },
      { value: 'triggers', label: 'Database triggers' },
      { value: 'foreign_keys', label: 'Enforced foreign keys (must be at DB level)' },
      { value: 'pl_extensions', label: 'PL/pgSQL, PL/SQL, or CLR extensions' },
    ],
  },
  {
    id: 'can_refactor',
    question: 'Could you move that logic to your application code?',
    type: 'select',
    condition: (answers) => {
      const blockers = answers.migration_blockers || [];
      return blockers.some(v => v !== 'none');
    },
    options: [
      { value: 'yes', label: 'Yes — we can refactor', description: 'Team is willing and able to move logic to app layer' },
      { value: 'partial', label: 'Some of it, not all', description: 'We can migrate some, but some is too complex' },
      { value: 'no', label: 'No — it must stay in the database', description: 'Cannot change the application architecture' },
    ],
  },
  // ── Pain-specific deep-dives (conditional) ──
  {
    id: 'restore_pain',
    question: 'How confident are you in your current backup & restore?',
    type: 'select',
    condition: (answers) => answers.budget && answers.budget !== 'free',
    options: [
      { value: 'confident', label: 'Very confident — tested restores, fast RTO', description: 'We run regular restore drills and can recover quickly' },
      { value: 'ok', label: 'It works, but we haven\'t tested much', description: 'Backups exist but restore speed and coverage are unverified' },
      { value: 'worried', label: 'I worry about it', description: 'Long restore times, unclear RPO, or no PITR' },
      { value: 'none', label: 'No backup strategy in place', description: 'We have not set up proper backups yet' },
    ],
  },
  {
    id: 'search_requirements',
    question: 'Do you need search or vector capabilities in your database?',
    type: 'select',
    condition: (answers) => answers.budget && answers.budget !== 'free',
    options: [
      { value: 'none', label: 'No — standard SQL queries are enough' },
      { value: 'fulltext', label: 'Full-text search', description: 'Search across text fields without a separate engine like Elasticsearch' },
      { value: 'vector', label: 'Vector / similarity search', description: 'AI embeddings, RAG pipelines, nearest-neighbor lookups' },
      { value: 'both', label: 'Both full-text and vector search' },
    ],
  },
  {
    id: 'multi_tenant',
    question: 'Is your application multi-tenant?',
    type: 'select',
    condition: (answers) => answers.budget && answers.budget !== 'free' && answers.budget !== 'small',
    options: [
      { value: 'no', label: 'No — single-tenant or internal app' },
      { value: 'shared_schema', label: 'Yes — shared schema, tenant_id column', description: 'All tenants in one database, row-level isolation' },
      { value: 'db_per_tenant', label: 'Yes — database per tenant', description: 'Separate schemas or databases per customer' },
    ],
  },
  // ── Advanced needs (conditional on larger/production workloads) ──
  {
    id: 'compliance',
    question: 'Do you have any compliance requirements?',
    type: 'multiselect',
    condition: (answers) => answers.budget && answers.budget !== 'free',
    options: [
      { value: 'none', label: 'None' },
      { value: 'soc2', label: 'SOC 2' },
      { value: 'pci', label: 'PCI-DSS' },
      { value: 'hipaa', label: 'HIPAA' },
      { value: 'gdpr', label: 'GDPR' },
    ],
  },
  {
    id: 'security_needs',
    question: 'What security features do you need?',
    type: 'multiselect',
    condition: (answers) => answers.budget && answers.budget !== 'free' && answers.budget !== 'small',
    options: [
      { value: 'none', label: 'Standard security is fine' },
      { value: 'private_endpoint', label: 'Private endpoint (PrivateLink / Private Service Connect)' },
      { value: 'vpc_peering', label: 'VPC peering / dedicated network' },
      { value: 'cmek', label: 'Customer-managed encryption keys (CMEK)' },
      { value: 'audit', label: 'Database audit logging' },
    ],
  },
  {
    id: 'advanced_features',
    question: 'Which of these features are important to you?',
    type: 'multiselect',
    condition: (answers) => answers.budget && answers.budget !== 'free',
    options: [
      { value: 'none', label: 'None of these' },
      { value: 'pitr', label: 'Point-in-time recovery (restore to any second)' },
      { value: 'cdc', label: 'Change data capture (stream to Kafka, S3, etc.)' },
      { value: 'multi_region', label: 'Cross-region replication or disaster recovery' },
      { value: 'vector_search', label: 'Vector search / AI features' },
      { value: 'htap', label: 'Real-time analytics on transactional data (HTAP)' },
    ],
  },
];

// Question IDs that matter most for early recommendation
export const coreQuestionIds = ['current_db', 'biggest_pain', 'workload_type', 'db_size', 'qps', 'cloud_preference', 'availability', 'budget'];

// ── Evaluation Engine ──

export function evaluateAssessment(answers) {
  let score = 50; // start neutral — pain signals and advantages earn the score up
  let tier = 'essential'; // default
  const fitReasons = [];
  const warnings = [];
  const advantages = [];
  const validationChecklist = [];
  const deploymentNotes = [];
  let compatibilityWorkshop = false;
  let alternativeCategory = null;
  let nextBestStep = 'Performance & Operations PoC';

  const dbSize = answers.db_size;
  const budget = answers.budget;
  const qps = answers.qps;
  const compliance = answers.compliance || [];
  const securityNeeds = answers.security_needs || [];
  const advancedFeatures = answers.advanced_features || [];
  const migrationBlockers = answers.migration_blockers || [];
  const cloudPref = answers.cloud_preference;
  const workloadType = answers.workload_type;
  const growth = answers.growth;
  const biggestPain = answers.biggest_pain;
  const architecture = answers.architecture_today;
  const restorePain = answers.restore_pain;
  const searchReqs = answers.search_requirements;
  const multiTenant = answers.multi_tenant;

  // ═══════════════════════════════════════════
  // PAIN-WEIGHTED SCORING
  // ═══════════════════════════════════════════

  // ── Pain signals that TiDB solves well → boost score ──

  if (biggestPain === 'scaling_writes') {
    score += 18;
    advantages.push('TiDB distributes writes across TiKV nodes automatically — no manual sharding needed to remove write bottlenecks.');
  }
  if (biggestPain === 'sharding_complexity') {
    score += 20;
    advantages.push('TiDB eliminates manual sharding entirely — it auto-splits and auto-balances data across nodes while supporting cross-shard transactions.');
  }
  if (biggestPain === 'availability') {
    score += 12;
    advantages.push('TiDB uses Raft consensus for automatic failover with zero data loss — no manual intervention during node failures.');
  }
  if (biggestPain === 'analytics_gap') {
    score += 15;
    advantages.push('TiDB\'s TiFlash columnar engine runs real-time analytics directly on transactional data — no ETL pipeline or separate warehouse needed.');
  }
  if (biggestPain === 'operational') {
    score += 10;
    advantages.push('TiDB Cloud manages scaling, patching, backups, and monitoring — significantly reducing DBA toil.');
  }
  if (biggestPain === 'cost') {
    score += 5;
    advantages.push('TiDB Cloud\'s usage-based pricing and auto-scaling can reduce costs compared to overprovisioned databases. Run a cost comparison to verify.');
    validationChecklist.push('Run a side-by-side cost comparison for your workload before committing.');
  }
  if (biggestPain === 'scaling_reads') {
    score += 8;
    advantages.push('TiDB can scale reads by adding TiKV replicas, and TiFlash handles analytical read offloading. For cache-miss patterns, validate latency in a PoC.');
    validationChecklist.push('Benchmark read latency on your hottest queries — TiDB is fast but not a cache replacement.');
  }
  if (biggestPain === 'none') {
    // No pain = exploring, don't boost much
    score += 2;
  }

  // ── Architecture signals ──

  if (architecture === 'sharded') {
    score += 10;
    advantages.push('Moving from manually-sharded architecture to TiDB eliminates cross-shard complexity and simplifies your application layer.');
  }
  if (architecture === 'single' && growth === 'fast') {
    score += 8;
    advantages.push('You\'re on a single instance with fast growth ahead — TiDB lets you scale horizontally without re-architecting later.');
  }

  // ── Workload fit ──

  if (workloadType === 'htap' || advancedFeatures.includes('htap')) {
    score += 12;
    advantages.push('TiDB\'s HTAP architecture with TiFlash columnar engine lets you run real-time analytics without impacting transactions — a key differentiator.');
  }
  if (workloadType === 'oltp') {
    score += 5;
    advantages.push('TiDB is built for OLTP — MySQL-compatible SQL with distributed transactions and horizontal scaling.');
  }

  // ── Growth signal ──

  if (growth === 'fast') {
    score += 6;
    advantages.push('TiDB\'s horizontal scaling means you can grow without re-architecting — just add nodes.');
  } else if (growth === 'moderate') {
    score += 3;
  }

  // ── Scale signals ──

  if (dbSize === 'xlarge' || dbSize === 'massive') {
    score += 5;
    advantages.push('TiDB excels at large-scale data with automatic sharding — no manual sharding needed as you grow.');
  }
  if (qps === 'high' || qps === 'very_high') {
    score += 3;
    advantages.push('TiDB scales QPS linearly by adding nodes — ideal for high-throughput workloads.');
  }

  // ── MySQL compatibility bonus ──

  if (answers.current_db === 'mysql' || answers.current_db === 'aurora') {
    score += 8;
    advantages.push('TiDB is MySQL-compatible — migration from ' + (answers.current_db === 'mysql' ? 'MySQL' : 'Aurora') + ' is straightforward with minimal code changes.');
    nextBestStep = 'Migration Feasibility Check';
  }

  // ── HA bonus ──

  if (answers.availability === 'high' || answers.availability === 'ultra') {
    advantages.push('TiDB provides multi-AZ deployment with Raft consensus for automatic failover and high availability.');
  }

  // ── Search capabilities ──

  if (searchReqs === 'vector' || searchReqs === 'both') {
    advantages.push('TiDB supports vector search for AI-powered similarity search and RAG pipelines alongside your transactional data.');
  }
  if (searchReqs === 'fulltext' || searchReqs === 'both') {
    validationChecklist.push('TiDB full-text search is rolling out — verify current availability for your tier and version.');
  }

  // ── Backup/restore ──

  if (restorePain === 'worried' || restorePain === 'none') {
    score += 4;
    advantages.push('TiDB Cloud provides automated backups with point-in-time recovery (PITR) — restoring to any second within the retention window.');
    validationChecklist.push('Test a PITR restore during your PoC to validate RTO meets your requirements.');
  }

  // ── CDC ──

  if (advancedFeatures.includes('cdc')) {
    advantages.push('TiCDC provides real-time change data capture to Kafka, S3, and downstream databases.');
  }

  // ═══════════════════════════════════════════
  // DEDUCTIONS — poor fit signals
  // ═══════════════════════════════════════════

  // Pure KV workload
  if (workloadType === 'kv') {
    score -= 25;
    warnings.push('For pure key-value workloads, a dedicated KV store (Redis, DynamoDB, ScyllaDB) is usually more cost-effective. TiDB can handle KV patterns but is optimized for SQL workloads.');
    alternativeCategory = 'key-value';
  }

  // Pure OLAP workload
  if (workloadType === 'olap') {
    score -= 15;
    warnings.push('For pure analytical workloads, a dedicated data warehouse (BigQuery, Snowflake, ClickHouse) may be more efficient. TiDB shines when you need analytics alongside transactions (HTAP).');
    alternativeCategory = 'analytical';
  }

  // Heavy migration blockers
  if (migrationBlockers.includes('stored_procedures') || migrationBlockers.includes('triggers') || migrationBlockers.includes('pl_extensions')) {
    if (answers.can_refactor === 'no') {
      score -= 35;
      warnings.push('TiDB does not support stored procedures, triggers, or PL extensions. Since these cannot be refactored, migration would be extremely difficult.');
      compatibilityWorkshop = true;
      validationChecklist.push('Schedule a compatibility workshop to evaluate stored procedure/trigger migration path.');
    } else if (answers.can_refactor === 'partial') {
      score -= 12;
      warnings.push('Some of your database logic (stored procedures, triggers, or extensions) will need to be moved to application code. Plan for migration effort.');
      compatibilityWorkshop = true;
      validationChecklist.push('Inventory all stored procedures and triggers — estimate refactoring effort before committing.');
    } else if (answers.can_refactor === 'yes') {
      score -= 3;
      fitReasons.push('Your team can refactor stored procedures/triggers to application code — this is the standard approach for TiDB migrations.');
    }
  }

  // Foreign key dependency
  if (migrationBlockers.includes('foreign_keys')) {
    score -= 5;
    warnings.push('TiDB has foreign key support (GA since v7.6), but behavior may differ from your current database. Test your schema during a PoC.');
    validationChecklist.push('Test foreign key behavior with your schema in a TiDB PoC environment.');
  }

  // NoSQL migration
  if (answers.current_db === 'mongodb' || answers.current_db === 'dynamodb') {
    score -= 10;
    warnings.push('Migrating from a NoSQL database requires rethinking your data model for SQL/relational access patterns. Evaluate whether your application actually needs SQL and transactions.');
    if (answers.current_db === 'mongodb') {
      alternativeCategory = alternativeCategory || 'document-db';
    }
    nextBestStep = 'Architecture Workshop';
  }

  // Oracle / SQL Server migration complexity
  if (answers.current_db === 'oracle' || answers.current_db === 'sqlserver') {
    score -= 5;
    const dbName = answers.current_db === 'oracle' ? 'Oracle' : 'SQL Server';
    warnings.push('Migrating from ' + dbName + ' usually requires deeper schema conversion and procedural logic validation than MySQL-family migrations.');
    validationChecklist.push('Run TiDB\'s schema compatibility check against your ' + dbName + ' schema before starting migration.');
    nextBestStep = 'Migration Feasibility Check';
  }

  // PostgreSQL with procedural extensions
  if (answers.current_db === 'postgresql' && migrationBlockers.includes('pl_extensions')) {
    score -= 10;
    warnings.push('TiDB is MySQL-compatible, not PostgreSQL-compatible. PL/pgSQL extensions will need significant rewriting.');
    compatibilityWorkshop = true;
  }

  // PostgreSQL general
  if (answers.current_db === 'postgresql' && !migrationBlockers.includes('pl_extensions')) {
    score -= 3;
    warnings.push('TiDB uses MySQL-compatible SQL. PostgreSQL-specific syntax and features will need review during migration.');
    validationChecklist.push('Audit your SQL queries for PostgreSQL-specific syntax that may need conversion.');
  }

  // Multi-tenant with DB-per-tenant at scale
  if (multiTenant === 'db_per_tenant' && (dbSize === 'xlarge' || dbSize === 'massive')) {
    validationChecklist.push('Database-per-tenant at scale may require careful resource control configuration — discuss with TiDB solutions team.');
  }
  if (multiTenant === 'shared_schema') {
    advantages.push('TiDB\'s Resource Control feature enables workload isolation between tenants sharing the same cluster.');
  }

  // ═══════════════════════════════════════════
  // TIER DETERMINATION
  // ═══════════════════════════════════════════

  // Self-managed: on-premises
  if (cloudPref === 'onprem') {
    tier = 'selfmanaged';
    deploymentNotes.push('On-premises deployment requires TiDB Self-Managed with TiDB Operator on Kubernetes.');
  }
  // Dedicated: security/compliance/scale triggers
  else if (securityNeeds.includes('cmek')) {
    tier = 'dedicated';
    deploymentNotes.push('Customer-managed encryption keys (CMEK) require TiDB Cloud Dedicated.');
  } else if (securityNeeds.includes('vpc_peering')) {
    tier = 'dedicated';
    deploymentNotes.push('VPC peering with dedicated network isolation requires TiDB Cloud Dedicated.');
  } else if (compliance.includes('pci') || compliance.includes('hipaa')) {
    tier = 'dedicated';
    deploymentNotes.push('PCI-DSS and HIPAA compliance are best met with TiDB Cloud Dedicated\'s security controls.');
  } else if (advancedFeatures.includes('multi_region')) {
    tier = 'dedicated';
    deploymentNotes.push('Cross-region replication and disaster recovery require TiDB Cloud Dedicated.');
  } else if (answers.availability === 'ultra') {
    tier = 'dedicated';
    deploymentNotes.push('Near-zero downtime SLAs require TiDB Cloud Dedicated with multi-AZ and cross-region capabilities.');
  } else if (dbSize === 'massive' || budget === 'enterprise') {
    tier = 'dedicated';
    deploymentNotes.push('Enterprise-scale workloads benefit from TiDB Cloud Dedicated\'s dedicated compute and advanced features.');
  } else if (dbSize === 'xlarge' && (qps === 'high' || qps === 'very_high')) {
    tier = 'dedicated';
    deploymentNotes.push('Large data volume combined with high throughput is best served by TiDB Cloud Dedicated.');
  }
  // BYOC: enterprise who want cloud + control
  else if (budget === 'enterprise' && cloudPref !== 'onprem' && (securityNeeds.includes('cmek') || securityNeeds.includes('vpc_peering') || compliance.includes('hipaa'))) {
    tier = 'byoc';
    deploymentNotes.push('TiDB Cloud BYOC (Bring Your Own Cloud) runs in your cloud account for maximum control with managed operations.');
  }
  // Starter: small/free workloads
  else if ((budget === 'free' || budget === 'small') && (dbSize === 'small' || dbSize === 'medium')) {
    tier = 'starter';
    deploymentNotes.push('TiDB Cloud Starter includes free tier with 5 GiB storage and 50M Request Units/month — great for getting started.');
    // But check if they need features that push them to Essential
    if (advancedFeatures.includes('pitr')) {
      tier = 'essential';
      deploymentNotes.push('Point-in-time recovery is not available on Starter — upgrading recommendation to Essential.');
    }
    if (advancedFeatures.includes('cdc')) {
      tier = 'essential';
      deploymentNotes.push('Change data capture requires Essential or above.');
    }
    if (securityNeeds.includes('audit')) {
      tier = 'essential';
      deploymentNotes.push('Database audit logging is not available on Starter — Essential or above is needed.');
    }
  }
  // Essential: default for production
  else {
    tier = 'essential';
    deploymentNotes.push('TiDB Cloud Essential provides the right balance of features, autoscaling compute, and cost for your workload.');
  }

  // HTAP on heavy workloads → push to Dedicated
  if ((workloadType === 'htap' || advancedFeatures.includes('htap')) &&
      (dbSize === 'xlarge' || dbSize === 'massive' || qps === 'very_high') &&
      tier !== 'selfmanaged' && tier !== 'dedicated' && tier !== 'byoc') {
    tier = 'dedicated';
    deploymentNotes.push('Heavy HTAP workloads with large data or very high throughput are best served by Dedicated with dedicated TiFlash capacity.');
  }

  // Private endpoint note
  if (securityNeeds.includes('private_endpoint') && (tier === 'starter' || tier === 'essential')) {
    deploymentNotes.push('Private endpoint connectivity is supported on Starter and Essential — no need to upgrade to Dedicated for this.');
  }

  // Audit logging on Starter
  if (securityNeeds.includes('audit') && tier === 'starter') {
    tier = 'essential';
    deploymentNotes.push('Database audit logging requires Essential or above.');
  }

  // Azure availability
  if (cloudPref === 'azure' && tier !== 'selfmanaged') {
    if (tier === 'starter' || tier === 'essential') {
      tier = 'dedicated';
      deploymentNotes.push('Azure is currently supported on TiDB Cloud Dedicated. Starter and Essential are available on AWS.');
    }
  }

  // GCP availability
  if (cloudPref === 'gcp' && tier === 'starter') {
    deploymentNotes.push('Starter is available on AWS and Alibaba Cloud. For GCP, consider Essential or Dedicated.');
    tier = 'essential';
  }

  // Multi-cloud
  if (cloudPref === 'multi' && tier !== 'selfmanaged') {
    if (tier !== 'dedicated' && tier !== 'byoc') {
      tier = 'dedicated';
      deploymentNotes.push('Multi-cloud deployments require Dedicated or Self-Managed for cross-provider flexibility.');
    }
  }

  // BYOC push: enterprise with strong control needs on cloud
  if (budget === 'enterprise' && tier === 'dedicated' && cloudPref !== 'onprem' &&
      (securityNeeds.includes('cmek') || compliance.includes('hipaa') || compliance.includes('pci'))) {
    tier = 'byoc';
    deploymentNotes.push('Consider TiDB Cloud BYOC — runs in your own cloud account for maximum data residency and security control with fully managed operations.');
  }

  // ═══════════════════════════════════════════
  // NEXT BEST STEP
  // ═══════════════════════════════════════════

  if (compatibilityWorkshop) {
    nextBestStep = 'Compatibility Workshop';
  } else if (workloadType === 'htap' || biggestPain === 'analytics_gap') {
    nextBestStep = 'HTAP Proof of Value';
  } else if (answers.current_db === 'mongodb' || answers.current_db === 'dynamodb') {
    nextBestStep = 'Architecture Workshop';
  } else if (answers.current_db === 'mysql' || answers.current_db === 'aurora' || answers.current_db === 'oracle' || answers.current_db === 'sqlserver') {
    nextBestStep = 'Migration Feasibility Check';
  }

  // ═══════════════════════════════════════════
  // TIER EXPLANATION
  // ═══════════════════════════════════════════

  const tierExplanation = buildTierExplanation(tier, answers);

  // Cap score
  score = Math.max(0, Math.min(100, score));

  // Determine fit level
  let fitMessage;
  if (score < 30) {
    fitMessage = 'not_recommended';
  } else if (score < 50) {
    fitMessage = 'possible_with_effort';
  } else if (score < 70) {
    fitMessage = 'good_fit';
  } else {
    fitMessage = 'great_fit';
  }

  return {
    score,
    tier,
    fitReasons,
    warnings,
    advantages,
    validationChecklist,
    deploymentNotes,
    compatibilityWorkshop,
    alternativeCategory,
    nextBestStep,
    tierExplanation,
    isGoodFit: score >= 50,
    fitMessage,
    // Legacy compat
    reasons: deploymentNotes,
  };
}

function buildTierExplanation(tier, answers) {
  const parts = [];
  switch (tier) {
    case 'starter':
      parts.push('Your workload is small enough to start with the free tier.');
      if (answers.budget === 'free') parts.push('This matches your budget for development or prototyping.');
      break;
    case 'essential':
      parts.push('Essential provides production-grade reliability with auto-scaling compute.');
      if (answers.db_size === 'large') parts.push('Your data size is well-suited for Essential\'s capacity.');
      if (answers.growth === 'moderate') parts.push('Moderate growth is handled seamlessly by Essential\'s auto-scaling.');
      break;
    case 'dedicated':
      parts.push('Dedicated provides enterprise-grade isolation, compliance, and performance control.');
      if (answers.availability === 'ultra') parts.push('Near-zero downtime requires Dedicated\'s multi-AZ and cross-region capabilities.');
      if (answers.db_size === 'massive') parts.push('Your data volume benefits from dedicated compute resources.');
      break;
    case 'byoc':
      parts.push('BYOC gives you fully managed TiDB running in your own cloud account — maximum control with operational ease.');
      if (answers.compliance?.includes('hipaa')) parts.push('HIPAA compliance benefits from data staying in your own cloud infrastructure.');
      break;
    case 'selfmanaged':
      parts.push('Self-Managed gives you full control on your own infrastructure.');
      if (answers.cloud_preference === 'onprem') parts.push('On-premises deployment requires Self-Managed with TiDB Operator on Kubernetes.');
      break;
  }
  return parts.join(' ');
}

// ── Alternative category recommendations ──

export const alternativeRecommendations = {
  'key-value': {
    title: 'Consider a dedicated key-value store',
    description: 'For pure KV workloads, databases like Redis, DynamoDB, or ScyllaDB are often more cost-effective and lower-latency than a distributed SQL database.',
    databases: ['Redis', 'DynamoDB', 'ScyllaDB', 'Memcached'],
    caveat: 'If you also need SQL queries, transactions, or analytics alongside KV lookups, TiDB can handle both in one system.',
  },
  'analytical': {
    title: 'Consider a dedicated analytics engine',
    description: 'For pure OLAP workloads, data warehouses like BigQuery, Snowflake, or ClickHouse are purpose-built for analytical queries.',
    databases: ['BigQuery', 'Snowflake', 'ClickHouse', 'Redshift'],
    caveat: 'If you need analytics on live transactional data (HTAP), TiDB eliminates the need for a separate ETL pipeline.',
  },
  'document-db': {
    title: 'Is a document database the right fit?',
    description: 'If your data model is truly document-oriented with deep nesting, a document database may be more natural. However, if you need transactions across documents or relational queries, TiDB may be a better long-term choice.',
    databases: ['MongoDB', 'Firestore', 'Couchbase'],
    caveat: 'Many teams migrate from MongoDB to TiDB when they need stronger consistency, joins, or SQL compatibility.',
  },
};

export const tierDetails = {
  starter: {
    name: 'TiDB Cloud Starter',
    tagline: 'Perfect for development and small applications',
    price: 'From $0/month',
    color: '#10B981',
    features: [
      '5 GiB row + 5 GiB column storage free per cluster',
      '50M Request Units/month free per cluster',
      'Scales to zero when idle',
      'Pay-as-you-go after free limits',
      'Available on AWS and Alibaba Cloud',
    ],
    limitations: ['No PITR', 'No database audit logging', 'No VPC peering'],
  },
  essential: {
    name: 'TiDB Cloud Essential',
    tagline: 'For production workloads that need reliability',
    price: '~$20/day for small production',
    color: '#3B82F6',
    features: [
      'Autoscaling compute (up to 100K RCU)',
      'Point-in-time backup (30-day retention)',
      '99.99% availability with multi-zone',
      'Encrypted in transit and at rest',
      'Usage-based pricing',
    ],
    limitations: ['Fixed region', 'Shared infrastructure'],
  },
  dedicated: {
    name: 'TiDB Cloud Dedicated',
    tagline: 'Enterprise-grade with full control',
    price: 'From $1,376/month',
    color: '#8B5CF6',
    features: [
      'Dedicated compute (4–32 vCPU/node)',
      'PCI-DSS & SOC 2 Type II compliant',
      'Available on AWS, GCP, and Azure',
      'Advanced monitoring and diagnostics',
      'Dedicated support',
    ],
    limitations: [],
  },
  byoc: {
    name: 'TiDB Cloud BYOC',
    tagline: 'Managed TiDB in your own cloud account',
    price: 'Contact sales',
    color: '#EC4899',
    features: [
      'Runs in your AWS, GCP, or Azure account',
      'Full data residency and network control',
      'Managed operations — patching, scaling, backups',
      'Same TiDB Cloud console and APIs',
      'Enterprise compliance (HIPAA, PCI, SOC 2)',
    ],
    limitations: ['Requires enterprise agreement'],
  },
  selfmanaged: {
    name: 'TiDB Self-Managed',
    tagline: 'Full control on your own infrastructure',
    price: 'Contact sales',
    color: '#F59E0B',
    features: [
      'Multi-cloud and on-premises',
      'Kubernetes-native with TiDB Operator',
      'Full feature access',
      'Apache Spark, Kafka, Flink integration',
      'Community + Enterprise support options',
    ],
    limitations: ['Requires infrastructure management'],
  },
};

// ── Persona-specific result copy ──

export const personaCopy = {
  dev: {
    headline: 'For your development team',
    fitPrefix: 'From a developer experience perspective',
    ctaLabel: 'Try it — spin up a free cluster',
    ctaUrl: 'https://tidbcloud.com/free-trial',
  },
  dba: {
    headline: 'For your operations team',
    fitPrefix: 'From a database operations perspective',
    ctaLabel: 'See the operations features →',
    ctaUrl: 'https://docs.pingcap.com/tidbcloud/',
  },
  architect: {
    headline: 'For your architecture evaluation',
    fitPrefix: 'From a strategic architecture perspective',
    ctaLabel: 'Request an architecture review',
    ctaUrl: 'https://www.pingcap.com/contact-us/',
  },
  manager: {
    headline: 'For your project evaluation',
    fitPrefix: 'From a business perspective',
    ctaLabel: 'Talk to solutions team',
    ctaUrl: 'https://www.pingcap.com/contact-us/',
  },
};
