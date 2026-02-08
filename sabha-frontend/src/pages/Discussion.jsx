import React from "react";
import { useDiscussion } from "../hooks/useDiscussion.js";

export default function Discussion() {
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
    discussionId,
    startDiscussion,
    postUserMessage,
  } = useDiscussion();

  const [commentText, setCommentText] = React.useState("");

  const handleStart = async (e) => {
    e.preventDefault();
    await startDiscussion(topic);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await postUserMessage(commentText);
    setCommentText("");
  };

  return (
    <div className="min-h-screen bg-[#faf8f3] text-sabhaText">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-serif text-sabhaAccent">Sabha Discussion</h1>
          <p className="text-sm text-sabhaMuted">
            Start a topic and watch the council respond.
          </p>
        </header>

        <section className="mb-6 rounded-2xl border border-[rgba(130,92,57,.18)] bg-white p-4">
          <form onSubmit={handleStart} className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
              Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-[rgba(130,92,57,.2)] bg-[#fcfbf8] px-3 py-2 text-sm outline-none focus:border-[rgba(139,62,47,.5)]"
              placeholder="Enter a debate topic..."
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !topic.trim()}
                className="rounded-full border border-[rgba(126,53,39,.45)] bg-[#8f3f31] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#fff9f0] disabled:opacity-50"
              >
                {submitting ? "Starting..." : "Start"}
              </button>
              <span className="text-xs text-sabhaMuted">
                {status === "running" ? "Processing..." : "Ready"}
              </span>
            </div>
          </form>
          {error && (
            <p className="mt-3 text-sm text-[#8b3e2f]">{error}</p>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-[rgba(130,92,57,.18)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
            Topic
          </p>
          <p className="mt-2 text-sm text-sabhaText">
            {activeTopic || "No active topic yet."}
          </p>
          {consensus?.summary && (
            <div className="mt-3 rounded-xl border border-[rgba(130,92,57,.18)] bg-[#fffaf2] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
                Consensus
              </p>
              <p className="mt-2 text-sm text-sabhaMuted">{consensus.summary}</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[rgba(130,92,57,.18)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
            Transcript
          </p>
          {loading ? (
            <p className="mt-3 text-sm text-sabhaMuted">Loading...</p>
          ) : rounds.length === 0 ? (
            <p className="mt-3 text-sm text-sabhaMuted">No messages yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {rounds.map((round, roundIndex) => (
                <div key={`round-${round.round_number || roundIndex}`} className="space-y-2">
                  {round.messages?.map((message, msgIndex) => (
                    <div
                      key={`${roundIndex}-${msgIndex}`}
                      className="rounded-xl border border-[rgba(130,92,57,.15)] bg-[#fffaf2] p-3"
                    >
                      <div className="text-xs font-semibold text-sabhaAccent">
                        {message.bot || message.agent_name || "Agent"}
                      </div>
                      <p className="mt-1 text-sm text-sabhaMuted">
                        {message.content || message.body || message.text}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} className="mt-5 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-sabhaMuted">
              Interject
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              disabled={!discussionId}
              className="w-full resize-none rounded-xl border border-[rgba(130,92,57,.2)] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(139,62,47,.5)] disabled:opacity-60"
              placeholder={discussionId ? "Ask a follow-up..." : "Start a discussion first"}
            />
            <button
              type="submit"
              disabled={!discussionId || submitting || !commentText.trim()}
              className="rounded-full border border-[rgba(126,53,39,.45)] bg-[#8f3f31] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#fff9f0] disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
