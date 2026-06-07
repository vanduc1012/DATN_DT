FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_URL_IMAGE
ARG VITE_CLIENT_ID
ARG VITE_SECRET_CRYPTO

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_URL_IMAGE=$VITE_URL_IMAGE
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_SECRET_CRYPTO=$VITE_SECRET_CRYPTO

RUN npm run build && npm cache clean --force

FROM node:22-alpine AS run
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
USER node
EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-8080}"]
