####
# This Dockerfile is used in order to build a container that runs the remsfal application in production mode
#
# Before building the container image run:
#
# npm run build
#
# Then, build the image with:
#
# docker build -f docker/Dockerfile -t remsfal/frontend:dev .
#
# Then run the container using:
#
# docker run -i --rm -p 8080:80 remsfal/frontend:dev
#
# Runtime configuration (environment variables, rendered from docker/nginx/templates/ at start):
#
#   REMSFAL_APP_MODE  CONSTRUCTION | MAINTENANCE | PRODUCTION (default: PRODUCTION)
#   NGINX_PORT        port nginx listens on (default: 80; use e.g. 8080 for non-root without capabilities)
#
# docker run -i --rm -p 8080:80 -e REMSFAL_APP_MODE=CONSTRUCTION remsfal/frontend:dev
#
# With a read-only root filesystem, /etc/nginx/conf.d and /tmp must be writable mounts (e.g. emptyDir).
#
####
FROM nginx:stable

# use only label confrorm to OCI specifications https://github.com/opencontainers/image-spec/blob/main/annotations.md
LABEL org.opencontainers.image.authors="REMSFAL maintainers <info@remsfal.de>" \
      org.opencontainers.image.vendor="REMSFAL Immobiliensoftware GmbH <info@remsfal.online>" \
      org.opencontainers.image.title="REMSFAL Frontend" \
      org.opencontainers.image.url="https://github.com/remsfal/remsfal-frontend"

RUN apt-get update && apt-get upgrade -y \
    && apt-get --no-install-recommends install -y \
    htop  \
    vim  \
    && rm -rf /var/lib/apt/lists/*

# copy config as root; the entrypoint renders the templates into conf.d as user nginx
COPY docker/nginx /etc/nginx
RUN rm -f /etc/nginx/conf.d/default.conf && chown nginx:nginx /etc/nginx/conf.d

ENV REMSFAL_APP_MODE=PRODUCTION \
    NGINX_PORT=80

USER nginx
COPY dist /usr/share/nginx/html
