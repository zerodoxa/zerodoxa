# syntax=docker/dockerfile:1
# 1. Base image for shared layers
FROM node:20-bullseye-slim AS base
# Install qpdf and poppler-utils at the base level so it's available in all stages (needed for runtime too)
RUN apt-get update && apt-get install -y qpdf poppler-utils && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run the build process (Next.js production build)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 4. Production stage (Runner)
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Security: Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy built artifacts from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Next.js standalone output automatically copies necessary node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Verify qpdf is available during startup
CMD qpdf --version && node server.js
