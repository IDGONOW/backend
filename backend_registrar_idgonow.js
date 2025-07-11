const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

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
      const form = new FormData();
      form.append('files', fotoArchivo.buffer, {
        filename: fotoArchivo.originalname,
        contentType: fotoArchivo.mimetype
      });

      const uploadFoto = await axios.post(
        'https://idgonow.up.railway.app/api/v1/files/upload',
        form,
        {
          headers: {
            Authorization: `Bearer ${process.env.NOCODB_TOKEN}`,
            ...form.getHeaders()
          }
        }
      );

      urlFoto = uploadFoto.data[0]?.url || '';
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


