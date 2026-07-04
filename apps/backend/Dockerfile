FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY games ./games
COPY apps/backend ./apps/backend
RUN npm install --workspaces --if-present --include-workspace-root
RUN npm run build --workspace apps/backend

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/backend/dist ./dist
COPY --from=build /repo/apps/backend/package.json ./package.json
COPY --from=build /repo/node_modules ./node_modules
RUN mkdir -p ./uploads
VOLUME ["/app/uploads"]
EXPOSE 4000
CMD ["node", "dist/main.js"]
