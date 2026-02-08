// RoundCard.jsx - Component for displaying individual discussion rounds
import React from 'react';

const PHASE_COLORS = {
  Framing: 'bg-[rgba(143,89,52,.18)] border-[rgba(143,89,52,.3)]',
  Evidence: 'bg-[rgba(107,74,51,.16)] border-[rgba(107,74,51,.28)]',
  Counterpoint: 'bg-[rgba(139,62,47,.14)] border-[rgba(139,62,47,.26)]',
  Plan: 'bg-[rgba(138,90,47,.16)] border-[rgba(138,90,47,.28)]',
  Synthesis: 'bg-[rgba(122,59,47,.14)] border-[rgba(122,59,47,.26)]',
  User: 'bg-[rgba(107,90,75,.14)] border-[rgba(107,90,75,.26)]',
  Response: 'bg-[rgba(130,92,57,.14)] border-[rgba(130,92,57,.26)]',
  default: 'bg-[rgba(130,92,57,.14)] border-[rgba(130,92,57,.26)]',
};

const PHASE_BADGES = {
  Framing: 'text-[#8f5934]',
  Evidence: 'text-[#6b4a33]',
  Counterpoint: 'text-[#8b3e2f]',
  Plan: 'text-[#8a5a2f]',
  Synthesis: 'text-[#7a3b2f]',
  User: 'text-[#6b5a4b]',
  Response: 'text-[#825c39]',
  default: 'text-[#825c39]',
};

function RoundCard({ round, botMeta, index, voteTotals, onVote }) {
  const { phase, messages, round_number } = round;
  const phaseKey = phase || 'default';
  
  const getBotColor = (botName) => {
    const bot = botMeta.find(b => b.name === botName);
    return bot?.color || 'text-sabhaAccent';
  };

  return (
    <div
      className="rounded-2xl border border-[rgba(130,92,57,.16)] bg-[rgba(255,252,248,.96)] p-4 shadow-[0_8px_18px_rgba(82,51,25,.08)] sabha-reveal sm:p-5"
      style={{ animationDelay: `${index * 80 + 240}ms` }}
    >
      {/* Round Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${getBotColor(messages?.[0]?.bot || messages?.[0]?.agent_name || (messages?.[0]?.role === 'user' ? 'User' : 'System'))}`}>
            {phase || 'Round'}
          </span>
          <span className={`rounded-full border px-2 py-[2px] text-[0.66rem] font-semibold uppercase tracking-[0.12em] ${PHASE_COLORS[phaseKey]} ${PHASE_BADGES[phaseKey]}`}>
            {phaseKey}
          </span>
        </div>
        <span className="text-[0.7rem] text-sabhaMuted">
          Round {round_number || index + 1}
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages?.map((message, msgIndex) => {
          const botName = message.bot || message.agent_name || (message.role === 'user' ? 'User' : 'System');
          const bot = botMeta.find(b => b.name === botName);
          const messageId = message.id || message.message_id || `${round_number || index + 1}-${msgIndex}`;
          const voteState = voteTotals?.[messageId] || { up: message.upvotes || 0, down: message.downvotes || 0, choice: null };
          return (
            <div
              key={`${botName}-${msgIndex}`}
              className="rounded-xl bg-white/80 p-3 border border-[rgba(130,92,57,.1)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold ${bot?.color || 'text-sabhaAccent'}`}>
                  {botName}
                </span>
                {bot && (
                  <span className="rounded-full border border-[rgba(139,62,47,.2)] bg-white px-1.5 py-[1px] text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-sabhaMuted">
                    {bot.tone}
                  </span>
                )}
              </div>
              <p className="text-sm leading-6 text-sabhaMuted">
                {message.body || message.content || message.text}
              </p>
              <MessageVotes
                up={voteState.up}
                down={voteState.down}
                choice={voteState.choice}
                onVote={(direction) => onVote?.(messageId, direction)}
              />
            </div>
          );
        })}
        
        {/* Fallback for hardcoded format */}
        {!messages && round.bot && (
          <div className="rounded-xl bg-white/80 p-3 border border-[rgba(130,92,57,.1)]">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold ${getBotColor(round.bot)}`}>
                {round.bot}
              </span>
            </div>
            <p className="text-sm leading-6 text-sabhaMuted">
              {round.body}
            </p>
            <MessageVotes up={0} down={0} choice={null} />
          </div>
        )}
      </div>
    </div>
  );
}

function MessageVotes({ up, down, choice, onVote }) {
  return (
    <div className="mt-3 flex items-center gap-3 text-[0.72rem] text-sabhaMuted">
      <button
        type="button"
        onClick={() => onVote?.('up')}
        className={`rounded-full border px-2 py-1 font-semibold transition ${choice === 'up' ? 'border-[#8f3f31] text-[#8f3f31]' : 'border-[rgba(130,92,57,.2)] hover:text-sabhaAccent'}`}
      >
        Upvote {up ?? 0}
      </button>
      <button
        type="button"
        onClick={() => onVote?.('down')}
        className={`rounded-full border px-2 py-1 font-semibold transition ${choice === 'down' ? 'border-[#6b4a33] text-[#6b4a33]' : 'border-[rgba(130,92,57,.2)] hover:text-sabhaAccent'}`}
      >
        Downvote {down ?? 0}
      </button>
    </div>
  );
}

const areEqual = (prevProps, nextProps) => {
  if (prevProps.round !== nextProps.round) return false;
  if (prevProps.botMeta !== nextProps.botMeta) return false;
  if (prevProps.index !== nextProps.index) return false;
  if (prevProps.onVote !== nextProps.onVote) return false;

  const prevMessages = prevProps.round?.messages || [];
  const nextMessages = nextProps.round?.messages || [];
  if (prevMessages.length !== nextMessages.length) return false;

  for (let i = 0; i < prevMessages.length; i += 1) {
    const prevMessage = prevMessages[i];
    const nextMessage = nextMessages[i];
    const prevId = prevMessage?.id || prevMessage?.message_id || `${prevProps.round?.round_number || prevProps.index + 1}-${i}`;
    const nextId = nextMessage?.id || nextMessage?.message_id || `${nextProps.round?.round_number || nextProps.index + 1}-${i}`;
    if (prevId !== nextId) return false;

    const prevVote = prevProps.voteTotals?.[prevId] || {};
    const nextVote = nextProps.voteTotals?.[nextId] || {};
    if (prevVote.up !== nextVote.up) return false;
    if (prevVote.down !== nextVote.down) return false;
    if (prevVote.choice !== nextVote.choice) return false;
  }

  return true;
};

export default React.memo(RoundCard, areEqual);
