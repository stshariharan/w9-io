# -----------------------------
# 1. Build Stage
# -----------------------------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Install deps first (better caching)
    COPY package*.json tsconfig.json ./
    RUN npm install --production=false

    # Copy source
    COPY . .
    
    # Build with tsup
    RUN npm run build
    
    # -----------------------------
    # 2. Runtime Stage
    # -----------------------------
    FROM node:20-alpine
    
    WORKDIR /app
    
    # Copy only runtime deps + dist
    COPY package*.json ./
    RUN npm install --omit=dev
    
    COPY --from=builder /app/dist ./dist
    
    # Copy certs or other assets if needed
    # COPY certs ./certs
    # TIMEZONE
    RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/America/New_York /etc/localtime \
    && echo "America/New_York" > /etc/timezone
    
    # Expose the app port (match your config.Port default: 3000)
    EXPOSE 3000
    

   COPY ../entrypoint.sh /usr/local/bin/entrypoint.sh
   RUN chmod +x /usr/local/bin/entrypoint.sh
   ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

    