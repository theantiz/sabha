from django.contrib import admin
from .models import Agent, Session, Message, ReasoningEntry

admin.site.register(Agent)
admin.site.register(Session)
admin.site.register(Message)
admin.site.register(ReasoningEntry)
