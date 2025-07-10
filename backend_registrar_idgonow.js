const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/registrar', upload.single('Foto'), async (req, res) => {
  try {
    const datos = req.body;
    const tokenEdicion = uuidv4();

    const fotoArchivo = req.file;
    let urlFoto = '';

    if (fotoArchivo) {
      const uploadFoto = await axios.post(
        'https://idgonow.up.railway.app/api/v2/assets',
        fotoArchivo.buffer,
        {
          headers: {
            'Content-Type': fotoArchivo.mimetype,
            'xc-token': process.env.NOCODB_TOKEN,
            'Content-Disposition': `attachment; filename="${fotoArchivo.originalname}"`
          }
        }
      );

      urlFoto = uploadFoto.data.downloadUrl;
    }

    const nuevoRegistro = {
      fields: {
        ...datos,
        token_edicion: tokenEdicion,
        Foto: urlFoto
      }
    };

    const respuesta = await axios.post(
      'https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records',
      nuevoRegistro,
      {
        headers: {
          'xc-token': process.env.NOCODB_TOKEN
        }
      }
    );

    res.json({ success: true, token: tokenEdicion });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ success: false, error: 'Error al registrar los datos.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});

