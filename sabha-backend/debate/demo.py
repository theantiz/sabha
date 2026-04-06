DEMO_QUESTIONS = [
    "How should we design a scalable microservices architecture for a fintech app?",
    "What are the trade-offs between SQL and NoSQL databases for analytics workloads?",
    "How can we improve the performance and UX of our React frontend?",
    "What security best practices should we apply to a public REST API?",
    "How can we introduce feature flags safely into an existing monolith?",
]


def get_demo_questions():
    """
    Return the list of demo questions.

    Frontends can rotate through these for a hands-off demo mode without
    needing to hardcode strings client-side.
    """
    return DEMO_QUESTIONS

