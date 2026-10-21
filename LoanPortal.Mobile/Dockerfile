# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time,
# so they must be supplied as build args (not at container runtime).
ARG NEXT_PUBLIC_MUI_KEY
ARG NEXT_PUBLIC_FB_API_KEY
ARG NEXT_PUBLIC_FB_AUTH_DOMAIN
ARG NEXT_PUBLIC_FB_PROJECT_ID
ARG NEXT_PUBLIC_FB_STORAGE_BUCKET
ARG NEXT_PUBLIC_FB_MESSAGING_ID
ARG NEXT_PUBLIC_FB_APP_ID
ARG NEXT_PUBLIC_FB_MEASUREMENT_ID
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_AZURE_AD_TENANT_ID
ARG NEXT_PUBLIC_API_VAPID_KEY
ENV NEXT_PUBLIC_MUI_KEY=$NEXT_PUBLIC_MUI_KEY \
    NEXT_PUBLIC_FB_API_KEY=$NEXT_PUBLIC_FB_API_KEY \
    NEXT_PUBLIC_FB_AUTH_DOMAIN=$NEXT_PUBLIC_FB_AUTH_DOMAIN \
    NEXT_PUBLIC_FB_PROJECT_ID=$NEXT_PUBLIC_FB_PROJECT_ID \
    NEXT_PUBLIC_FB_STORAGE_BUCKET=$NEXT_PUBLIC_FB_STORAGE_BUCKET \
    NEXT_PUBLIC_FB_MESSAGING_ID=$NEXT_PUBLIC_FB_MESSAGING_ID \
    NEXT_PUBLIC_FB_APP_ID=$NEXT_PUBLIC_FB_APP_ID \
    NEXT_PUBLIC_FB_MEASUREMENT_ID=$NEXT_PUBLIC_FB_MEASUREMENT_ID \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_AZURE_AD_TENANT_ID=$NEXT_PUBLIC_AZURE_AD_TENANT_ID \
    NEXT_PUBLIC_API_VAPID_KEY=$NEXT_PUBLIC_API_VAPID_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["npm", "start"]
