const FormData = require('form-data'); // Asegúrate de tener esto arriba

// ...

if (fotoArchivo) {
  const formData = new FormData();
  formData.append('file', fotoArchivo.buffer, {
    filename: fotoArchivo.originalname,
    contentType: fotoArchivo.mimetype
  });

  const uploadFoto = await axios.post(
    'https://idgonow.up.railway.app/api/v2/assets',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'xc-token': process.env.NOCODB_TOKEN
      }
    }
  );

  urlFoto = uploadFoto.data.downloadUrl;
}

