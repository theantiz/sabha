"""
Django REST Framework Views for Sabha API
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from debate.models import Agent, Session, Message
from debate.demo import get_demo_questions
from debate.serializers import (
    AgentSerializer,
    AgentDetailSerializer,
    SessionSerializer,
    SessionListSerializer,
    SessionCreateSerializer,
    MessageSerializer,
    TriggerCouncilSerializer,
    DebateRequestSerializer,
)
from debate.agents.orchestrator import run_council


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing Sabha agents
    """
    queryset = Agent.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AgentDetailSerializer
        return AgentSerializer


class SessionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Sabha sessions
    """
    queryset = Session.objects.all().order_by('-created_at')
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SessionListSerializer
        elif self.action == 'create':
            return SessionCreateSerializer
        return SessionSerializer

    @action(detail=False, methods=['post'], url_path='debate')
    def debate(self, request):
        """
        Create a session and run the council in a single backend call.

        POST /api/sessions/debate/
        Body: {"topic": "..."} or {"content": "..."} or {"title": "...", "topic": "..."}
        """
        serializer = DebateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data['prompt']
        session = Session.objects.create(
            title=serializer.validated_data['title'],
            topic=serializer.validated_data['topic'],
        )

        try:
            Message.objects.create(
                session=session,
                role='user',
                content=prompt
            )

            run_council(session.id, prompt)
            session.refresh_from_db()
            return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            session.delete()
            return Response(
                {'detail': f'Council encountered an error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        """
        Add a user message and trigger the council deliberation
        
        POST /api/sessions/{id}/messages/
        Body: {"content": "Your question here"}
        """
        session = self.get_object()
        serializer = TriggerCouncilSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        content = serializer.validated_data['content']
        
        try:
            # Create user message
            Message.objects.create(
                session=session,
                role='user',
                content=content
            )
            
            # Run the council
            run_council(session.id, content)
            
            # Return updated session with all messages
            session.refresh_from_db()
            return Response(
                SessionSerializer(session).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'detail': f'Council encountered an error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing messages
    """
    queryset = Message.objects.all().order_by('created_at')
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        session_id = self.request.query_params.get('session')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset



class DemoQuestionsView(APIView):
    """
    Read-only endpoint that returns a list of demo questions.

    The frontend can rotate through these questions to showcase Sabha
    without hardcoding them client-side.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        questions = get_demo_questions()
        return Response(
            {
                "count": len(questions),
                "questions": questions,
            },
            status=status.HTTP_200_OK,
        )
