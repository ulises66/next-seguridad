# -------- deps --------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# -------- build --------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Si usas Tailwind/Playwright/etc., asegúrate de que no fallen en build
RUN npm run build

# -------- run (standalone) --------
# Si usas output: 'standalone', copiamos solo lo mínimo
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copia lo generado por Next standalone
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
# El standalone trae server.js en la raíz
CMD ["node", "server.js"]
