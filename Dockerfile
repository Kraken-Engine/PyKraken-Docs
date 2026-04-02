FROM node:25-bookworm AS builder

WORKDIR /app

RUN npm install -g pnpm@10.27.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:25-bookworm-slim AS runner

WORKDIR /app

RUN npm install -g pnpm@10.27.0

COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "start"]