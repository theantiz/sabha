"""
Celery Tasks for Sabha - Async council deliberation
"""

from celery import shared_task
from debate.agents.orchestrator import run_council


@shared_task(bind=True, time_limit=120)
def run_council_async(self, session_id: int, user_message: str):
    """
    Run council deliberation asynchronously
    
    This allows the API to return immediately while the council
    deliberates in the background.
    
    Args:
        session_id: ID of the session
        user_message: The user's question/topic
    
    Returns:
        Council result dict
    """
    try:
        result = run_council(session_id, user_message)
        return result
    except Exception as e:
        # Update session with error status
        from debate.models import Session
        session = Session.objects.get(id=session_id)
        session.status = "error"
        session.consensus = f"Error during deliberation: {str(e)}"
        session.save()
        raise
