from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Agent, Session, Message
from .serializers import (
    AgentSerializer,
    AgentDetailSerializer,
    SessionSerializer,
    SessionDetailSerializer,
    SessionCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)
from .agents.orchestrator import Orchestrator


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing AI agents.
    GET /api/agents/ - List all active agents
    GET /api/agents/{id}/ - Get agent details
    """
    queryset = Agent.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AgentDetailSerializer
        return AgentSerializer


class SessionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Sabha discussion sessions.
    POST /api/sessions/ - Create new session
    GET /api/sessions/ - List all sessions
    GET /api/sessions/{id}/ - Get session with full history
    POST /api/sessions/{id}/messages/ - Add user message + trigger council
    """
    queryset = Session.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SessionCreateSerializer
        if self.action == 'retrieve':
            return SessionDetailSerializer
        return SessionSerializer
    
    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        """
        Add a user message to the session and trigger the Sabha council.
        This is the main endpoint that kicks off the AI deliberation.
        """
        session = self.get_object()
        serializer = MessageCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        content = serializer.validated_data['content']
        
        # Create user message
        user_message = Message.objects.create(
            session=session,
            role="user",
            content=content
        )
        
        # Update session topic if not set
        if not session.topic:
            session.topic = content
            session.save()
        
        # Trigger the Sabha council deliberation
        try:
            orchestrator = Orchestrator()
            orchestrator.run_council(session, content)
        except Exception as e:
            # Log error but don't fail the request
            Message.objects.create(
                session=session,
                role="system",
                content=f"Council encountered an error: {str(e)}"
            )
            session.status = "failed"
            session.save()
        
        # Return updated session
        response_serializer = SessionDetailSerializer(session)
        return Response(response_serializer.data)


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing messages.
    Mainly used for debugging/admin purposes.
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        session_id = self.request.query_params.get('session')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset
