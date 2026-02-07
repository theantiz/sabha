from rest_framework import serializers
from .models import Agent, Session, Message, ReasoningEntry


class AgentSerializer(serializers.ModelSerializer):
    """Serializer for Agent model"""
    
    class Meta:
        model = Agent
        fields = ['id', 'name', 'role', 'tone', 'llm_provider', 'is_active', 'order']
        read_only_fields = ['id']


class AgentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Agent (includes system prompt)"""
    
    class Meta:
        model = Agent
        fields = '__all__'


class ReasoningEntrySerializer(serializers.ModelSerializer):
    """Serializer for ReasoningEntry"""
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    class Meta:
        model = ReasoningEntry
        fields = ['id', 'agent_name', 'phase', 'rationale', 'objections', 'evidence', 'confidence', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    reasoning = ReasoningEntrySerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'role', 'agent_name', 'phase', 'content', 'created_at', 'reasoning']
        read_only_fields = ['id', 'created_at']


class SessionSerializer(serializers.ModelSerializer):
    """Basic serializer for Session listing"""
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'status', 'message_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class SessionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Session with all messages"""
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'topic', 'status', 'consensus', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'consensus', 'created_at', 'updated_at']


class SessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new session"""
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'topic']
        read_only_fields = ['id']


class MessageCreateSerializer(serializers.Serializer):
    """Serializer for adding a user message and triggering the council"""
    content = serializers.CharField()
