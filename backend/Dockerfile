FROM node:20

WORKDIR /backend

# Install system dependencies required for Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libdrm2 \
    libxkbcommon0 \
    libasound2 \
    libx11-xcb1 \
    libxcursor1 \
    libgtk-3-0 \
    && apt-get clean

RUN npm install -g pnpm

RUN npx playwright install

COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

COPY ./ ./

RUN pnpm i playwright

RUN pnpm i uuid

RUN npm run build

EXPOSE 5001

CMD ["pnpm", "run", "start:prod"]