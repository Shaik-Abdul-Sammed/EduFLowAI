FROM node:20-alpine

WORKDIR /app

# Copy package and npmrc configuration
COPY package*.json .npmrc* ./

# Install production dependencies with legacy peer deps resolution
RUN npm ci --legacy-peer-deps --only=production || npm install --legacy-peer-deps --only=production

# Copy source code and database migrations
COPY src ./src
COPY sql ./sql
COPY scripts ./scripts
COPY .env.example ./.env

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/server.js"]
