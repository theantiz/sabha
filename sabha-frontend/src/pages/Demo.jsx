import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import RoundCard from "../components/RoundCard.jsx";
import { RoundSkeleton, LoadingDots } from "../components/LoadingSkeleton.jsx";
import { useDiscussion } from "../hooks/useDiscussion.js";

export default function Demo() {
  const {
    topic,
    setTopic,
    activeTopic,
    rounds,
    consensus,
    loading,
    submitting,
    error,
    status,
    botMeta,
    discussionId,
    voteTotals,
    startDiscussion,
    fetchRounds,
    pollNewRounds,
    checkStatus,
    reset,
    loadDefaultDemo,
    postUserMessage,
    voteMessage,
  } = useDiscussion();

  const [polling, setPolling] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [followedBots, setFollowedBots] = useState(new Set());
  const [followedSubs, setFollowedSubs] = useState(new Set());

  const discussionIdExists = () => {
    // Check if we have a valid discussion ID
    return typeof discussionId === 'string' || typeof discussionId === 'number';
  };

  // Poll for new rounds when status is running
  useEffect(() => {
    let interval;
    if (status === "running" && discussionIdExists()) {
      interval = setInterval(async () => {
        await pollNewRounds();
        const statusData = await checkStatus();
        if (statusData?.status === "completed") {
          clearInterval(interval);
          setPolling(false);
        }
      }, 5000);
      setPolling(true);
    }
    return () => {
      if (interval) clearInterval(interval);
      setPolling(false);
    };
  }, [status, pollNewRounds, checkStatus]);

  const handleStartDiscussion = async (e) => {
    e.preventDefault();
    await startDiscussion(topic);
  };

  const handleLoadMore = async () => {
    await fetchRounds();
  };

  const handleReset = () => {
    reset();
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await postUserMessage(commentText);
    setCommentText("");
  };

  const toggleFollowBot = (botName) => {
    setFollowedBots((prev) => {
      const next = new Set(prev);
      if (next.has(botName)) next.delete(botName);
      else next.add(botName);
      try {
        window.localStorage.setItem('sabha_followed_bots_v1', JSON.stringify([...next]));
      } catch (err) {
        console.error('[Demo] Failed to persist bot follows:', err);
      }
      return next;
    });
  };

  const toggleFollowSub = (sub) => {
    setFollowedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub);
      else next.add(sub);
      try {
        window.localStorage.setItem('sabha_followed_subs_v1', JSON.stringify([...next]));
      } catch (err) {
        console.error('[Demo] Failed to persist sub follows:', err);
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const storedBots = window.localStorage.getItem('sabha_followed_bots_v1');
      const storedSubs = window.localStorage.getItem('sabha_followed_subs_v1');
      if (storedBots) setFollowedBots(new Set(JSON.parse(storedBots)));
      if (storedSubs) setFollowedSubs(new Set(JSON.parse(storedSubs)));
    } catch (err) {
      console.error('[Demo] Failed to load follows:', err);
    }
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden text-sabhaText bg-[linear-gradient(180deg,#fbf9f5_0%,#f6f2ea_55%,#f1ece2_100%)]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-25 bg-[radial-gradient(circle_at_12%_14%,rgba(178,124,56,.12)_0,transparent_36%),radial-gradient(circle_at_88%_78%,rgba(139,62,47,.08)_0,transparent_38%)] sabha-fade" />

      <div className="sabha-page-box">
        <div
          className="mx-auto max-w-[1120px] px-[var(--page-gutter)] pt-6 pb-10 sm:pt-7"
          style={{ "--page-gutter": "clamp(18px, 6vw, 140px)" }}
        >
          <Navbar />

          <main className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-7">
            {/* Left Sidebar */}
            <section className="space-y-4">
              {/* Discussion Form */}
              <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_16px_36px_rgba(76,48,28,.12)] sabha-reveal sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.78rem] font-semibold tracking-[0.24em] text-sabhaMuted uppercase">
                      Live Assembly
                    </p>
                    <h1 className="mt-1 text-[clamp(1.7rem,3.4vw,2.4rem)] font-serif">
                      Sabha Demo
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
                    className="w-full resize-none rounded-2xl border border-[rgba(130,92,57,.2)] bg-[#fcfbf8] px-4 py-3 text-sm leading-6 text-sabhaText shadow-[inset_0_1px_0_rgba(255,255,255,.8)] outline-none transition focus:border-[rgba(139,62,47,.5)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(139,62,47,.12)] sm:text-[0.95rem]"
                    placeholder="Enter a topic for the assembly..."
                  />
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={submitting || !topic.trim()}
                      className="rounded-full border border-[rgba(126,53,39,.45)] bg-[#8f3f31] px-4 py-[9px] text-[0.88rem] font-semibold text-[#fff9f0] shadow-[0_8px_18px_rgba(101,43,31,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(101,43,31,.28)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <LoadingDots /> Starting...
                        </span>
                      ) : (
                        "Start Discussion"
                      )}
                    </button>
                    
                    {/* API Status Indicator */}
                    <span className="text-[0.78rem] text-sabhaMuted">
                      {status === "running" && (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-[#8f3f31] animate-pulse" />
                          Processing
                        </span>
                      )}
                      {status === "error" && (
                        <span className="text-[#8b3e2f]">API Error - Demo Mode</span>
                      )}
                      {status === "idle" && "Ready"}
                    </span>
                  </div>
                </form>

                {/* Error Display */}
                {error && (
                  <div className="mt-3 rounded-xl border border-[rgba(139,62,47,.3)] bg-[rgba(255,244,227,.9)] p-3">
                    <p className="text-sm text-[#8b3e2f]">{error}</p>
                    <button
                      onClick={loadDefaultDemo}
                      className="mt-2 text-xs font-semibold text-[#8f3f31] underline"
                    >
                      Load Demo Data
                    </button>
                  </div>
                )}
              </div>

              {/* Assembly Roles */}
              <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_14px_30px_rgba(76,48,28,.1)] sabha-reveal sm:p-5" style={{ animationDelay: "140ms" }}>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                  Assembly Roles
                </p>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {botMeta.map((bot) => (
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
                      {bot.name !== "User" && (
                        <button
                          type="button"
                          onClick={() => toggleFollowBot(bot.name)}
                          className="mt-2 rounded-full border border-[rgba(130,92,57,.22)] bg-white px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sabhaMuted transition hover:text-sabhaAccent"
                        >
                          {followedBots.has(bot.name) ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Sabhas */}
              <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_14px_30px_rgba(76,48,28,.1)] sabha-reveal sm:p-5" style={{ animationDelay: "180ms" }}>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                  Sub-Sabhas
                </p>
                <div className="mt-3 space-y-2">
                  {["AI Governance", "Product Strategy", "Model Safety", "Open Source"].map((sub) => (
                    <div key={sub} className="flex items-center justify-between rounded-2xl border border-[rgba(130,92,57,.16)] bg-[rgba(255,252,248,.9)] px-3 py-2">
                      <span className="text-[0.75rem] font-semibold text-sabhaMuted">{sub}</span>
                      <button
                        type="button"
                        onClick={() => toggleFollowSub(sub)}
                        className="rounded-full border border-[rgba(130,92,57,.22)] bg-white px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sabhaMuted transition hover:text-sabhaAccent"
                      >
                        {followedSubs.has(sub) ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consensus Snapshot */}
              <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_14px_30px_rgba(76,48,28,.1)] sabha-reveal sm:p-5" style={{ animationDelay: "220ms" }}>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                  Consensus Snapshot
                </p>
                <h3 className="mt-2 text-lg font-serif text-sabhaAccent">Shared outcome</h3>
                <p className="mt-2 text-sm leading-6 text-sabhaMuted sm:text-[0.95rem]">
                  {consensus?.summary || "The council favors a two speed system: rapid iteration in contained sandboxes, and gated releases with mandatory evals and red team checks."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(consensus?.tags || ["Tiered Risk", "Sandbox First", "Red-Team Gate", "Audit Trail"]).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(139,62,47,.18)] bg-[rgba(255,244,227,.7)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sabhaAccent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_14px_30px_rgba(76,48,28,.1)] sabha-reveal sm:p-5">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleReset}
                    className="rounded-full border border-[rgba(130,92,57,.22)] bg-white px-3 py-2 text-[0.8rem] font-semibold text-sabhaMuted shadow-[0_4px_10px_rgba(82,51,25,.08)] transition hover:-translate-y-0.5 hover:text-sabhaAccent"
                  >
                    Reset Demo
                  </button>
                  <button
                    onClick={loadDefaultDemo}
                    className="rounded-full border border-[rgba(130,92,57,.22)] bg-white px-3 py-2 text-[0.8rem] font-semibold text-sabhaMuted shadow-[0_4px_10px_rgba(82,51,25,.08)] transition hover:-translate-y-0.5 hover:text-sabhaAccent"
                  >
                    Load Demo
                  </button>
                  {status === "running" && (
                    <span className="flex items-center gap-2 px-3 py-2 text-[0.8rem] text-[#8f3f31]">
                      <LoadingDots /> Gathering perspectives...
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Right Content - Discussion Transcript */}
            <section className="rounded-3xl border border-[rgba(130,92,57,.18)] bg-white p-4 shadow-[0_18px_40px_rgba(76,48,28,.12)] sabha-reveal sm:p-5" style={{ animationDelay: "160ms" }}>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-sabhaMuted">
                    Transcript
                  </p>
                  <h2 className="mt-1 text-lg font-serif text-sabhaAccent">Topic Under Review</h2>
                </div>
                <div className="rounded-2xl border border-[rgba(139,62,47,.18)] bg-[rgba(255,245,232,.6)] px-3 py-2 text-[0.75rem] font-semibold text-sabhaAccent max-w-[200px] truncate">
                  {activeTopic || "Enter a topic to begin..."}
                </div>
              </div>

              {/* Status Bar */}
              {status === "running" && (
                <div className="mb-4 rounded-xl border border-[rgba(143,89,52,.2)] bg-[rgba(255,252,248,.9)] px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-sabhaMuted">
                      Discussion in progress
                    </span>
                    <span className="flex items-center gap-2 text-xs text-[#8f3f31]">
                      <span className="h-2 w-2 rounded-full bg-[#8f3f31] animate-pulse" />
                      Round {rounds.length + 1} coming...
                    </span>
                  </div>
                </div>
              )}

              {/* Rounds List */}
              <div className="space-y-3 sm:mt-5 sm:space-y-4">
                {loading ? (
                  // Loading skeleton
                  <>
                    <RoundSkeleton />
                    <RoundSkeleton />
                    <RoundSkeleton />
                  </>
                ) : rounds.length > 0 ? (
                  // Render rounds from API or demo data
                  rounds.map((entry, index) => {
                    // Handle API format (array of rounds with messages)
                    if (entry.messages || entry.round_number !== undefined) {
                      return (
                        <RoundCard
                          key={`round-${entry.round_number || index}`}
                          round={entry}
                          botMeta={botMeta}
                          index={index}
                          voteTotals={voteTotals}
                          onVote={voteMessage}
                        />
                      );
                    }
                    // Handle demo format (array of entries)
                    return (
                      <RoundCard
                        key={`${entry.bot}-${index}`}
                        round={entry}
                        botMeta={botMeta}
                        index={index}
                        voteTotals={voteTotals}
                        onVote={voteMessage}
                      />
                    );
                  })
                ) : (
                  // Empty state
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-4">🗣️</div>
                    <p className="text-sabhaMuted">
                      No discussion yet. Enter a topic and click "Start Discussion"
                    </p>
                  </div>
                )}
              </div>

              {/* Interject */}
              <form onSubmit={handleCommentSubmit} className="mt-5 rounded-2xl border border-[rgba(130,92,57,.16)] bg-[rgba(255,252,248,.9)] p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
                  Interject
                </p>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder={discussionId ? "Ask a follow-up or challenge a point..." : "Start a discussion to comment"}
                  disabled={!discussionId}
                  className="mt-2 w-full resize-none rounded-xl border border-[rgba(130,92,57,.2)] bg-white px-3 py-2 text-sm leading-6 text-sabhaText shadow-[inset_0_1px_0_rgba(255,255,255,.8)] outline-none transition focus:border-[rgba(139,62,47,.5)] focus:shadow-[0_0_0_3px_rgba(139,62,47,.12)] disabled:opacity-60"
                />
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!discussionId || submitting || !commentText.trim()}
                    className="rounded-full border border-[rgba(126,53,39,.45)] bg-[#8f3f31] px-4 py-[7px] text-[0.78rem] font-semibold text-[#fff9f0] shadow-[0_8px_18px_rgba(101,43,31,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(101,43,31,.28)] active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Post Comment"}
                  </button>
                  <span className="text-[0.72rem] text-sabhaMuted">
                    Human messages will trigger a new council response.
                  </span>
                </div>
              </form>

              {/* Load More Button */}
              {rounds.length > 0 && status !== "running" && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="rounded-full border border-[rgba(130,92,57,.22)] bg-white px-4 py-2 text-[0.85rem] font-semibold text-sabhaMuted shadow-[0_4px_10px_rgba(82,51,25,.08)] transition hover:-translate-y-0.5 hover:text-sabhaAccent disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load More Rounds"}
                  </button>
                </div>
              )}

              {/* Polling indicator */}
              {polling && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-sabhaMuted">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8f3f31] animate-pulse" />
                  Auto-refreshing for new rounds...
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
