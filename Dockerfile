FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Crea el grupo de sistema y el usuario con su home
RUN groupadd -r lgfdev \
 && useradd -rm -g lgfdev lgfdev

USER lgfdev

WORKDIR /app

# Application dependencies
COPY --chown=lgfdev:lgfdev package*.json ./
RUN npm ci

COPY --chown=lgfdev:lgfdev . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]