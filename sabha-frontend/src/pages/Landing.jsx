import React from "react";
import Navbar from "../components/Navbar.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden text-sabhaText bg-[radial-gradient(circle_at_12%_20%,rgba(178,124,56,.18),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(139,62,47,.10),transparent_44%),linear-gradient(180deg,#fdf8ee_0%,#f7f0e2_54%,#f2e7d5_100%)]">
      {/* overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-35 bg-[radial-gradient(circle_at_15%_12%,rgba(178,124,56,.2)_0,transparent_30%),radial-gradient(circle_at_86%_80%,rgba(139,62,47,.14)_0,transparent_34%),linear-gradient(transparent_0,transparent_calc(100%_-_1px),rgba(123,84,53,.14)_calc(100%_-_1px))] [background-size:auto,auto,100%_28px]" />

      <div className="mx-auto max-w-[1120px] px-[min(12vw,48px)] pt-7 pb-10">
        <Navbar />

        <main className="mx-auto max-w-[1120px]">
          {/* hero */}
          <section className="grid items-center gap-8 border-b border-[rgba(130,92,57,.22)] pb-14 pt-2 md:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)]">
            <div>
              <p className="mb-2 font-dev text-[0.96rem] tracking-[0.06em] text-sabhaAccent">
                सभायां युक्तिर्जायते ॥
              </p>

              <h1 className="mb-3 font-serif text-[clamp(2.4rem,5vw,3.35rem)] leading-[1.1]">
                Sabha – <span className="text-sabhaAccent">the AI Assembly</span>
              </h1>

              <p className="mb-4 max-w-[62ch] text-[1.03rem] leading-7 text-sabhaMuted">
                A modern डिजिटल सभा where models discuss, debate, and reason like a council
                of thinkers. Orchestrate multiple LLMs, align perspectives, and converge on
                deeper, more trustworthy insight.
              </p>

              <div className="mb-3 flex flex-wrap gap-2">
                <button className="rounded-full border border-[rgba(126,53,39,.6)] bg-[linear-gradient(145deg,#9d4835_0%,#7f3428_70%)] px-4 py-[9px] text-[0.9rem] font-semibold text-[#fff9f0] shadow-[0_10px_22px_rgba(101,43,31,.32),inset_0_1px_0_rgba(255,255,255,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(101,43,31,.4),inset_0_1px_0_rgba(255,255,255,.2)] active:translate-y-0 active:shadow-[0_6px_16px_rgba(101,43,31,.32),inset_0_1px_0_rgba(255,255,255,.2)]">
                  अनुभव आरभ्यते (Start Now)
                </button>

                <button className="rounded-full border border-[rgba(130,92,57,.22)] bg-[rgba(255,252,246,.8)] px-4 py-[9px] text-[0.9rem] font-semibold text-sabhaMuted shadow-[inset_0_1px_0_rgba(255,255,255,.5)] transition hover:-translate-y-0.5 hover:border-[rgba(139,62,47,.5)] hover:bg-[linear-gradient(135deg,rgba(255,252,246,.95),rgba(255,247,232,.9))] hover:text-sabhaAccent hover:shadow-[0_6px_16px_rgba(82,51,25,.1),inset_0_1px_0_rgba(255,255,255,.5)]">
                  दर्शन पश्य (View Demo)
                </button>
              </div>

              <p className="text-[0.87rem] text-[#8a6b56]">
                Inspired by the ancient भारतीय सभासद् tradition of collective deliberation,
                reimagined for autonomous AI systems.
              </p>
            </div>

            {/* right panel */}
            <div className="rounded-3xl border border-[rgba(130,92,57,.22)] bg-[linear-gradient(160deg,rgba(255,247,232,.88),rgba(250,238,219,.68)),repeating-linear-gradient(45deg,rgba(120,80,48,.04),rgba(120,80,48,.04)_2px,rgba(255,255,255,0)_2px,rgba(255,255,255,0)_8px)] p-5 shadow-sabha">
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

              <div className="rounded-2xl border border-[rgba(130,84,50,.22)] bg-[rgba(255,252,247,.78)] p-4">
                <p className="mb-1 font-bold text-sabhaAccent">Deliberative Reasoning Engine</p>
                <p className="leading-7 text-sabhaMuted">
                  Route prompts through a council of specialized models. Capture arguments,
                  counter-arguments, and final consensus—fully traceable.
                </p>
              </div>
            </div>
          </section>

          {/* sections */}
          <Section id="about" title="What is Sabha?" alt>
            In संस्कृत, “Sabha” denotes an assembly – a gathering for thoughtful discourse.
            This project brings that ethos to AI systems.
            <Cards
              items={[
                ["Multi-Model संवाद", "Orchestrate multiple models in structured dialogue. Each plays a भूमिका (role): critic, explainer, planner, or judge."],
                ["Structured तर्क", "Capture arguments as trees, not just text. Keep the reasoning trail visible, auditable, and reusable."],
                ["Consensus सम्मति", "Define aggregation rules: voting, weighted expertise, or human-in-the-loop. Converge without losing dissent."],
              ]}
            />
          </Section>

          <Section id="architecture" title="Architecture as यज्ञ">
            A layered design inspired by traditional ritual: invocation, offering, deliberation,
            and resolution.
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ArchStep chip="आवाहनम् · Invocation" title="Orchestrator" body="Receives the user’s प्रश्न (query), chooses participants, and sets the protocol for dialogue." />
              <ArchStep chip="अर्पणम् · Offering" title="Reasoning Ledger" body="All rationales, objections, and supporting evidence are stored in a structured ledger for replay and analysis." />
              <ArchStep chip="सम्वादः · Dialogue" title="Council of Models" body="Models exchange messages, critique one another, and refine hypotheses in iterative rounds." />
              <ArchStep chip="संनिधानम् · Resolution" title="Consensus Engine" body="Applies consensus rules and aligns outcomes with safety, policy, and domain constraints." />
            </div>
          </Section>

          <Section id="use-cases" title="Where Sabha Shines" alt>
            Any space that benefits from multiple perspectives and rigorous reasoning.
            <Cards
              items={[
                ["AI Safety Reviews", "Run safety, policy, and red-team models together. Capture disagreements and escalate edge cases to humans."],
                ["Research & Analysis", "Assemble domain experts that argue for/against hypotheses, then summarize the distilled consensus."],
                ["Product Decisions", "Use models tuned for UX, engineering, legal, and business to explore trade-offs before committing."],
              ]}
            />
          </Section>

          <Section id="contact" title="Form your own Sabha" footer>
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
                We’ll share design notes, architecture diagrams, and early alpha access.
              </p>
            </form>
          </Section>

          <footer className="pt-3 text-center text-[0.8rem] text-[#8b6d57]">
            © {new Date().getFullYear()} Sabha · सभासदां बुद्धिसंग्रहः
          </footer>
        </main>
      </div>
    </div>
  );
}

function Section({ id, title, children, alt = false, footer = false }) {
  return (
    <section
      id={id}
      className={[
        "relative border-b border-[rgba(130,92,57,.22)] py-14 animate-fadeUp",
        alt ? "bg-[rgba(255,251,243,.6)] -mx-[6vw] px-[6vw]" : "",
        footer ? "border-b-0 pb-5" : "",
      ].join(" ")}
    >
      <div className="absolute right-[2px] top-2 text-[0.88rem] text-[rgba(139,62,47,.34)]">✶</div>

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
      {items.map(([h, p]) => (
        <div
          key={h}
          className="relative overflow-hidden rounded-2xl border border-[rgba(130,92,57,.22)] bg-[linear-gradient(135deg,rgba(255,253,248,.95),rgba(255,250,245,.85))] p-4 shadow-[0_10px_20px_rgba(82,51,25,.08),inset_0_1px_0_rgba(255,255,255,.4)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(82,51,25,.15),inset_0_1px_0_rgba(255,255,255,.4)]"
        >
          <h3 className="mb-1 text-[1.05rem] font-semibold text-sabhaAccent">{h}</h3>
          <p className="text-sabhaMuted">{p}</p>
        </div>
      ))}
    </div>
  );
}

function ArchStep({ chip, title, body }) {
  return (
    <div className="rounded-2xl border border-[rgba(130,92,57,.22)] bg-[radial-gradient(circle_at_top_right,rgba(178,124,56,.1),transparent_58%),rgba(255,253,248,.85)] p-4">
      <span className="inline-flex items-center rounded-full border border-[rgba(139,62,47,.32)] bg-[rgba(255,244,227,.72)] px-[10px] py-[3px] text-[0.7rem] font-bold tracking-[0.08em] text-[#7c3d2e] uppercase">
        {chip}
      </span>
      <h3 className="mt-2 mb-1 font-serif text-sabhaAccent">{title}</h3>
      <p className="text-sabhaMuted">{body}</p>
    </div>
  );
}
