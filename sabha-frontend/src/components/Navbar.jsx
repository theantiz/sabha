import React, { useState } from "react";

const navLinks = [
  ["/#about", "About"],
  ["/#architecture", "Architecture"],
  ["/#use-cases", "Use Cases"],
  ["/demo", "Demo"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sabha-manuscript-card sabha-border-frame mx-auto mb-9 flex max-w-[1120px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
        <div className="flex items-center gap-3 text-[0.94rem] font-semibold tracking-[0.14em] uppercase">
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-sabhaGold bg-[radial-gradient(circle_at_30%_25%,#fbe9bf,#ddb175)] font-dev text-[1.2rem] text-sabhaAccent shadow-[0_6px_16px_rgba(107,67,32,.28),inset_0_1px_2px_rgba(255,255,255,.6)] transition hover:scale-[1.04]">
            स
          </span>
          <div className="leading-tight">
            <div className="text-[0.72rem] font-dev tracking-[0.22em] text-sabhaAccent">सभासदां</div>
            <span className="font-serif text-[1.02rem] tracking-[0.12em] text-sabhaHeading">Sabha</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <a
            href="/#contact"
            className="sabha-outline-button px-3 py-[7px] text-[0.82rem] font-semibold"
          >
            Join
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full border border-[rgba(139,62,47,.30)] bg-[rgba(255,249,240,.92)] px-3 py-[7px] text-[0.82rem] font-semibold text-sabhaAccent shadow-[inset_0_1px_0_rgba(255,255,255,.55)]"
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
            className="rounded-full px-3 py-[7px] text-[0.88rem] font-semibold text-sabhaMuted transition hover:-translate-y-[1px] hover:bg-[rgba(255,246,233,.95)] hover:text-sabhaAccent"
          >
            {label}
          </a>
        ))}

        <a
          href="/#contact"
          className="sabha-outline-button px-3 py-[7px] text-[0.88rem] font-semibold"
        >
          Join the Assembly
        </a>
      </nav>

      {open ? (
        <div className="sabha-panel-strip flex w-full flex-col gap-2 rounded-2xl border border-[rgba(130,92,57,.22)] bg-[rgba(255,252,247,.96)] p-3 shadow-[0_16px_32px_rgba(75,43,20,.12)] sm:hidden">
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
            href="/#contact"
            onClick={() => setOpen(false)}
            className="sabha-outline-button px-3 py-2 text-[0.9rem] font-semibold"
          >
            Join the Assembly
          </a>
        </div>
      ) : null}
    </header>
  );
}
