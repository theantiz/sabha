"""
URL Configuration for Sabha Debate API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from debate import views

router = DefaultRouter()
router.register('agents', views.AgentViewSet, basename='agent')
router.register('sessions', views.SessionViewSet, basename='session')
router.register('messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('demo/questions/', views.DemoQuestionsView.as_view(), name='demo-questions'),
]
