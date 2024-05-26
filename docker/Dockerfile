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
####
FROM nginx:stable

RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y \
    curl \
    htop  \
    vim  \
    && rm -rf /var/lib/apt/lists/*

# copy config as root
COPY docker/nginx /etc/nginx

USER nginx
COPY dist /usr/share/nginx/html
