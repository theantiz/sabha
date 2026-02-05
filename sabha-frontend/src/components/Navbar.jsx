import React, { useState } from "react";

const navLinks = [
  ["#about", "About"],
  ["#architecture", "Architecture"],
  ["#use-cases", "Use Cases"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto mb-9 flex max-w-[1120px] flex-col gap-3 rounded-2xl border border-[rgba(130,92,57,.22)] bg-[rgba(255,253,248,.88)] px-4 py-3 shadow-[0_12px_32px_rgba(75,43,20,.12),inset_0_1px_0_rgba(255,255,255,.5)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-full">
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
        <div className="flex items-center gap-2 text-[0.94rem] font-semibold tracking-[0.14em] uppercase">
          <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-sabhaGold bg-[radial-gradient(circle_at_30%_25%,#ffe5bb,#e7bf84)] font-dev text-[1.2rem] text-sabhaAccent shadow-[0_4px_14px_rgba(107,67,32,.25),inset_0_1px_2px_rgba(255,255,255,.6)] transition hover:scale-[1.08] hover:shadow-[0_6px_18px_rgba(107,67,32,.35),inset_0_1px_2px_rgba(255,255,255,.6)]">
            स
          </span>
          <span>Sabha</span>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <a
            href="#contact"
            className="rounded-full border border-[rgba(139,62,47,.40)] bg-[linear-gradient(135deg,rgba(255,242,226,.85),rgba(255,235,205,.80))] px-3 py-[7px] text-[0.82rem] font-semibold text-sabhaAccent shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_2px_8px_rgba(139,62,47,.1)] transition hover:shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_4px_12px_rgba(139,62,47,.15)]"
          >
            Join
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full border border-[rgba(139,62,47,.30)] bg-white/80 px-3 py-[7px] text-[0.82rem] font-semibold text-sabhaAccent shadow-[inset_0_1px_0_rgba(255,255,255,.4)]"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <nav className="hidden items-center gap-2 sm:flex">
        {navLinks.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full px-3 py-[7px] text-[0.88rem] font-semibold text-sabhaMuted transition hover:-translate-y-[1px] hover:border hover:border-[rgba(139,62,47,.30)] hover:bg-[rgba(255,246,233,.95)] hover:text-sabhaAccent"
          >
            {label}
          </a>
        ))}

        <a
          href="#contact"
          className="rounded-full border border-[rgba(139,62,47,.40)] bg-[linear-gradient(135deg,rgba(255,242,226,.85),rgba(255,235,205,.80))] px-3 py-[7px] text-[0.88rem] font-semibold text-sabhaAccent shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_2px_8px_rgba(139,62,47,.1)] transition hover:shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_4px_12px_rgba(139,62,47,.15)]"
        >
          Join the Assembly
        </a>
      </nav>

      {open ? (
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-[rgba(130,92,57,.22)] bg-[rgba(255,252,247,.96)] p-3 shadow-[0_16px_32px_rgba(75,43,20,.12)] sm:hidden">
          {navLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-2 text-[0.9rem] font-semibold text-sabhaMuted transition hover:bg-[rgba(255,246,233,.95)] hover:text-sabhaAccent"
            >
              {label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[rgba(139,62,47,.40)] bg-[linear-gradient(135deg,rgba(255,242,226,.85),rgba(255,235,205,.80))] px-3 py-2 text-[0.9rem] font-semibold text-sabhaAccent shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_2px_8px_rgba(139,62,47,.1)]"
          >
            Join the Assembly
          </a>
        </div>
      ) : null}
    </header>
  );
}
