"""
Django REST Framework Serializers for Sabha API
"""

from rest_framework import serializers
from debate.models import Agent, Session, Message, ReasoningEntry


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'role', 'tone', 'llm_provider', 'llm_model', 'is_active', 'order']


class AgentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'


class ReasoningEntrySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    class Meta:
        model = ReasoningEntry
        fields = ['id', 'agent_name', 'phase', 'rationale', 'confidence', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    reasoning = ReasoningEntrySerializer(
        source='session.reasoning',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = Message
        fields = ['id', 'role', 'agent_name', 'phase', 'content', 'created_at', 'reasoning']


class SessionListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'topic', 'status', 'message_count', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class SessionSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    answer = serializers.CharField(source='consensus', read_only=True)
    reply = serializers.CharField(source='consensus', read_only=True)
    transcript = MessageSerializer(source='messages', many=True, read_only=True)
    
    class Meta:
        model = Session
        fields = [
            'id',
            'title',
            'topic',
            'status',
            'consensus',
            'answer',
            'reply',
            'messages',
            'transcript',
            'created_at',
            'updated_at',
        ]


class SessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'title', 'topic']
        read_only_fields = ['id']


class TriggerCouncilSerializer(serializers.Serializer):
    content = serializers.CharField(required=True)


class DebateRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, max_length=200)
    topic = serializers.CharField(required=False, allow_blank=True)
    content = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        topic = (attrs.get('topic') or '').strip()
        content = (attrs.get('content') or '').strip()
        prompt = content or topic

        if not prompt:
            raise serializers.ValidationError("Provide either 'content' or 'topic'.")

        attrs['prompt'] = prompt
        attrs['title'] = (attrs.get('title') or 'Sabha Debate').strip() or 'Sabha Debate'
        attrs['topic'] = topic or prompt
        return attrs
