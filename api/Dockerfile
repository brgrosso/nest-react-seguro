FROM node:22-alpine AS build
WORKDIR /app
COPY package.json prisma.config.ts ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
RUN mkdir /data && chown app:app /data
USER app
EXPOSE 3002
CMD ["node", "dist/main.js"]
