FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Create the system group and the user with their home
RUN groupadd -r appuserdev \
 && useradd -rm -g appuserdev appuserdev

USER appuserdev

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY --chown=appuserdev:appuserdev package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application's code
COPY --chown=appuserdev:appuserdev . .

# Run the app in development mode
CMD ["npm", "run", "start:dev"]