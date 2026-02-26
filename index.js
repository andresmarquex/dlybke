const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();
const port = 3000;

app.use(cors()); // Habilitar CORS para permitir peticiones desde la extensión de Chrome

app.get('/', (req, res) => {
  res.send('Servidor de descarga de YouTube funcionando. Usa el endpoint /download?videoId=YOUR_VIDEO_ID');
});

app.get('/download', async (req, res) => {
  const videoId = req.query.videoId;

  if (!videoId) {
    return res.status(400).send('Error: Debes proporcionar un "videoId".');
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    console.log(`Iniciando obtención de metadatos para el video: ${videoId}`);

    // 1. Obtener los metadatos del video ejecutando yt-dlp directamente
    const metadata = await new Promise((resolve, reject) => {
      const process = spawn('python', [
        '-m', 'yt_dlp',
        '--dump-json',
        '--no-warnings',
        videoUrl
      ]);

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('yt-dlp stderr:', data.toString());
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`yt-dlp falló con código ${code}: ${errorOutput}`));
        } else {
          try {
            const json = JSON.parse(output);
            resolve(json);
          } catch (e) {
            reject(new Error(`Error al parsear JSON: ${e.message}`));
          }
        }
      });

      process.on('error', (err) => {
        reject(new Error(`Error ejecutando yt-dlp: ${err.message}`));
      });
    });

    console.log('Metadata recibida:', typeof metadata);
    
    if (!metadata || typeof metadata !== 'object') {
      throw new Error(`Metadata inválida: ${typeof metadata}`);
    }

    if (!metadata.title) {
      console.error('Metadata completa:', JSON.stringify(metadata, null, 2));
      throw new Error('El video no tiene título. Verifica que el ID sea válido.');
    }

    const videoTitle = metadata.title.replace(/[<>:"/\|?*]/g, '_'); // Sanitizar el nombre del archivo

    console.log(`Título del video: ${metadata.title}`);
    console.log(`Nombre de archivo seguro: ${videoTitle}.mp4`);
    
    // 2. Establecer las cabeceras para forzar la descarga en el navegador.
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(videoTitle)}.mp4`);

    // 3. Obtener el stream del video en formato MP4 y canalizarlo a la respuesta.
    console.log(`Iniciando descarga del video ${videoId}`);
    
    const downloadProcess = spawn('python', [
      '-m', 'yt_dlp',
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '-o', '-',
      '--no-warnings',
      videoUrl
    ]);

    // Canalizar el stream de descarga directamente a la respuesta HTTP
    downloadProcess.stdout.pipe(res);

    downloadProcess.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    downloadProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Descarga del video ${videoId} finalizó con código ${code}`);
      } else {
        console.log(`Descarga del video ${videoId} completada exitosamente`);
      }
    });

    downloadProcess.on('error', (err) => {
      console.error(`Error durante la descarga del video ${videoId}:`, err);
      if (!res.headersSent) {
        res.status(500).send('Error al procesar el video.');
      }
    });

    res.on('close', () => {
      console.log(`El cliente cerró la conexión. Terminando yt-dlp para ${videoId}.`);
      downloadProcess.kill();
    });

  } catch (error) {
    console.error(`Error al obtener la información del video ${videoId}:`, error);
    if (!res.headersSent) {
      res.status(500).send(`Error al obtener la información del video. ¿Es un ID válido? Detalles: ${error.message}`);
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
