# Optional — Railway mặc định dùng Nixpacks (railway.toml)
# Dùng Debian slim vì bcrypt cần build native module
FROM node:22-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public

RUN mkdir -p src/uploads/avatars

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "src/server.js"]
