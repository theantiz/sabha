from django.contrib import admin
from .models import Agent, Session, Message, ReasoningEntry


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'tone', 'llm_provider', 'llm_model', 'is_active', 'order']
    list_filter = ['is_active', 'llm_provider']
    list_editable = ['is_active', 'order']
    search_fields = ['name', 'role']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'topic']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'agent_name', 'phase', 'short_content', 'created_at']
    list_filter = ['role', 'phase', 'created_at']
    search_fields = ['content']
    
    def short_content(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    short_content.short_description = "Content"


@admin.register(ReasoningEntry)
class ReasoningEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'agent', 'phase', 'confidence', 'created_at']
    list_filter = ['phase', 'created_at']
