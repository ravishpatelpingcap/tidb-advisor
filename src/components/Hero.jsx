export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-16" style={{ paddingTop: '140px' }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(0,82,217,0.10),_transparent_70%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(0,196,176,0.10),_transparent_72%)] blur-3xl" />
      </div>

      <div className="section-container relative text-center">
        <h1 className="hero-title mx-auto max-w-[820px]">
          Make the right{' '}
          <span className="gradient-text">database decision.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[540px] text-[1.1rem] leading-8 text-slate-500">
          Compare databases, assess workload fit, and estimate TiDB Cloud costs
          — all in one place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#compare"
            className="inline-flex items-center rounded-full bg-[#0f172a] px-7 py-3.5 text-[0.95rem] font-semibold text-white no-underline transition-transform hover:-translate-y-0.5"
          >
            Compare databases
          </a>
          <a
            href="#assessment"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[0.95rem] font-semibold text-slate-700 no-underline transition-transform hover:-translate-y-0.5"
          >
            Start assessment
          </a>
        </div>
      </div>
    </section>
  );
}
