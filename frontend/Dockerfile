FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
# Optional: disable optimizeCss to avoid lightningcss issues
# RUN echo "module.exports = { experimental: { optimizeCss: false } };" > next.config.js
RUN npm rebuild
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]
