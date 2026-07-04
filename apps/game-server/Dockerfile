FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY games ./games
COPY apps/game-server ./apps/game-server
RUN npm install --workspaces --if-present --include-workspace-root
RUN npm run build --workspace apps/game-server

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/game-server/dist ./dist
COPY --from=build /repo/apps/game-server/package.json ./package.json
COPY --from=build /repo/node_modules ./node_modules
EXPOSE 2567
CMD ["node", "dist/index.js"]
