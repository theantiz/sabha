from django.db import models


class Agent(models.Model):
    """AI agent with personality and LLM configuration"""
    name = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=100)
    tone = models.CharField(max_length=50)
    system_prompt = models.TextField()
    llm_provider = models.CharField(max_length=50)  # openrouter, gemini, deepseek
    llm_model = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField()  # Speaking order in council

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.role})"


class Session(models.Model):
    title = models.CharField(max_length=200)
    topic = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default="active")
    consensus = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Message(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("agent", "Agent"),
        ("system", "System"),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    agent_name = models.CharField(max_length=50, null=True, blank=True)
    phase = models.CharField(max_length=50, null=True, blank=True)  # framing, evidence, etc.
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:30]}"


class ReasoningEntry(models.Model):
    """Structured log of agent's reasoning process"""
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="reasoning")
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    phase = models.CharField(max_length=50)
    rationale = models.TextField()
    confidence = models.FloatField(default=0.8)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.agent.name} - {self.phase}"
