// useDiscussion.js - Custom hook for managing discussion API calls
import { useState, useCallback, useEffect, useMemo } from 'react';
import * as api from '../services/api';

// Bot configuration with colors
export const BOT_META = [
  { name: "Sutradhara", role: "Orchestrator", tone: "Lead", color: "text-[#8f3f31]" },
  { name: "Tarkika", role: "Critic", tone: "Skeptical", color: "text-[#5f3b29]" },
  { name: "Pramana", role: "Evidence", tone: "Analytical", color: "text-[#6b4a33]" },
  { name: "Sahachara", role: "Synthesizer", tone: "Integrative", color: "text-[#7a3b2f]" },
  { name: "Nirdeshaka", role: "Planner", tone: "Actionable", color: "text-[#8a5a2f]" },
];

const USER_META = { name: "User", role: "Human", tone: "Interjector", color: "text-[#6b5a4b]" };

// Default discussion for fallback
const DEFAULT_DISCUSSION = [
  {
    bot: "Sutradhara",
    phase: "Framing",
    body: "Define the goal: ship faster without lowering safety. Separate fast experiments from production releases.",
  },
  {
    bot: "Pramana",
    phase: "Evidence",
    body: "Evidence shows staged rollouts and red team reviews reduce incidents. Risk rises when evaluation is skipped.",
  },
  {
    bot: "Tarkika",
    phase: "Counterpoint",
    body: "Speed gains disappear if incidents cause rollbacks. Without guardrails, velocity becomes rework and reputation loss.",
  },
  {
    bot: "Nirdeshaka",
    phase: "Plan",
    body: "Use a two track system: a fast sandbox for iteration and a gated release pipeline. Require basic evals for each risk tier.",
  },
  {
    bot: "Sahachara",
    phase: "Synthesis",
    body: "Consensus: protect the critical path with tiered checks, and run experiments in contained environments.",
  },
];

const toTitleCase = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const normalizeMessagesToRounds = (messages = []) => {
  return messages.map((message, index) => {
    const phase = message?.phase ? toTitleCase(message.phase) : (message?.role === 'user' ? 'User' : 'Response');
    const bot = message?.agent_name || (message?.role === 'user' ? 'User' : 'System');
    return {
      round_number: index + 1,
      phase,
      messages: [
        {
          bot,
          role: message?.role,
          phase,
          content: message?.content,
          created_at: message?.created_at,
        },
      ],
    };
  });
};

const VOTE_STORAGE_KEY = 'sabha_message_votes_v1';

const loadStoredVotes = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(VOTE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('[useDiscussion] Failed to read votes from storage:', err);
    return {};
  }
};

const persistVotes = (votes) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes));
  } catch (err) {
    console.error('[useDiscussion] Failed to persist votes:', err);
  }
};

export function useDiscussion() {
  const [discussionId, setDiscussionId] = useState(null);
  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [consensus, setConsensus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, running, completed, error
  const [agents, setAgents] = useState([]);
  const [messageVotes, setMessageVotes] = useState(() => loadStoredVotes());

  const rounds = useMemo(() => normalizeMessagesToRounds(messages), [messages]);
  const voteTotals = useMemo(() => {
    const totals = {};
    Object.entries(messageVotes || {}).forEach(([messageId, entry]) => {
      totals[messageId] = {
        up: entry?.up ?? 0,
        down: entry?.down ?? 0,
        choice: entry?.choice ?? null,
      };
    });
    return totals;
  }, [messageVotes]);
  const botMeta = useMemo(() => {
    if (!agents || agents.length === 0) {
      return [...BOT_META, USER_META];
    }
    const mapped = agents.map((agent) => ({
      name: agent.name,
      role: agent.role,
      tone: agent.tone,
      color: BOT_META.find((bot) => bot.name === agent.name)?.color || "text-[#8f3f31]",
    }));
    return [...mapped, USER_META];
  }, [agents]);

  // Start a new discussion
  const startDiscussion = useCallback(async (topicText) => {
    if (!topicText?.trim()) {
      setError("Please enter a topic");
      return null;
    }

    setSubmitting(true);
    setError(null);
    setStatus("running");

    try {
      const session = await api.submitTopic(topicText.trim());
      const sessionId = session.id || session.session_id;
      setDiscussionId(sessionId);
      setActiveTopic(session.topic || topicText.trim());

      setStatus("running");

      const updatedSession = await api.postSessionMessage(sessionId, topicText.trim());
      setMessages(updatedSession.messages || []);
      setConsensus(updatedSession.consensus || null);
      setStatus(updatedSession.status || "completed");
      return updatedSession;
    } catch (err) {
      console.error("[useDiscussion] Error starting discussion:", err);
      setError(err.response?.data?.detail || err.message || "Failed to start discussion");
      setStatus("error");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Fetch discussion session
  const fetchRounds = useCallback(async (id = discussionId) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getSession(id);
      setMessages(data.messages || []);
      setActiveTopic(data.topic || activeTopic);
      setConsensus(data.consensus || null);
      setStatus(data.status || status);
    } catch (err) {
      console.error("[useDiscussion] Error fetching rounds:", err);
      setError(err.response?.data?.detail || err.message || "Failed to fetch rounds");
    } finally {
      setLoading(false);
    }
  }, [discussionId, activeTopic, status]);

  // Poll for new messages
  const pollNewRounds = useCallback(async () => {
    if (!discussionId) return;

    try {
      const session = await api.getSession(discussionId);
      const nextMessages = session.messages || [];
      if (nextMessages.length > messages.length) {
        setMessages(nextMessages);
      }
      setConsensus(session.consensus || null);
      setStatus(session.status || status);
      return nextMessages;
    } catch (err) {
      console.error("[useDiscussion] Error polling rounds:", err);
      return [];
    }
  }, [discussionId, messages.length, status]);

  // Get status
  const checkStatus = useCallback(async (id = discussionId) => {
    if (!id) return;

    try {
      const statusData = await api.getDiscussionStatus(id);
      setStatus(statusData.status);
      return statusData;
    } catch (err) {
      console.error("[useDiscussion] Error checking status:", err);
      return null;
    }
  }, [discussionId]);

  // Reset discussion
  const reset = useCallback(() => {
    setDiscussionId(null);
    setTopic("");
    setActiveTopic("");
    setMessages([]);
    setConsensus(null);
    setLoading(false);
    setSubmitting(false);
    setError(null);
    setStatus("idle");
  }, []);

  const postUserMessage = useCallback(async (content) => {
    if (!discussionId || !content?.trim()) return null;
    setSubmitting(true);
    setError(null);
    try {
      setStatus("running");
      const updatedSession = await api.postSessionMessage(discussionId, content.trim());
      setMessages(updatedSession.messages || []);
      setConsensus(updatedSession.consensus || null);
      setStatus(updatedSession.status || "completed");
      return updatedSession;
    } catch (err) {
      console.error("[useDiscussion] Error posting message:", err);
      setError(err.response?.data?.detail || err.message || "Failed to post message");
      setStatus("error");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [discussionId]);

  const voteMessage = useCallback((messageId, direction) => {
    if (!messageId || !direction) return;
    setMessageVotes((prev) => {
      const current = prev?.[messageId] || { up: 0, down: 0, choice: null };
      let nextUp = current.up;
      let nextDown = current.down;
      let nextChoice = current.choice;

      if (direction === current.choice) {
        if (direction === 'up') nextUp = Math.max(0, nextUp - 1);
        if (direction === 'down') nextDown = Math.max(0, nextDown - 1);
        nextChoice = null;
      } else {
        if (direction === 'up') {
          nextUp += 1;
          if (current.choice === 'down') nextDown = Math.max(0, nextDown - 1);
        }
        if (direction === 'down') {
          nextDown += 1;
          if (current.choice === 'up') nextUp = Math.max(0, nextUp - 1);
        }
        nextChoice = direction;
      }

      const updated = {
        ...prev,
        [messageId]: { up: nextUp, down: nextDown, choice: nextChoice },
      };
      persistVotes(updated);
      return updated;
    });
  }, []);

  // Load default demo
  const loadDefaultDemo = useCallback(() => {
    const demoMessages = DEFAULT_DISCUSSION.map((entry) => ({
      role: "agent",
      agent_name: entry.bot,
      phase: entry.phase?.toLowerCase() || "response",
      content: entry.body,
    }));
    setMessages(demoMessages);
    setActiveTopic("How should teams balance AI speed and safety when shipping new features?");
    setStatus("completed");
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      const agentList = await api.listAgents();
      setAgents(agentList || []);
    } catch (err) {
      console.error("[useDiscussion] Error loading agents:", err);
    }
  }, []);

  // Auto-fetch when discussionId changes
  useEffect(() => {
    if (discussionId) {
      fetchRounds(discussionId);
    }
  }, [discussionId, fetchRounds]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return {
    // State
    discussionId,
    topic,
    activeTopic,
    rounds,
    consensus,
    loading,
    submitting,
    error,
    status,
    botMeta,
    voteTotals,

    // Actions
    setTopic,
    startDiscussion,
    fetchRounds,
    pollNewRounds,
    checkStatus,
    reset,
    loadDefaultDemo,
    postUserMessage,
    voteMessage,
  };
}

export default useDiscussion;
