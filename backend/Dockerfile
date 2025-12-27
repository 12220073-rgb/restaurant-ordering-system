FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

ENV NODE_ENV=production

# Railway provides PORT at runtime; your app uses process.env.PORT
CMD ["npm", "start"]
