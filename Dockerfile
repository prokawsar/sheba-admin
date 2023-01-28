
FROM node:12.12.0-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .
RUN npm run build:dist

FROM node:12.12.0-alpine
# USER node:node
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["node","build"]