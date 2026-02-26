# YouTube Downloader Backend

## Descripción

Backend en Node.js que proporciona una API REST simple para descargar videos de YouTube en formato MP4. Este servidor funciona como intermediario entre una extensión de Chrome y la herramienta `yt-dlp`, permitiendo descargar videos directamente desde el navegador.

## ¿Para qué sirve?

- **Descargar videos de YouTube**: Obtén videos en calidad MP4 directamente desde tu navegador
- **API REST**: Proporciona un endpoint simple para procesar descargas
- **CORS habilitado**: Compatible con extensiones de Chrome y aplicaciones web
- **Streaming de video**: El video se descarga directamente al navegador sin necesidad de almacenamiento temporal

## Requisitos

- Node.js (v18 o superior)
- Python 3 con `yt-dlp` instalado
- Express.js (se instala automáticamente)
- CORS middleware (se instala automáticamente)

## Instalación

```bash
# Instalar dependencias de Node.js
npm install

# Instalar yt-dlp (si no lo tienes)
python -m pip install yt-dlp
```

## Uso

### Opción 1: Ejecutar como servidor Node.js

```bash
npm start
```

El servidor escuchará en `http://localhost:3000`

### Opción 2: Ejecutar como aplicación Windows (.exe)

```bash
dlybke.exe
```

## API Endpoints

### GET `/`

Verifica que el servidor está funcionando.

**Respuesta:**
```
Servidor de descarga de YouTube funcionando. Usa el endpoint /download?videoId=YOUR_VIDEO_ID
```

### GET `/download?videoId=VIDEO_ID`

Descarga un video de YouTube en formato MP4.

**Parámetros:**
- `videoId` (requerido): El ID del video de YouTube
  - Ejemplo: `eFUzj06Mgag` para https://www.youtube.com/watch?v=eFUzj06Mgag

**Respuesta:**
- El video en formato MP4 se descargará automáticamente a tu carpeta de descargas
- El nombre del archivo será el título del video (sanitizado)

**Ejemplo de uso:**
```
http://localhost:3000/download?videoId=eFUzj06Mgag
```

## Características

✅ **Soporte para caracteres especiales**: Maneja correctamente títulos en español y otros idiomas
✅ **Streaming directo**: No almacena videos en el servidor
✅ **Manejo de errores**: Proporciona mensajes de error detallados
✅ **CORS habilitado**: Funciona desde extensiones de Chrome
✅ **Executable stand-alone**: Disponible como `.exe` para Windows sin dependencias

## Estructura del proyecto

```
dlybke/
├── index.js           # Código principal del servidor
├── package.json       # Dependencias y configuración
├── package-lock.json  # Lock file
├── Dockerfile         # Configuración Docker (opcional)
├── dlybke.exe         # Ejecutable Windows compilado
└── README.md          # Este archivo
```

## Desarrollo local

Para desarrollo, ejecuta con logs detallados:

```bash
node index.js
```

Verás los logs del servidor en la consola:
- Indicará cuándo un video está siendo procesado
- Mostrará el título del video descargado
- Informará del progreso de la descarga

## Solución de problemas

### Error: "yt-dlp not found"
Asegúrate de instalar yt-dlp:
```bash
python -m pip install yt-dlp
```

### Error: "Port 3000 already in use"
Cambia el puerto en `index.js` o termina el proceso que usa el puerto:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### El video no se descarga
- Verifica que el ID de video sea válido
- Asegúrate de que el video existe y es accesible
- Revisa los logs del servidor para más detalles

## Licencia

ISC

## Autor

Desarrollado como herramienta de descarga de YouTube.
