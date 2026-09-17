# ---- build ----
FROM public.ecr.aws/docker/library/node:20-slim AS base

RUN corepack enable
WORKDIR /repo

# Manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY packages/biome/package.json ./packages/biome/package.json

RUN pnpm install --frozen-lockfile

# Source
COPY apps/api ./apps/api
COPY packages/tsconfig ./packages/tsconfig
COPY packages/biome ./packages/biome

# Build
RUN pnpm --filter @root/api build

# Production dependencies
RUN pnpm --filter @root/api deploy --prod --legacy /prod/api

# Application build
RUN cp -r apps/api/dist /prod/api/dist


# ---- runtime ----
FROM public.ecr.aws/docker/library/node:20-slim AS runtime

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 \
    /lambda-adapter \
    /opt/extensions/lambda-adapter

ENV PORT=8080
ENV NODE_ENV=production

WORKDIR /var/task
COPY --from=base /prod/api ./
CMD ["node", "--enable-source-maps", "dist/server.js"]