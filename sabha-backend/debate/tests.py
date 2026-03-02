"""
Comprehensive Test Suite for Sabha AI Parliament
"""

from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from debate.models import Agent, Session, Message, ReasoningEntry
from debate.agents.registry import AGENTS_CONFIG
from unittest.mock import patch, MagicMock


class AgentModelTest(TestCase):
    """Test Agent model creation and validation"""
    
    def setUp(self):
        self.agent = Agent.objects.create(
            name="TestAgent",
            role="Test Role",
            tone="Test Tone",
            system_prompt="Test prompt",
            llm_provider="openrouter",
            llm_model="gpt-4",
            is_active=True,
            order=1
        )
    
    def test_agent_creation(self):
        """Test that agents can be created with all required fields"""
        self.assertEqual(self.agent.name, "TestAgent")
        self.assertEqual(self.agent.role, "Test Role")
        self.assertTrue(self.agent.is_active)
    
    def test_agent_ordering(self):
        """Test that agents are ordered by order field"""
        agent2 = Agent.objects.create(
            name="Agent2", role="Role2", tone="Tone2",
            system_prompt="Prompt", llm_provider="gemini",
            llm_model="gemini-flash", order=2
        )
        agents = Agent.objects.all()
        self.assertEqual(agents[0], self.agent)
        self.assertEqual(agents[1], agent2)
    
    def test_agent_str_method(self):
        """Test agent string representation"""
        self.assertEqual(str(self.agent), "TestAgent (Test Role)")


class SessionModelTest(TestCase):
    """Test Session model functionality"""
    
    def test_session_creation(self):
        """Test creating a session"""
        session = Session.objects.create(
            title="Test Session",
            topic="Test Topic"
        )
        self.assertEqual(session.title, "Test Session")
        self.assertEqual(session.status, "active")
        self.assertIsNone(session.consensus)
    
    def test_session_with_consensus(self):
        """Test session with consensus"""
        session = Session.objects.create(
            title="Test",
            topic="Topic",
            consensus="Final answer",
            status="completed"
        )
        self.assertEqual(session.consensus, "Final answer")
        self.assertEqual(session.status, "completed")


class MessageModelTest(TestCase):
    """Test Message model functionality"""
    
    def setUp(self):
        self.session = Session.objects.create(title="Test", topic="Topic")
    
    def test_user_message(self):
        """Test creating a user message"""
        msg = Message.objects.create(
            session=self.session,
            role="user",
            content="Test question"
        )
        self.assertEqual(msg.role, "user")
        self.assertIsNone(msg.agent_name)
        self.assertIsNone(msg.phase)
    
    def test_agent_message(self):
        """Test creating an agent message"""
        msg = Message.objects.create(
            session=self.session,
            role="agent",
            agent_name="Sutradhara",
            phase="framing",
            content="Agent response"
        )
        self.assertEqual(msg.role, "agent")
        self.assertEqual(msg.agent_name, "Sutradhara")
        self.assertEqual(msg.phase, "framing")
    
    def test_message_ordering(self):
        """Test that messages are ordered by creation time"""
        msg1 = Message.objects.create(session=self.session, role="user", content="First")
        msg2 = Message.objects.create(session=self.session, role="agent", content="Second")
        messages = self.session.messages.all()
        self.assertEqual(messages[0], msg1)
        self.assertEqual(messages[1], msg2)


class SessionAPITest(APITestCase):
    """Test Session API endpoints"""
    
    def test_create_session(self):
        """Test POST /api/sessions/ creates a session"""
        data = {"title": "API Test", "topic": "Test Topic"}
        response = self.client.post('/api/sessions/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['title'], "API Test")
        self.assertEqual(response.data['topic'], "Test Topic")
    
    def test_create_session_without_topic(self):
        """Test creating session without topic still works"""
        data = {"title": "No Topic Test"}
        response = self.client.post('/api/sessions/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
    
    def test_list_sessions(self):
        """Test GET /api/sessions/ returns sessions list"""
        Session.objects.create(title="Session 1", topic="Topic 1")
        Session.objects.create(title="Session 2", topic="Topic 2")
        
        response = self.client.get('/api/sessions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_session_detail(self):
        """Test GET /api/sessions/{id}/ returns session with messages"""
        session = Session.objects.create(title="Detail Test", topic="Topic")
        Message.objects.create(session=session, role="user", content="Question")
        
        response = self.client.get(f'/api/sessions/{session.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], session.id)
        self.assertEqual(len(response.data['messages']), 1)


class CouncilIntegrationTest(APITestCase):
    """Test the full council deliberation flow"""
    
    def setUp(self):
        """Set up test agents"""
        for config in AGENTS_CONFIG:
            Agent.objects.create(
                name=config["name"],
                role=config["role"],
                tone=config["tone"],
                system_prompt=config["system_prompt"],
                llm_provider=config["llm_provider"],
                llm_model=config["llm_model"],
                is_active=True,
                order=config["order"]
            )
    
    @patch('debate.agents.gateway.call_llm')
    def test_trigger_council(self, mock_llm):
        """Test POST /api/sessions/{id}/messages/ triggers council"""
        # Mock LLM responses
        mock_llm.side_effect = [
            "Framing response",
            "Evidence response",
            "Counterpoint response",
            "Plan response",
            "Consensus: synthesis response"
        ]
        
        # Create session
        session = Session.objects.create(title="Test", topic="Test topic")
        
        # Trigger council
        data = {"content": "Test question"}
        response = self.client.post(
            f'/api/sessions/{session.id}/messages/',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify messages were created
        messages = Message.objects.filter(session=session)
        self.assertEqual(messages.count(), 6)  # 1 user + 5 agents
        
        # Verify agent messages
        agent_messages = messages.filter(role='agent')
        self.assertEqual(agent_messages.count(), 5)
        
        # Verify consensus was saved
        session.refresh_from_db()
        self.assertIsNotNone(session.consensus)
        self.assertEqual(session.status, "completed")
    
    @patch('debate.agents.gateway.call_llm')
    def test_council_with_error(self, mock_llm):
        """Test council handles LLM errors gracefully"""
        # Mock LLM to raise an error
        mock_llm.side_effect = Exception("API Error")
        
        session = Session.objects.create(title="Error Test")
        
        data = {"content": "Test question"}
        response = self.client.post(
            f'/api/sessions/{session.id}/messages/',
            data,
            format='json'
        )
        
        # Council handles errors gracefully and returns 200
        # Errors are logged as system messages
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AgentAPITest(APITestCase):
    """Test Agent API endpoints"""
    
    def setUp(self):
        self.agent = Agent.objects.create(
            name="TestAgent",
            role="Test Role",
            tone="Test Tone",
            system_prompt="Prompt",
            llm_provider="openrouter",
            llm_model="gpt-4",
            order=1
        )
    
    def test_list_agents(self):
        """Test GET /api/agents/ returns active agents"""
        response = self.client.get('/api/agents/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "TestAgent")
    
    def test_get_agent_detail(self):
        """Test GET /api/agents/{id}/ returns agent with system prompt"""
        response = self.client.get(f'/api/agents/{self.agent.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "TestAgent")
        self.assertIn('system_prompt', response.data)


class LLMGatewayTest(TestCase):
    """Test LLM Gateway functionality"""
    
    @patch('requests.post')
    def test_call_openrouter(self, mock_post):
        """Test OpenRouter API call"""
        from debate.agents.gateway import call_openrouter
        
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Test response"}}]
        }
        mock_post.return_value = mock_response
        
        messages = [{"role": "user", "content": "Test"}]
        result = call_openrouter("gpt-4", messages, "test_key")
        
        self.assertEqual(result, "Test response")
        mock_post.assert_called_once()
    
    @patch('requests.post')
    def test_call_gemini(self, mock_post):
        """Test Gemini API call"""
        from debate.agents.gateway import call_gemini
        
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "candidates": [{
                "content": {"parts": [{"text": "Gemini response"}]}
            }]
        }
        mock_post.return_value = mock_response
        
        messages = [{"role": "user", "content": "Test"}]
        result = call_gemini("gemini-flash", messages, "test_key")
        
        self.assertEqual(result, "Gemini response")


class RegistryTest(TestCase):
    """Test agent registry functions"""
    
    def test_seed_agents(self):
        """Test seeding default agents"""
        from debate.agents.registry import seed_agents
        
        count = seed_agents()
        
        self.assertEqual(count, 5)
        self.assertEqual(Agent.objects.count(), 5)
        
        # Verify all agents are created
        agent_names = [a.name for a in Agent.objects.all()]
        self.assertIn("Sutradhara", agent_names)
        self.assertIn("Pramana", agent_names)
        self.assertIn("Tarkika", agent_names)
        self.assertIn("Nirdeshaka", agent_names)
        self.assertIn("Sahachara", agent_names)
    
    def test_get_phase(self):
        """Test getting phase for agent name"""
        from debate.agents.registry import get_phase
        
        self.assertEqual(get_phase("Sutradhara"), "framing")
        self.assertEqual(get_phase("Pramana"), "evidence")
        self.assertEqual(get_phase("Tarkika"), "counterpoint")
        self.assertEqual(get_phase("Nirdeshaka"), "plan")
        self.assertEqual(get_phase("Sahachara"), "synthesis")
        self.assertEqual(get_phase("Unknown"), "discussion")
