/**
 * compressImage.ts
 *
 * Comprime una imagen en el browser usando la API nativa de Canvas.
 * No requiere ninguna librería externa.
 *
 * ¿Cómo funciona?
 * 1. Carga el archivo en un elemento <img> temporal (en memoria, no visible)
 * 2. Dibuja esa imagen en un <canvas> respetando un tamaño máximo
 * 3. Exporta el canvas como WebP (o JPEG como fallback) con calidad reducida
 * 4. Devuelve un File listo para subir
 *
 * Resultado típico: foto de 4MB → ~200-400KB con buena calidad visual.
 */

interface CompressOptions {
  /** Ancho/alto máximo en px. La imagen se escala manteniendo proporción. Default: 1920 */
  maxDimension?: number;
  /** Calidad entre 0 y 1. 0.82 es un buen balance calidad/peso. Default: 0.82 */
  quality?: number;
  /** Formato de salida. WebP es más eficiente. Default: 'image/webp' */
  outputFormat?: 'image/webp' | 'image/jpeg';
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxDimension = 1920,
    quality = 0.82,
    outputFormat = 'image/webp',
  } = options;

  // Si el archivo ya es muy pequeño (menos de 200KB), no comprimimos
  // para no perder calidad innecesariamente
  if (file.size < 200 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();

    // Creamos una URL temporal en memoria para cargar la imagen
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Limpiamos la URL temporal (buena práctica para liberar memoria)
      URL.revokeObjectURL(objectUrl);

      // ── Calcular nuevas dimensiones manteniendo la proporción ──────────────
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      // ── Dibujar en canvas y exportar ───────────────────────────────────────
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No se pudo crear el contexto 2D del canvas'));

      ctx.drawImage(img, 0, 0, width, height);

      // toBlob es asíncrono; exporta los píxeles del canvas al formato elegido
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Error al comprimir la imagen'));

          // Determinamos la extensión según el formato de salida
          const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
          // Reemplazamos la extensión original por la nueva
          const newName = file.name.replace(/\.[^.]+$/, '') + '.' + ext;

          // Convertimos el Blob a File para poder subirlo con el mismo API
          resolve(new File([blob], newName, { type: outputFormat }));
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Si falla la compresión, devolvemos el original sin error
      // (mejor subir la foto grande que no subir nada)
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Comprime múltiples imágenes en paralelo.
 * Útil para la subida de álbumes.
 */
export async function compressImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
