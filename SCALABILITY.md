# Scalability Note

This project is designed as a modular monolith with a path to horizontal scaling.

## Current Design
- React frontend and Node/Express backend are separated.
- API is versioned under `/api/v1` for safe future iteration.
- PostgreSQL + Prisma handle persistence and schema evolution.
- JWT-based auth keeps the API stateless.

## Why It Scales
- Stateless auth allows multiple backend instances behind a load balancer.
- Task list endpoint supports pagination and filtering to control query size.
- Role checks are centralized in middleware/route logic.
- Prisma models can be extended with new modules without restructuring the app.

## Deployment Readiness
- Dockerfiles exist for backend/frontend.
- `docker-compose.yml` provides reproducible multi-service local deployment.

## Next Steps (Optional)
- Add Redis caching for frequent task list reads.
- Add centralized logging/monitoring.
- Add read replicas for heavy read traffic.
- Split into services (`auth`, `tasks`) if throughput grows significantly.
