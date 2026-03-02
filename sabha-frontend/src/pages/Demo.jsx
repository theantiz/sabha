import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { createSession, triggerCouncil } from "../services/api.js";

const BOT_META = [
  { name: "Sutradhara", role: "Orchestrator", tone: "Lead", color: "text-[#8f3f31]" },
  { name: "Tarkika", role: "Critic", tone: "Skeptical", color: "text-[#5f3b29]" },
  { name: "Pramana", role: "Evidence", tone: "Analytical", color: "text-[#6b4a33]" },
  { name: "Sahachara", role: "Synthesizer", tone: "Integrative", color: "text-[#7a3b2f]" },
  { name: "Nirdeshaka", role: "Planner", tone: "Actionable", color: "text-[#8a5a2f]" },
];

const PHASE_HINTS = {
  Framing: "Defines the question and the criteria the debate should use.",
  Evidence: "Adds supporting evidence and examples to strengthen the case.",
  Counterpoint: "Challenges earlier claims and exposes weak assumptions.",
  Plan: "Turns the debate into a practical decision or rollout approach.",
  Synthesis: "Combines the strongest points into the final answer.",
};

const DISCUSSION = [
  {
    bot: "Sutradhara",
    phase: "Framing",
    body:
      "Define the goal: ship faster without lowering safety. Separate fast experiments from production releases.",
  },
  {
    bot: "Pramana",
    phase: "Evidence",
    body:
      "Evidence shows staged rollouts and red team reviews reduce incidents. Risk rises when evaluation is skipped.",
  },
  {
    bot: "Tarkika",
    phase: "Counterpoint",
    body:
      "Speed gains disappear if incidents cause rollbacks. Without guardrails, velocity becomes rework and reputation loss.",
  },
  {
    bot: "Nirdeshaka",
    phase: "Plan",
    body:
      "Use a two track system: a fast sandbox for iteration and a gated release pipeline. Require basic evals for each risk tier.",
  },
  {
    bot: "Sahachara",
    phase: "Synthesis",
    body:
      "Consensus: protect the critical path with tiered checks, and run experiments in contained environments.",
  },
];

export default function Demo() {
  const [topic, setTopic] = useState(
    "How should teams balance AI speed and safety when shipping new features?"
  );
  const [activeTopic, setActiveTopic] = useState(topic);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [consensus, setConsensus] = useState(
    "The council favors a two speed system: rapid iteration in contained sandboxes, and gated releases with mandatory evals and red team checks."
  );

  const bots = useMemo(() => BOT_META, []);
  const [discussion, setDiscussion] = useState([]);

  const handleStartDiscussion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveTopic(topic);

    try {
      // Create session
      const session = await createSession({
        title: "Sabha Demo Discussion",
        topic: topic.trim(),
      });
      setSessionId(session.id);

      // Trigger council
      const data = await triggerCouncil(session.id, { content: topic.trim() });
      
      // Extract agent messages and format for display
      const agentMessages = data.messages
        .filter(m => m.role === 'agent')
        .map(m => ({
          bot: m.agent_name,
          phase: m.phase.charAt(0).toUpperCase() + m.phase.slice(1),
          body: m.content
        }));

      setDiscussion(agentMessages);
      setConsensus(data.consensus || agentMessages[agentMessages.length - 1]?.body);

    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="sabha-heritage-bg text-sabhaText">
      <div className="sabha-stage">
        <div
          className="mx-auto max-w-[1120px] px-[var(--page-gutter)] pt-6 pb-10 sm:pt-7"
          style={{ "--page-gutter": "clamp(18px, 6vw, 140px)" }}
        >
          <Navbar />

          <main className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-7">
            <section className="space-y-4">
              <div className="sabha-manuscript-card sabha-border-frame sabha-reveal p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="sabha-title-panel">
                    <p className="text-[0.78rem] font-semibold tracking-[0.24em] text-sabhaMuted uppercase">
                      Live Assembly
                    </p>
                    <h1 className="text-3xl font-serif text-sabhaHeading sm:text-4xl">
                      Sabha Beta
                    </h1>
                  </div>
                  <span className="rounded-full border border-[rgba(139,62,47,.2)] bg-[rgba(255,245,232,.7)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sabhaAccent">
                    Multi-Bot Dialogue
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-sabhaMuted sm:text-[0.95rem]">
                  Provide a topic and watch the council deliberate across roles like critic,
                  evidence, synthesis, and planning.
                </p>

                <form
                  className="mt-4 space-y-3 sm:space-y-4"
                  onSubmit={handleStartDiscussion}
                >
                  <label className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
                    Topic
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={4}
                    disabled={loading}
                    className="w-full resize-none rounded-2xl border border-[rgba(130,92,57,.2)] bg-[#fcfbf8] px-4 py-3 text-sm leading-6 text-sabhaText shadow-[inset_0_1px_0_rgba(255,255,255,.8)] outline-none transition focus:border-[rgba(139,62,47,.5)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(139,62,47,.12)] disabled:opacity-50 sm:text-[0.95rem]"
                    placeholder="Enter a topic for the assembly..."
                  />
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={loading || !topic.trim()}
                      className="sabha-pillar-button px-4 py-[9px] text-[0.88rem] font-semibold transition active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? 'Council Deliberating...' : 'Start Discussion'}
                    </button>
                    <span className="text-[0.78rem] text-sabhaMuted">
                      {loading ? 'Running 5 agents (30-60s)...' : 'Live API connected ✓'}
                    </span>
                  </div>
                </form>
              </div>

              <div className="sabha-manuscript-card sabha-border-frame sabha-reveal p-4 sm:p-5" style={{ animationDelay: "140ms" }}>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                  Assembly Roles
                </p>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {bots.map((bot) => (
                    <div
                      key={bot.name}
                      className="rounded-2xl border border-[rgba(130,92,57,.16)] bg-[rgba(255,252,248,.9)] px-2.5 py-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-[0.76rem] font-semibold ${bot.color}`}>{bot.name}</p>
                        <span className="rounded-full border border-[rgba(139,62,47,.22)] bg-white px-1.5 py-[1px] text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-sabhaMuted">
                          {bot.tone}
                        </span>
                      </div>
                      <p className="mt-1 text-[0.66rem] text-sabhaMuted">{bot.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sabha-manuscript-card sabha-border-frame sabha-reveal p-4 sm:p-5" style={{ animationDelay: "220ms" }}>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                  Consensus Snapshot
                </p>
                <h3 className="mt-2 text-lg font-serif text-sabhaAccent">Shared outcome</h3>
                <p className="mt-2 text-sm leading-6 text-sabhaMuted sm:text-[0.95rem]">
                  {consensus}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Tiered Risk", "Sandbox First", "Red-Team Gate", "Audit Trail"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(139,62,47,.18)] bg-[rgba(255,244,227,.7)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sabhaAccent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="sabha-manuscript-card sabha-border-frame sabha-reveal p-4 sm:p-5" style={{ animationDelay: "160ms" }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="sabha-title-panel">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                    Transcript
                  </p>
                  <h2 className="mt-1 text-lg font-serif text-sabhaAccent">Topic Under Review</h2>
                </div>
                <div className="rounded-2xl border border-[rgba(139,62,47,.18)] bg-[rgba(255,245,232,.6)] px-3 py-2 text-[0.75rem] font-semibold text-sabhaAccent">
                  {activeTopic}
                </div>
              </div>

              <div className="sabha-scroll-list mt-4 sm:mt-5">
                {discussion.map((entry, index) => {
                  const meta = bots.find((bot) => bot.name === entry.bot);
                  return (
                    <div
                      key={`${entry.bot}-${index}`}
                      className="sabha-manuscript-card sabha-border-frame sabha-reveal p-4 sm:p-5"
                      style={{ animationDelay: `${index * 80 + 240}ms` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${meta?.color ?? "text-sabhaAccent"}`}>
                            {entry.bot}
                          </span>
                          <span className="rounded-full border border-[rgba(139,62,47,.2)] bg-white px-2 py-[2px] text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-sabhaMuted">
                            {entry.phase}
                          </span>
                        </div>
                        <span className="text-[0.7rem] text-sabhaMuted">Round {index + 1}</span>
                      </div>
                      
                      <div className="mt-3 rounded-2xl border border-[rgba(130,92,57,.1)] bg-[rgba(255,248,238,.72)] px-3 py-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-[0.7rem]">💭</span>
                          <div className="flex-1">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sabhaMuted mb-1">
                              Debate Move
                            </p>
                            <p className="text-sm leading-6 text-sabhaMuted">
                              {PHASE_HINTS[entry.phase] || "Adds a new turn to the council debate."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[rgba(130,92,57,.1)]">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-[0.7rem]">💡</span>
                          <div className="flex-1">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sabhaMuted mb-1">
                              Response
                            </p>
                            <p className="text-sm leading-6 text-sabhaText font-medium">{entry.body}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
