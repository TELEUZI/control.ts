FROM node:21.7.2-alpine AS base
WORKDIR /control.ts
RUN apk add --no-cache libc6-compat && corepack enable && corepack use pnpm@9.0.1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS builder
COPY package.json .
COPY pnpm-lock.yaml .
COPY . .
RUN pnpm install -g turbo@1.13.3-canary.3 && turbo --version &&  turbo prune --docker @control.ts/storybook

FROM base AS installer
COPY --from=builder /control.ts/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /control.ts/out/full .
RUN npx turbo build --filter=@control.ts/storybook

FROM base AS runner
COPY --from=installer /control.ts/apps/storybook/ ./apps/storybook
COPY --from=installer /control.ts/node_modules ./node_modules
COPY --from=installer /control.ts/packages ./packages
EXPOSE 3000
CMD pnpm run --dir ./apps/storybook dev
