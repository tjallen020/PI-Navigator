# Multi-stage build for QI Tool Selector
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm install

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/build ./apps/backend/build
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
ENV PORT=4000
EXPOSE 4000
CMD ["node", "apps/backend/build/index.js"]
