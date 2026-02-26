const express = require('express');
const youtubedl = require('youtube-dl-exec');
const app = express();
const port = 3000;

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

    // 1. Obtener los metadatos del video, incluido el título.
    const metadata = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    const videoTitle = metadata.title.replace(/[<>:"/\|?*]/g, '_'); // Sanitizar el nombre del archivo
    const safeFilename = `${videoTitle}.mp4`;

    console.log(`Título del video: ${metadata.title}`);
    console.log(`Nombre de archivo seguro: ${safeFilename}`);
    
    // 2. Establecer las cabeceras para forzar la descarga en el navegador.
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    // 3. Obtener el stream del video en formato MP4 y canalizarlo a la respuesta.
    const downloadStream = youtubedl.exec(videoUrl, {
      output: '-', // Enviar a stdout
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      noWarnings: true,
      preferFreeFormats: true,
    });

    console.log(`Iniciando streaming del video ${videoId} al cliente.`);

    // 4. Canalizar el stream de descarga directamente a la respuesta HTTP.
    downloadStream.stdout.pipe(res);

    downloadStream.stdout.on('end', () => {
      console.log(`Streaming del video ${videoId} finalizado.`);
    });

    downloadStream.stderr.on('data', (data) => {
      // yt-dlp a veces envía información de progreso a stderr, lo registramos por si acaso.
      console.error(`yt-dlp stderr: ${data}`);
    });

    downloadStream.on('error', (err) => {
      console.error(`Error durante el streaming del video ${videoId}:`, err);
      if (!res.headersSent) {
        res.status(500).send('Error al procesar el video.');
      }
    });

    res.on('close', () => {
        // Si el cliente cierra la conexión (cancela la descarga), terminamos el proceso de yt-dlp
        console.log(`El cliente cerró la conexión. Terminando el proceso de yt-dlp para ${videoId}.`);
        downloadStream.kill();
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
