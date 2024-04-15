FROM node:20-alpine AS base

RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS builder
WORKDIR /control.ts

COPY package.json .
COPY pnpm-lock.yaml .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN apk add --no-cache libc6-compat

RUN pnpm install -g turbo

COPY . .

RUN turbo prune --scope @control.ts/storybook --docker

FROM base AS runner

WORKDIR /control.ts

COPY --from=builder /control.ts/out/full .
COPY turbo.json turbo.json

EXPOSE 6006
CMD pnpm --dir ./apps/storybook/ run dev
