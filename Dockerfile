# Use the official Bun image
FROM oven/bun:1

WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Fix permissions for database
# (Ideally, you'd mount this volume, but for initial copy this helps)
RUN chown -R bun:bun /usr/src/app/databases

# Switch to non-root user
USER bun

# Expose port (default 3000)
EXPOSE 3000

# Start development server
ENTRYPOINT [ "bun", "run", "dev" ]
