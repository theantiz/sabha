SHELL := /bin/bash

.PHONY: help dev-backend dev-frontend dev-all migrate createsuperuser shell test lint

help:
\t@echo "Common Sabha commands:"
\t@echo "  make dev-backend   # Run backend + celery + redis via docker compose"
\t@echo "  make dev-frontend  # Run frontend only (requires backend running)"
\t@echo "  make dev-all       # Run full stack (frontend + backend + celery + redis)"
\t@echo "  make migrate       # Apply Django migrations in backend container"
\t@echo "  make createsuperuser  # Create Django admin user"
\t@echo "  make shell         # Open Django shell in backend container"

dev-backend:
\tdocker compose up backend celery redis

dev-frontend:
\tdocker compose up frontend

dev-all:
\tdocker compose up

migrate:
\tdocker compose exec backend python manage.py migrate

createsuperuser:
\tdocker compose exec backend python manage.py createsuperuser

shell:
\tdocker compose exec backend python manage.py shell

