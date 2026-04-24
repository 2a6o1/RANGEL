FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo tsx para el servidor)
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos el frontend (React)
RUN npm run build

# Exponemos el puerto que usará Railway
EXPOSE 8080

# Comando para iniciar el servidor de Node
# Railway ignorará el EXPOSE y usará la variable PORT automáticamente
CMD ["npx", "tsx", "server/index.ts"]
