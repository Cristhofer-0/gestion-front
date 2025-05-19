// lib/uploadImage.ts

export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/api/multimedia/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text(); 
      throw new Error('Error al subir la imagen');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return null;
  }
}
