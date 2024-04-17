FROM node:21.7.2-alpine AS base
WORKDIR /control.ts
RUN apk add --no-cache libc6-compat
RUN corepack enable
RUN corepack use pnpm@9.0.1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS builder
RUN pnpm install -g turbo
COPY package.json .
COPY pnpm-lock.yaml .
COPY . .
RUN turbo prune --docker @control.ts/storybook

FROM base as installer
RUN pnpm install -g turbo
COPY --from=builder /control.ts/out/json/ .
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /control.ts/out/full .
RUN turbo build
RUN pnpm run --dir ./apps/storybook build-storybook

FROM base AS runner
COPY --from=installer /control.ts/apps/storybook/ ./apps/storybook
COPY --from=installer /control.ts/node_modules ./node_modules
EXPOSE 3000
CMD pnpm run --dir ./apps/storybook preview
