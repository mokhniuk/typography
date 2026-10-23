# The website (apps/website) as a container: the engine builds the site, nginx serves it.
#
# This is the only deployable in the repository, which is why the file sits at the root: the build
# context must be the root, because the site imports the engine from `src/` and the docs pages are the
# repository's own Markdown.
#
#   docker build -t typography-website .
#   docker run --rm -p 8080:80 typography-website
#
# On a Docker host (Coolify and the like) nothing has to be configured but the domain: the container
# listens on port 80 and serves a finished static site. Set SITE_BASE as a build argument only if the
# site is served under a path rather than at the root of its host (see apps/website/build/site.ts).

FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# The dependencies first, so a change to the text does not reinstall them.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ARG SITE_BASE=/
ENV SITE_BASE=$SITE_BASE
RUN bun run website:build

FROM nginx:1.27-alpine
COPY apps/website/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/website/dist /usr/share/nginx/html
EXPOSE 80
