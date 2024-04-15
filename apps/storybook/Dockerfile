FROM node:20-alpine AS base

RUN corepack enable

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /control.ts

COPY package.json .
COPY pnpm-lock.yaml .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm install -g turbo

COPY . .

RUN turbo prune --scope @control.ts/storybook --docker
RUN pnpm i
RUN pnpm --dir ./apps/storybook run build-storybook

FROM base AS runner
WORKDIR /control.ts

COPY --from=builder /control.ts/out/full .
COPY turbo.json turbo.json

EXPOSE 8080
CMD npx http-server /control.ts/out/full/storybook-static
