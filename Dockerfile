FROM public.ecr.aws/docker/library/node:20-slim AS base
WORKDIR /repo
RUN corepack enable

FROM base AS installer
COPY . .

FROM installer AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm --filter @root/api build
RUN pnpm --filter @root/api deploy --prod --legacy /prod/api

FROM public.ecr.aws/docker/library/node:20-slim AS runtime
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 \
    /lambda-adapter \
    /opt/extensions/lambda-adapter
ENV PORT=8080
ENV NODE_ENV=production
WORKDIR /var/task
COPY --from=build /prod/api ./
CMD ["node", "--enable-source-maps", "dist/server.js"]