FROM python:3.11-slim AS core
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV UV_PROJECT_ENVIRONMENT="/venv"
ENV UV_LINK_MODE=copy
ENV PATH="$UV_PROJECT_ENVIRONMENT/bin:$PATH"
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-cache --no-install-project

WORKDIR /src
# ENV PYTHONPATH=/src
COPY . .

FROM core AS production
EXPOSE 8080
ENTRYPOINT ["fastapi", "run", "main.py", "--port", "8080", "--host", "0.0.0.0"]

FROM core AS development
EXPOSE 8080
ENTRYPOINT ["fastapi", "dev", "main.py", "--port", "8080", "--host", "0.0.0.0"]
