import { useState } from 'react';
import Navigation from './components/Navigation';
import ComparisonTool from './components/ComparisonTool';
import FitAssessment from './components/FitAssessment';
import CostCalculator from './components/CostCalculator';
import Footer from './components/Footer';

const tools = [
  {
    id: 'compare',
    label: 'Compare Databases',
    description: 'Compare TiDB against MySQL, PostgreSQL, Aurora, and 25+ others across scalability, security, and AI features.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    id: 'assessment',
    label: 'Fit Assessment',
    description: 'Walk through your workload needs and get a personalized TiDB deployment recommendation — cloud or self-managed.',

    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" />
      </svg>
    ),
  },
  {
    id: 'pricing',
    label: 'Cost Calculator',
    description: 'Estimate monthly costs across Starter, Essential, Dedicated, Premium, BYOC, and Self-Managed tiers.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.66 0-3 1-3 2.5S10.34 13 12 13c1.66 0 3 1 3 2.5S13.66 18 12 18c-1 0-2-.5-2.5-1.5" />
        <path d="M12 6v1.5M12 16.5V18" />
      </svg>
    ),
  },
];

function Home({ onNavigate }) {
  return (
    <section className="home-section">
      <div className="home-container">
        <h1 className="home-title">
          TiAdvisor
        </h1>
        <p className="home-subtitle">
          Compare databases, find the right deployment, and estimate<br />
          costs for TiDB Cloud and Self-Managed — all in one place.
        </p>

        <div className="home-grid">
          {tools.map((tool, i) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => onNavigate(tool.id)}
              className="home-card"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="home-card-icon">
                {tool.icon}
              </div>
              <h2 className="home-card-title">{tool.label}</h2>
              <p className="home-card-desc">{tool.description}</p>
              <span className="home-card-cta">
                Get started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [pricingContext, setPricingContext] = useState(null);

  const navigateToPricing = (context) => {
    setPricingContext(context);
    setView('pricing');
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <Navigation onLogoClick={() => setView('home')} currentView={view} onNavigate={setView} />
      <main>
        {view === 'home' && <Home onNavigate={setView} />}
        {view === 'compare' && <ComparisonTool />}
        {view === 'assessment' && <FitAssessment onEstimateCosts={navigateToPricing} />}
        {view === 'pricing' && <CostCalculator initialContext={pricingContext} onContextConsumed={() => setPricingContext(null)} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
