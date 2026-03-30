export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <img
              src="/tidb-mark.svg"
              alt="TiDB"
              className="footer-logo-inline"
              style={{ height: '22px', width: '22px' }}
            />
            <span className="footer-brand-text">TiAdvisor</span>
          </div>

          <div className="footer-links">
            {[
              { label: 'Documentation', href: 'https://docs.pingcap.com' },
              { label: 'Cloud Pricing', href: 'https://www.pingcap.com/tidb-cloud-pricing/' },
              { label: 'TiDB Cloud', href: 'https://tidbcloud.com' },
              { label: 'PingCAP', href: 'https://www.pingcap.com' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-note">
            Pricing and feature data are directional. Validate with current PingCAP documentation.
          </p>
          <p className="footer-credit">
            © {new Date().getFullYear()} TiAdvisor · Built with AI
          </p>
        </div>
      </div>
    </footer>
  );
}
