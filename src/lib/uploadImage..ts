// lib/uploadImage.ts

export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/multimedia/upload-image`, {
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
