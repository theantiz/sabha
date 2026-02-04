// src/App.jsx
import React from "react";
import "./App.css";

function App() {
  return (
    <div className="sabha-root">
      {/* Subtle pattern + overlay */}
      <div className="sabha-bg-overlay" />

      <header className="sabha-header">
        <div className="sabha-logo">
          <span className="sabha-logo-mark">स</span>
          <span className="sabha-logo-text">Sabha</span>
        </div>

        <nav className="sabha-nav">
          <a href="#about">About</a>
          <a href="#architecture">Architecture</a>
          <a href="#use-cases">Use Cases</a>
          <a href="#contact" className="sabha-nav-cta">
            Join the Assembly
          </a>
        </nav>
      </header>

      <main className="sabha-main">
        <section className="sabha-hero">
          <div className="sabha-hero-content">
            <p className="sabha-sanskrit-tagline">
              सभायां युक्तिर्जायते ॥
            </p>
            <h1>
              Sabha – <span className="sabha-highlight">the AI Assembly</span>
            </h1>
            <p className="sabha-hero-subtitle">
              A modern डिजिटल सभा where models discuss, debate, and reason
              like a council of thinkers. Orchestrate multiple LLMs, align perspectives,
              and converge on deeper, more trustworthy insight.
            </p>

            <div className="sabha-hero-actions">
              <button className="sabha-button primary">
                अनुभव आरभ्यते (Start Now)
              </button>
              <button className="sabha-button ghost">
                दर्शन पश्य (View Demo)
              </button>
            </div>

            <p className="sabha-hero-caption">
              Inspired by the ancient भारतीय सभासद् tradition of collective deliberation, 
              reimagined for autonomous AI systems.
            </p>
          </div>

          <div className="sabha-hero-panel">
            <div className="sabha-mandala">
              <div className="sabha-mandala-center">क</div>
              <div className="sabha-mandala-node n1">विचार</div>
              <div className="sabha-mandala-node n2">संवाद</div>
              <div className="sabha-mandala-node n3">तर्क</div>
              <div className="sabha-mandala-node n4">सम्मति</div>
            </div>
            <div className="sabha-hero-panel-card">
              <p className="sabha-panel-title">Deliberative Reasoning Engine</p>
              <p className="sabha-panel-body">
                Route prompts through a council of specialized models. Capture
                arguments, counter-arguments, and final consensus—fully traceable.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="sabha-section sabha-section-alt">
          <div className="sabha-section-header">
            <h2>What is Sabha?</h2>
            <p className="sabha-section-subtitle">
              In संस्कृत, “Sabha” denotes an assembly – a gathering for thoughtful
              discourse. This project brings that ethos to AI systems.
            </p>
          </div>

          <div className="sabha-grid-3">
            <div className="sabha-card">
              <h3>Multi‑Model संवाद</h3>
              <p>
                Orchestrate multiple foundation and specialized models in structured
                dialogue. Each plays a भूमिका (role): critic, explainer, planner, or judge.
              </p>
            </div>
            <div className="sabha-card">
              <h3>Structured तर्क</h3>
              <p>
                Capture arguments as trees, not just text. Sabha keeps the “reasoning
                trail” visible, auditable, and reusable across sessions.
              </p>
            </div>
            <div className="sabha-card">
              <h3>Consensus सम्मति</h3>
              <p>
                Define aggregation rules: voting, weighted expertise, or human‑in‑the‑loop. 
                Sabha helps models converge without losing dissenting views.
              </p>
            </div>
          </div>
        </section>

        <section id="architecture" className="sabha-section">
          <div className="sabha-section-header">
            <h2>Architecture as यज्ञ</h2>
            <p className="sabha-section-subtitle">
              A layered design inspired by traditional ritual: invocation, offering,
              deliberation, and resolution.
            </p>
          </div>

          <div className="sabha-arch-layout">
            <div className="sabha-arch-column">
              <div className="sabha-arch-step">
                <span className="sabha-chip">आवाहनम् · Invocation</span>
                <h3>Orchestrator</h3>
                <p>
                  Receives the user’s प्रश्न (query), chooses participants, and sets
                  the protocol for dialogue.
                </p>
              </div>
              <div className="sabha-arch-step">
                <span className="sabha-chip">सम्वादः · Dialogue</span>
                <h3>Council of Models</h3>
                <p>
                  Models exchange messages, critique one another, and refine
                  hypotheses in iterative rounds.
                </p>
              </div>
            </div>

            <div className="sabha-arch-column">
              <div className="sabha-arch-step">
                <span className="sabha-chip">अर्पणम् · Offering</span>
                <h3>Reasoning Ledger</h3>
                <p>
                  All rationales, objections, and supporting evidence are stored in a
                  structured ledger for replay and analysis.
                </p>
              </div>
              <div className="sabha-arch-step">
                <span className="sabha-chip">संनिधानम् · Resolution</span>
                <h3>Consensus Engine</h3>
                <p>
                  Applies consensus rules and aligns outcomes with safety,
                  policy, and domain constraints.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="use-cases" className="sabha-section sabha-section-alt">
          <div className="sabha-section-header">
            <h2>Where Sabha Shines</h2>
            <p className="sabha-section-subtitle">
              Any space that benefits from multiple perspectives and rigorous reasoning.
            </p>
          </div>

          <div className="sabha-grid-3">
            <div className="sabha-card">
              <h3>AI Safety Reviews</h3>
              <p>
                Run safety, policy, and red‑team models together. Capture disagreements
                and automatically escalate edge cases to humans.
              </p>
            </div>
            <div className="sabha-card">
              <h3>Research & Analysis</h3>
              <p>
                Assemble domain‑specific experts that argue for and against hypotheses,
                then summarize the distilled consensus.
              </p>
            </div>
            <div className="sabha-card">
              <h3>Product Decisions</h3>
              <p>
                Use models tuned for UX, engineering, legal, and business to explore
                trade‑offs before committing to a path.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="sabha-section sabha-footer-cta">
          <div className="sabha-section-header">
            <h2>Form your own Sabha</h2>
            <p className="sabha-section-subtitle">
              Bring multi‑model assemblies into your stack. Early collaborators, reach out:
            </p>
          </div>
          <form
            className="sabha-contact-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="sabha-contact-row">
              <input type="email" placeholder="your@email.com" />
              <button className="sabha-button primary" type="submit">
                Request Access
              </button>
            </div>
            <p className="sabha-contact-note">
              We’ll share design notes, architecture diagrams, and early alpha access.
            </p>
          </form>
        </section>
      </main>

      <footer className="sabha-footer">
        <span>© {new Date().getFullYear()} Sabha · सभासदां बुद्धिसंग्रहः</span>
      </footer>
    </div>
  );
}

export default App;
