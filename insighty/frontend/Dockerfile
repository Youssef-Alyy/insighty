# Base stage
ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /src

# Dependencies stage
FROM base AS dependencies

COPY package.json package-lock.json ./

RUN npm ci

# Development stage
FROM dependencies AS development

ENV NODE_ENV develop

COPY . .

# Use bind mounts for development
RUN --mount=type=bind,source=.,target=/usr/src/app \
    --mount=type=cache,target=/root/.npm \
    npm i

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production stage
FROM dependencies AS production

ENV NODE_ENV production

COPY . .

RUN npm ci --omit=dev

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
