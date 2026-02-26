# Usar una imagen oficial de Node.js.
# La versión 'slim' es más ligera.
FROM node:18-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar dependencias del sistema operativo: Python y pip son necesarios para yt-dlp
# apt-get update && apt-get install -y --no-install-recommends: Actualiza la lista de paquetes e instala los paquetes sin recomendar otros adicionales.
# python3 pip: Instala Python 3 y su gestor de paquetes pip.
# rm -rf /var/lib/apt/lists/*: Limpia la caché de apt para mantener la imagen pequeña.
RUN apt-get update && apt-get install -y --no-install-recommends python3 pip && rm -rf /var/lib/apt/lists/*

# Copiar el package.json y package-lock.json (si existe)
# Esto aprovecha el caché de capas de Docker. Si estos archivos no cambian,
# no se reinstalarán las dependencias en cada build.
COPY package*.json ./

# Instalar solo las dependencias de producción
RUN npm install --production

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# El comando para iniciar la aplicación
CMD [ "npm", "start" ]
