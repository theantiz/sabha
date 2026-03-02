from django.apps import AppConfig
from django.db.models.signals import post_migrate


class DebateConfig(AppConfig):
    name = 'debate'

    def ready(self):
        from debate.signals import seed_default_agents

        post_migrate.connect(seed_default_agents, sender=self)
