from rest_framework.routers import DefaultRouter
from .views import AgentViewSet, SessionViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'agents', AgentViewSet, basename='agent')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = router.urls
