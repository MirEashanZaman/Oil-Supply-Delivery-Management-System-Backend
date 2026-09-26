# Multi-stage Dockerfile for NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy application source
COPY . .

# Build application
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled build and uploads directory
COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads

EXPOSE 8000

CMD ["node", "dist/main"]
