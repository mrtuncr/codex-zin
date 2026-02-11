FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ai/package.json ./packages/ai/package.json
COPY packages/database/package.json ./packages/database/package.json
RUN pnpm install --no-frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @zin/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "apps/web", "-p", "3000"]
