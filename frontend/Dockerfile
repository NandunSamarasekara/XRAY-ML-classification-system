FROM node:20-alpine

WORKDIR /app

# Copy package files for better caching during npm install
COPY package.json package-lock.json* ./

# Install dependencies dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Run the dev server and bind to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]