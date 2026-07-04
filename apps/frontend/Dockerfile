FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend
RUN npm install --workspaces --if-present --include-workspace-root
RUN npm run build --workspace apps/frontend

FROM nginx:alpine
COPY --from=build /repo/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
