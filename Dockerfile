FROM node:22-alpine AS build

WORKDIR /app
ENV CI=true

# Easypanel fornece as variáveis do serviço também como build args. Vite as
# incorpora no bundle, portanto somente valores públicos usam o prefixo VITE_.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_N8N_CREATE_ORDER_WEBHOOK_URL
ARG VITE_ORDER_SIMULATION=false
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_N8N_CREATE_ORDER_WEBHOOK_URL=$VITE_N8N_CREATE_ORDER_WEBHOOK_URL \
    VITE_ORDER_SIMULATION=$VITE_ORDER_SIMULATION

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.d/40-runtime-env.sh /docker-entrypoint.d/40-runtime-env.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
