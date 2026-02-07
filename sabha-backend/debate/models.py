from django.db import models


class Agent(models.Model):
    """
    Defines an AI agent with its personality and LLM configuration.
    Represents a council member in the Sabha Parliament.
    """
    LLM_PROVIDERS = [
        ("openrouter", "OpenRouter"),
        ("gemini", "Gemini"),
        ("deepseek", "DeepSeek"),
    ]

    name = models.CharField(max_length=50, unique=True)  # e.g., "Sutradhara"
    role = models.CharField(max_length=50)  # e.g., "Orchestrator"
    tone = models.CharField(max_length=50)  # e.g., "Lead", "Skeptical"
    system_prompt = models.TextField()  # Agent's personality and instructions
    llm_provider = models.CharField(max_length=20, choices=LLM_PROVIDERS, default="openrouter")
    llm_model = models.CharField(max_length=100, default="openai/gpt-4o-mini")  # Model identifier
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)  # Determines speaking order in council

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.role})"


class Session(models.Model):
    """
    Represents one Sabha discussion session.
    A session contains the user's topic and all agent responses.
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    title = models.CharField(max_length=200)
    topic = models.TextField(blank=True)  # The user's discussion prompt
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    consensus = models.TextField(blank=True)  # Final synthesized consensus
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Message(models.Model):
    """
    A single message in a Sabha session.
    Can be from user, an AI agent, or a system message.
    """
    ROLE_CHOICES = [
        ("user", "User"),
        ("agent", "Agent"),
        ("system", "System"),
    ]

    PHASE_CHOICES = [
        ("framing", "Framing"),
        ("evidence", "Evidence"),
        ("counterpoint", "Counterpoint"),
        ("plan", "Plan"),
        ("synthesis", "Synthesis"),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name="messages")
    agent_name = models.CharField(max_length=50, null=True, blank=True)  # Denormalized for quick access
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES, null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:30]}"


class ReasoningEntry(models.Model):
    """
    Structured log of agent reasoning (Reasoning Ledger).
    Stores rationale, objections, and evidence for replay and analysis.
    """
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="reasoning_entries")
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, related_name="reasoning_entries")
    message = models.OneToOneField(Message, on_delete=models.CASCADE, null=True, related_name="reasoning")
    phase = models.CharField(max_length=20)
    rationale = models.TextField()  # The agent's reasoning process
    objections = models.JSONField(default=list)  # List of objections raised
    evidence = models.JSONField(default=list)  # References/citations
    confidence = models.FloatField(default=0.0)  # Agent's confidence in response (0-1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        agent_name = self.agent.name if self.agent else "Unknown"
        return f"{agent_name} - {self.phase}"
