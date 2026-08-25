FROM node:24-alpine

WORKDIR /app

RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
RUN corepack pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["corepack", "pnpm", "dev", "--", "--host", "0.0.0.0"]
