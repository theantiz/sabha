import React from "react";
import Navbar from "../components/Navbar.jsx";

export default function Landing() {
  return (
    <div className="sabha-heritage-bg text-sabhaText">
      <div className="sabha-stage">
        <div
          className="mx-auto max-w-[1120px] px-[var(--page-gutter)] pt-7 pb-10"
          style={{ "--page-gutter": "clamp(18px, 6vw, 140px)" }}
        >
          <Navbar />

          <main className="mx-auto max-w-[1120px]">
          {/* hero */}
          <section className="grid items-center gap-8 border-b border-[rgba(130,92,57,.22)] pb-14 pt-2 md:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)]">
            <div className="sabha-reveal sabha-title-panel" style={{ animationDelay: "80ms" }}>
              <div className="sabha-ornament-line mb-4 text-[0.7rem]">सभा</div>
              <p className="mb-2 font-dev text-[0.96rem] tracking-[0.06em] text-sabhaAccent">
                सभायां युक्तिर्जायते ॥
              </p>

              <h1 className="mb-3 font-serif text-[clamp(2.4rem,5vw,3.35rem)] leading-[1.1]">
                Sabha – <span className="text-sabhaAccent">the AI Assembly</span>
              </h1>

              <p className="mb-4 max-w-[62ch] text-[1.03rem] leading-7 text-sabhaMuted">
                A modern digital assembly where models discuss, debate, and reason together.
                Orchestrate multiple LLMs, align perspectives, and reach clearer insight.
              </p>

              <div className="mb-4 flex flex-wrap gap-3">
                <button className="sabha-pillar-button px-4 py-[9px] text-[0.9rem] font-semibold transition">
                  अनुभव आरभ्यते (Start Now)
                </button>

                <a
                  href="/demo"
                  className="sabha-outline-button px-4 py-[9px] text-[0.9rem] font-semibold transition"
                >
                  दर्शन पश्य (View Demo)
                </a>
              </div>

              <p className="text-[0.87rem] text-[#8a6b56]">
                Inspired by the ancient tradition of collective deliberation, adapted for
                modern AI systems.
              </p>
            </div>

            {/* right panel */}
            <div
              className="sabha-hero-panel-traditional sabha-reveal p-5"
              style={{ animationDelay: "180ms" }}
            >
              <div className="mx-auto mb-4 flex aspect-square w-[min(270px,80vw)] items-center justify-center overflow-hidden rounded-full border border-[rgba(143,89,44,.6)] bg-[radial-gradient(circle_at_50%_42%,#fff8ea_0,#efd5ac_48%,#e4c18a_100%)] shadow-[inset_0_0_0_1px_rgba(255,245,227,.9),inset_0_8px_16px_rgba(255,255,255,.4),0_18px_40px_rgba(104,68,39,.28),0_0_40px_rgba(178,124,56,.12)] animate-gentlePulse relative">
                <div className="absolute inset-[13%] rounded-full border border-dashed border-[rgba(117,74,41,.36)] animate-slowSpin" />
                <div className="absolute inset-[25%] rounded-full border border-[rgba(139,62,47,.42)]" />

                <div className="z-[2] flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[rgba(124,75,38,.5)] bg-[radial-gradient(circle_at_35%_20%,#ffeecf,#efc88f)] font-dev text-[2.3rem] text-[#5b261e] shadow-[0_10px_16px_rgba(94,57,29,.24)]">
                  क
                </div>

                {[
                  ["विचार", "top-[10%] left-1/2 -translate-x-1/2"],
                  ["संवाद", "bottom-[13%] left-1/2 -translate-x-1/2"],
                  ["तर्क", "top-1/2 left-[4%] -translate-y-1/2"],
                  ["सम्मति", "top-1/2 right-[4%] -translate-y-1/2"],
                ].map(([t, pos]) => (
                  <div
                    key={t}
                    className={
                      "absolute z-[2] whitespace-nowrap rounded-full border border-[rgba(130,84,50,.34)] bg-[rgba(255,249,238,.95)] px-[10px] py-[3px] font-dev text-[0.74rem] text-[#6a4530] shadow-[0_6px_14px_rgba(102,67,37,.16)] " +
                      pos
                    }
                  >
                    {t}
                  </div>
                ))}
              </div>

              <div className="sabha-manuscript-card px-4 py-4">
                <p className="mb-1 font-bold text-sabhaAccent">Deliberative Reasoning Engine</p>
                <p className="leading-7 text-sabhaMuted">
                  Route prompts through a council of specialized models. Capture arguments,
                  counterpoints, and consensus with a clear trace.
                </p>
              </div>
            </div>
          </section>

          {/* sections */}
          <Section id="about" title="What is Sabha?" alt delay={220}>
            In Sanskrit, "Sabha" means an assembly for thoughtful discussion. This project
            brings that idea to AI systems.
            <Cards
              items={[
                ["Multi-Model Dialogue", "Orchestrate multiple models in structured dialogue. Each plays a role such as critic, explainer, planner, or judge."],
                ["Structured Reasoning", "Capture arguments as trees, not just text. Keep the reasoning trail visible, auditable, and reusable."],
                ["Consensus", "Define rules such as voting, weighted expertise, or human review. Converge without losing dissent."],
              ]}
            />
          </Section>

          <Section id="architecture" title="Architecture as यज्ञ" delay={280}>
            A layered design inspired by ritual stages: invocation, offering, deliberation,
            and resolution.
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ArchStep chip="आवाहनम् · Invocation" title="Orchestrator" body="Receives the user query, chooses participants, and sets the dialogue protocol." delay={0} />
              <ArchStep chip="अर्पणम् · Offering" title="Reasoning Ledger" body="Stores rationale, objections, and evidence in a structured ledger for replay and analysis." delay={80} />
              <ArchStep chip="सम्वादः · Dialogue" title="Council of Models" body="Models exchange messages, critique one another, and refine ideas in rounds." delay={160} />
              <ArchStep chip="संनिधानम् · Resolution" title="Consensus Engine" body="Applies consensus rules and aligns outcomes with safety and policy constraints." delay={240} />
            </div>
          </Section>

          <Section id="use-cases" title="Where Sabha Shines" alt delay={340}>
            Any area that benefits from multiple perspectives and careful reasoning.
            <Cards
              items={[
                ["AI Safety Reviews", "Run safety, policy, and red team models together. Capture disagreements and escalate edge cases to humans."],
                ["Research & Analysis", "Assemble domain experts who argue for or against ideas, then summarize the shared view."],
                ["Product Decisions", "Use models tuned for UX, engineering, legal, and business to explore tradeoffs before committing."],
              ]}
            />
          </Section>

          <Section id="contact" title="Form your own Sabha" footer delay={400}>
            Bring multi-model assemblies into your stack. Early collaborators, reach out:
            <form className="mt-5 max-w-[560px]" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-full border border-[rgba(130,92,57,.22)] bg-[rgba(255,252,247,.9)] px-4 py-[10px] text-[0.92rem] text-sabhaText outline-none placeholder:text-[#9e7d64] focus:border-[rgba(139,62,47,.6)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(139,62,47,.15),0_2px_8px_rgba(139,62,47,.1)]"
                />
                <button
                  className="rounded-full border border-[rgba(126,53,39,.6)] bg-[linear-gradient(145deg,#9d4835_0%,#7f3428_70%)] px-5 py-[10px] text-[0.92rem] font-semibold text-[#fff9f0] shadow-[0_10px_22px_rgba(101,43,31,.32),inset_0_1px_0_rgba(255,255,255,.2)] transition hover:-translate-y-0.5"
                  type="submit"
                >
                  Request Access
                </button>
              </div>
              <p className="mt-2 text-[0.83rem] text-sabhaMuted">
                We will share design notes, architecture diagrams, and early access.
              </p>
            </form>
          </Section>

          <footer className="pt-3 text-center text-[0.8rem] text-[#8b6d57] sabha-reveal" style={{ animationDelay: "520ms" }}>
            © {new Date().getFullYear()} Sabha · सभासदां बुद्धिसंग्रहः
          </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children, alt = false, footer = false, delay = 0 }) {
  return (
    <section
      id={id}
      className={[
        "sabha-section-band relative border-b border-[rgba(130,92,57,.22)] py-14 sabha-reveal",
        alt ? "bg-[rgba(255,248,238,.82)] -mx-[var(--page-gutter)] px-[var(--page-gutter)]" : "",
        footer ? "border-b-0 pb-5" : "",
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-5 max-w-[670px]">
        <h2 className="mb-1 text-[1.7rem] font-serif text-sabhaAccent">{title}</h2>
        <p className="leading-7 text-sabhaMuted">{children?.[0] ?? ""}</p>
      </div>

      <div>{children?.slice(1)}</div>
    </section>
  );
}

function Cards({ items }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      {items.map(([h, p], index) => (
        <div
          key={h}
          className="sabha-manuscript-card sabha-border-frame relative overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(82,51,25,.12)] sabha-reveal"
          style={{ animationDelay: `${index * 90 + 140}ms` }}
        >
          <h3 className="mb-1 text-[1.05rem] font-semibold text-sabhaAccent">{h}</h3>
          <p className="text-sabhaMuted">{p}</p>
        </div>
      ))}
    </div>
  );
}

function ArchStep({ chip, title, body, delay = 0 }) {
  return (
    <div
      className="sabha-manuscript-card sabha-border-frame p-4 sabha-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="inline-flex items-center rounded-full border border-[rgba(139,62,47,.32)] bg-[rgba(255,244,227,.72)] px-[10px] py-[3px] text-[0.7rem] font-bold tracking-[0.08em] text-[#7c3d2e] uppercase">
        {chip}
      </span>
      <h3 className="mt-2 mb-1 font-serif text-sabhaAccent">{title}</h3>
      <p className="text-sabhaMuted">{body}</p>
    </div>
  );
}
