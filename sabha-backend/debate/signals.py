from debate.agents.registry import ensure_default_agents


def seed_default_agents(sender, **kwargs):
    ensure_default_agents()
