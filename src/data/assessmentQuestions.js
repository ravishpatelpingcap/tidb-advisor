export const assessmentQuestions = [
  {
    id: 'db_size',
    question: 'What is your current or expected database size?',
    type: 'select',
    options: [
      { value: 'small', label: 'Less than 5 GB', icon: 'S' },
      { value: 'medium', label: '5 GB - 100 GB', icon: 'M' },
      { value: 'large', label: '100 GB - 1 TB', icon: 'L' },
      { value: 'xlarge', label: '1 TB - 10 TB', icon: 'XL' },
      { value: 'massive', label: 'More than 10 TB', icon: 'XXL' },
    ],
  },
  {
    id: 'workload_type',
    question: 'What is your primary workload type?',
    type: 'select',
    options: [
      { value: 'oltp', label: 'Transactional (OLTP)', description: 'High-frequency reads and writes, short transactions' },
      { value: 'olap', label: 'Analytical (OLAP)', description: 'Complex queries, aggregations, reporting' },
      { value: 'htap', label: 'Both OLTP + OLAP (HTAP)', description: 'Real-time analytics on transactional data' },
      { value: 'kv', label: 'Simple Key-Value lookups', description: 'High throughput, simple reads/writes' },
    ],
  },
  {
    id: 'qps',
    question: 'What is your estimated queries per second (QPS)?',
    type: 'input',
    inputType: 'number',
    placeholder: 'e.g., 10000',
    unit: 'QPS',
    ranges: [
      { max: 1000, label: 'Low' },
      { max: 10000, label: 'Medium' },
      { max: 100000, label: 'High' },
      { max: Infinity, label: 'Very High' },
    ],
  },
  {
    id: 'write_ratio',
    question: 'What is your read vs write ratio?',
    type: 'select',
    options: [
      { value: 'read_heavy', label: 'Read-heavy (90% reads)', description: '~90% reads / ~10% writes' },
      { value: 'balanced', label: 'Balanced (60/40)', description: '~60% reads / ~40% writes' },
      { value: 'write_heavy', label: 'Write-heavy (60%+ writes)', description: 'More writes than reads' },
    ],
  },
  {
    id: 'instances',
    question: 'How many database instances/nodes do you currently run?',
    type: 'input',
    inputType: 'number',
    placeholder: 'e.g., 3',
    unit: 'instances',
  },
  {
    id: 'current_db',
    question: 'What database are you currently using?',
    type: 'select',
    options: [
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'oracle', label: 'Oracle' },
      { value: 'sqlserver', label: 'SQL Server' },
      { value: 'mongodb', label: 'MongoDB' },
      { value: 'aurora', label: 'Amazon Aurora' },
      { value: 'dynamodb', label: 'DynamoDB' },
      { value: 'other', label: 'Other / Starting Fresh' },
    ],
  },
  {
    id: 'stored_procedures',
    question: 'Do you use Stored Procedures?',
    type: 'select',
    options: [
      { value: 'none', label: 'No, we don\'t use them' },
      { value: 'few', label: 'Yes, a few simple ones' },
      { value: 'heavy', label: 'Yes, heavily (complex business logic)' },
    ],
  },
  {
    id: 'can_convert_sp',
    question: 'Can you convert stored procedures to application code?',
    type: 'select',
    condition: (answers) => answers.stored_procedures && answers.stored_procedures !== 'none',
    options: [
      { value: 'yes', label: 'Yes, we can migrate them to app code' },
      { value: 'partial', label: 'Some of them, not all' },
      { value: 'no', label: 'No, they are critical and cannot be changed' },
    ],
  },
  {
    id: 'triggers',
    question: 'Do you use database Triggers?',
    type: 'select',
    options: [
      { value: 'none', label: 'No triggers' },
      { value: 'few', label: 'A few simple triggers' },
      { value: 'heavy', label: 'Heavily dependent on triggers' },
    ],
  },
  {
    id: 'can_convert_triggers',
    question: 'Can you replace triggers with application-level logic?',
    type: 'select',
    condition: (answers) => answers.triggers && answers.triggers !== 'none',
    options: [
      { value: 'yes', label: 'Yes, we can handle it in the app layer' },
      { value: 'partial', label: 'Partially' },
      { value: 'no', label: 'No, triggers are essential' },
    ],
  },
  {
    id: 'foreign_keys',
    question: 'How critical are enforced Foreign Keys for your application?',
    type: 'select',
    options: [
      { value: 'not_needed', label: 'Not needed - app handles referential integrity' },
      { value: 'nice_to_have', label: 'Nice to have, but not critical' },
      { value: 'critical', label: 'Critical - must be enforced at DB level' },
    ],
  },
  {
    id: 'availability',
    question: 'What is your availability requirement?',
    type: 'select',
    options: [
      { value: 'standard', label: '99.9% (Standard)', description: '~8.7 hours downtime/year' },
      { value: 'high', label: '99.99% (High)', description: '~52 minutes downtime/year' },
      { value: 'ultra', label: '99.999% (Ultra-high)', description: '~5 minutes downtime/year' },
    ],
  },
  {
    id: 'pitr',
    question: 'Do you need Point-in-Time Recovery (PITR)?',
    type: 'select',
    options: [
      { value: 'no', label: 'No, regular backups are sufficient' },
      { value: 'nice', label: 'Nice to have' },
      { value: 'required', label: 'Yes, it\'s a mandatory requirement' },
    ],
  },
  {
    id: 'compliance',
    question: 'Do you have compliance requirements?',
    type: 'multiselect',
    options: [
      { value: 'none', label: 'None' },
      { value: 'soc2', label: 'SOC 2' },
      { value: 'pci', label: 'PCI-DSS' },
      { value: 'hipaa', label: 'HIPAA' },
      { value: 'gdpr', label: 'GDPR' },
    ],
  },
  {
    id: 'cloud_preference',
    question: 'What is your cloud preference?',
    type: 'select',
    options: [
      { value: 'aws', label: 'Amazon Web Services (AWS)' },
      { value: 'gcp', label: 'Google Cloud Platform (GCP)' },
      { value: 'azure', label: 'Microsoft Azure' },
      { value: 'multi', label: 'Multi-cloud' },
      { value: 'onprem', label: 'On-premises / Self-managed' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your approximate monthly database budget?',
    type: 'select',
    options: [
      { value: 'free', label: 'Free / Minimal ($0 - $50)', icon: '$' },
      { value: 'small', label: 'Small ($50 - $500)', icon: '$$' },
      { value: 'medium', label: 'Medium ($500 - $5,000)', icon: '$$$' },
      { value: 'large', label: 'Large ($5,000 - $50,000)', icon: '$$$$' },
      { value: 'enterprise', label: 'Enterprise ($50,000+)', icon: '$$$$$' },
    ],
  },
  {
    id: 'vector_search',
    question: 'Do you plan to use vector search or AI-powered features?',
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes, it\'s a core requirement', description: 'Vector search for embeddings, similarity search, RAG pipelines' },
      { value: 'nice_to_have', label: 'Nice to have but not critical', description: 'May explore AI features later' },
      { value: 'no', label: 'No', description: 'No vector or AI workloads planned' },
    ],
  },
  {
    id: 'multi_region',
    question: 'Do you need cross-region data replication?',
    type: 'select',
    options: [
      { value: 'disaster_recovery', label: 'Yes, for disaster recovery', description: 'Failover to another region if primary goes down' },
      { value: 'global_access', label: 'Yes, for low-latency global access', description: 'Serve users across multiple geographic regions' },
      { value: 'no', label: 'No, single region is fine', description: 'All users and services are in one region' },
    ],
  },
  {
    id: 'cdc',
    question: 'Do you need to stream data changes to other systems (Kafka, S3, etc.)?',
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes, real-time CDC is required', description: 'Stream changes via TiCDC to Kafka, S3, or downstream databases' },
      { value: 'nice_to_have', label: 'Nice to have', description: 'May need change data capture in the future' },
      { value: 'no', label: 'No', description: 'No need to stream data changes' },
    ],
  },
  {
    id: 'network_isolation',
    question: 'What level of network isolation do you need?',
    type: 'select',
    options: [
      { value: 'public', label: 'Public endpoint is fine', description: 'Standard TLS-encrypted public connection' },
      { value: 'private_endpoint', label: 'Private endpoint required', description: 'AWS PrivateLink or GCP Private Service Connect' },
      { value: 'vpc_peering', label: 'VPC peering / dedicated infrastructure required', description: 'Full network isolation with VPC peering' },
    ],
  },
  {
    id: 'encryption',
    question: 'Do you need dual-layer encryption (beyond standard at-rest encryption)?',
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes, required by policy', description: 'Customer-managed encryption keys (CMEK) or dual-layer encryption' },
      { value: 'no', label: 'No, standard encryption is sufficient', description: 'TLS in transit + AES-256 at rest' },
    ],
  },
  {
    id: 'htap_analytics',
    question: 'Do you need real-time analytics alongside transactional queries (HTAP)?',
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes, we need TiFlash columnar analytics', description: 'Run analytical queries without impacting OLTP performance' },
      { value: 'maybe', label: 'Maybe in the future', description: 'Not needed now but may add analytics later' },
      { value: 'no', label: 'No, purely transactional', description: 'Only OLTP workloads, no analytics needed' },
    ],
  },
];

export function evaluateAssessment(answers) {
  let score = 100;
  let tier = 'essential';
  let reasons = [];
  let warnings = [];
  let advantages = [];

  // Check dealbreakers
  if (answers.stored_procedures === 'heavy' && answers.can_convert_sp === 'no') {
    score -= 40;
    warnings.push('TiDB does not support stored procedures. Heavy reliance without ability to convert is a significant migration challenge.');
  }
  if (answers.triggers === 'heavy' && answers.can_convert_triggers === 'no') {
    score -= 40;
    warnings.push('TiDB does not support triggers. You\'ll need to move trigger logic to the application layer.');
  }
  if (answers.foreign_keys === 'critical') {
    score -= 15;
    warnings.push('TiDB has experimental foreign key support. If strict FK enforcement is critical, verify compatibility with your schema.');
  }
  if (answers.workload_type === 'kv') {
    score -= 10;
    warnings.push('For pure key-value workloads, a dedicated KV store (Redis, DynamoDB) may be more cost-effective. TiDB can handle KV patterns but is optimized for SQL workloads.');
  }

  // Check advantages
  if (answers.db_size === 'xlarge' || answers.db_size === 'massive') {
    score += 5;
    advantages.push('TiDB excels at large-scale data with automatic sharding and horizontal scaling - no manual sharding needed.');
  }
  if (answers.workload_type === 'htap') {
    score += 10;
    advantages.push('TiDB\'s HTAP architecture with TiFlash columnar engine is perfect for real-time analytics on transactional data.');
  }
  if (answers.current_db === 'mysql' || answers.current_db === 'aurora') {
    score += 5;
    advantages.push('TiDB is MySQL-compatible, making migration from ' + (answers.current_db === 'mysql' ? 'MySQL' : 'Aurora') + ' straightforward.');
  }
  if (parseInt(answers.qps) > 50000) {
    advantages.push('TiDB scales QPS linearly by adding TiDB server nodes - ideal for your high throughput needs.');
  }
  if (answers.availability === 'high' || answers.availability === 'ultra') {
    advantages.push('TiDB provides multi-AZ deployment with Multi-Raft consensus for high availability.');
  }

  // Stored proc / trigger conversion possible
  if (answers.stored_procedures === 'few' || answers.can_convert_sp === 'yes') {
    if (answers.stored_procedures !== 'none') {
      reasons.push('Your stored procedures can be migrated to application code.');
    }
  }
  if (answers.triggers === 'few' || answers.can_convert_triggers === 'yes') {
    if (answers.triggers !== 'none') {
      reasons.push('Your triggers can be replaced with application-level logic or TiCDC.');
    }
  }

  // Determine tier
  const dbSize = answers.db_size;
  const budget = answers.budget;
  const qps = parseInt(answers.qps) || 0;
  const compliance = answers.compliance || [];
  const pitr = answers.pitr;
  const availability = answers.availability;
  const cloudPref = answers.cloud_preference;

  if (budget === 'free' && dbSize === 'small') {
    tier = 'starter';
    reasons.push('TiDB Cloud Starter is perfect for small workloads with a free tier including 25 GiB storage and 250M Request Units.');
  } else if (budget === 'free' || budget === 'small') {
    if (dbSize === 'small' || dbSize === 'medium') {
      tier = 'starter';
      reasons.push('TiDB Cloud Starter offers generous free tier with pay-as-you-go scaling.');
    } else {
      tier = 'essential';
      reasons.push('TiDB Cloud Essential provides autoscaling compute for growing workloads at predictable costs.');
    }
  } else if (cloudPref === 'onprem') {
    tier = 'selfmanaged';
    reasons.push('For on-premises deployment, TiDB Self-Managed gives you full control with Kubernetes support.');
  } else if (compliance.includes('pci') || compliance.includes('hipaa')) {
    tier = 'dedicated';
    reasons.push('PCI-DSS and HIPAA compliance requirements are best met with TiDB Cloud Dedicated.');
  } else if (dbSize === 'massive' || budget === 'enterprise') {
    tier = 'dedicated';
    reasons.push('For enterprise-scale workloads, TiDB Cloud Dedicated provides dedicated resources and advanced features.');
  } else if (availability === 'ultra' || dbSize === 'xlarge') {
    tier = 'dedicated';
    reasons.push('Ultra-high availability and large-scale requirements are best served by TiDB Cloud Dedicated.');
  } else if (pitr === 'required' && tier === 'starter') {
    tier = 'essential';
    reasons.push('PITR requirement moves you to Essential tier which includes 30-day point-in-time backup retention.');
  } else if (dbSize === 'large' || budget === 'medium' || budget === 'large') {
    tier = 'essential';
    reasons.push('TiDB Cloud Essential provides the right balance of features, performance, and cost for your workload.');
  }

  // PITR check
  if (pitr === 'required' && tier === 'starter') {
    tier = 'essential';
    warnings.push('Starter tier does not include PITR. Upgrading recommendation to Essential.');
  }

  // Vector search scoring
  if (answers.vector_search === 'yes') {
    advantages.push('TiDB supports vector search (public preview) for AI-powered similarity search and RAG pipelines.');
    if (tier === 'starter') {
      tier = 'essential';
      reasons.push('Vector search capabilities require Essential tier or above.');
    }
  }

  // Multi-region scoring
  if (answers.multi_region === 'disaster_recovery' || answers.multi_region === 'global_access') {
    if (tier !== 'selfmanaged') {
      tier = 'dedicated';
      reasons.push('Cross-region replication requires TiDB Cloud Dedicated or Self-Managed deployment.');
    }
    if (answers.multi_region === 'global_access') {
      advantages.push('TiDB supports geo-distributed replicas for low-latency global access.');
    } else {
      advantages.push('TiDB supports cross-region disaster recovery with automatic failover.');
    }
  }

  // CDC scoring
  if (answers.cdc === 'yes') {
    advantages.push('TiCDC provides real-time change data capture to Kafka, S3, and downstream databases.');
    if (tier === 'starter') {
      tier = 'essential';
      reasons.push('Real-time CDC via TiCDC is available on Essential tier and above.');
    }
  }

  // Network isolation scoring
  if (answers.network_isolation === 'vpc_peering') {
    if (tier !== 'selfmanaged') {
      tier = 'dedicated';
      reasons.push('VPC peering and dedicated network infrastructure require TiDB Cloud Dedicated.');
    }
  } else if (answers.network_isolation === 'private_endpoint') {
    if (tier === 'starter') {
      tier = 'essential';
      reasons.push('Private endpoints (AWS PrivateLink / GCP Private Service Connect) require Essential tier or above.');
    }
  }

  // Encryption scoring
  if (answers.encryption === 'yes') {
    if (tier === 'starter') {
      tier = 'essential';
      reasons.push('Dual-layer encryption and customer-managed keys require Essential tier or above.');
    }
    advantages.push('TiDB Cloud supports enhanced encryption options for stricter security policies.');
  }

  // HTAP / TiFlash analytics scoring
  if (answers.htap_analytics === 'yes') {
    advantages.push('TiFlash columnar engine enables real-time analytics without impacting transactional performance.');
    if (tier === 'starter' || tier === 'essential') {
      tier = 'dedicated';
      reasons.push('Dedicated TiFlash nodes for HTAP analytics are best served by TiDB Cloud Dedicated.');
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    tier,
    reasons,
    warnings,
    advantages,
    isGoodFit: score >= 60,
  };
}

export const tierDetails = {
  starter: {
    name: 'TiDB Cloud Starter',
    tagline: 'Perfect for development and small applications',
    price: 'From $0/month',
    color: '#10B981',
    features: [
      '25 GiB row + 25 GiB column storage free',
      '250M Request Units/month free',
      'Scale to zero when idle',
      'Pay-as-you-go after free limits',
      'Available on AWS',
    ],
    limitations: ['No PITR', 'Limited compute', 'Single availability zone'],
  },
  essential: {
    name: 'TiDB Cloud Essential',
    tagline: 'For production workloads that need reliability',
    price: '~$20/day for small production',
    color: '#3B82F6',
    features: [
      'Autoscaling compute (up to 100K RU)',
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
      'Dedicated compute (4-32 vCPU/node)',
      'PCI-DSS & SOC 2 Type II compliant',
      'Available on AWS, GCP, and Azure',
      'Advanced monitoring and diagnostics',
      'Dedicated support',
    ],
    limitations: [],
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
