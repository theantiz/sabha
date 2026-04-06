"""
Celery Tasks for Sabha - Async council deliberation
"""

from celery import shared_task
from debate.agents.orchestrator import run_council


@shared_task(bind=True, time_limit=120)
def run_council_async(self, session_id: int, user_message: str):
    """
    Run council deliberation asynchronously.

    This task wraps ``debate.agents.orchestrator.run_council`` and returns the
    same structured payload:

    {
        "session_id": int,
        "topic": str,
        "status": "completed" | "error" | ...,
        "consensus": str | null,
        "agent_responses": [
            {
                "agent": str,
                "phase": str,
                "content": str,
            },
            ...
        ],
        "from_cache": bool,
    }

    On failure, the associated Session is marked with status=\"error\" and an
    error message is stored in ``consensus`` before the exception is re-raised.
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
