const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Permitir solicitudes desde tu frontend
app.use(cors({
  origin: 'https://idgonow.vermontec.pe'
}));

// ✅ Configuración para recibir archivos (como la foto)
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/registrar', upload.single('Foto'), async (req, res) => {
  try {
    const datos = req.body;
    const tokenEdicion = uuidv4();

    // Preparar payload para NocoDB
    const formData = new FormData();
    for (const key in datos) {
      formData.append(`fields[${key}]`, datos[key]);
    }

    // Añadir campos especiales
    formData.append("fields[token_edicion]", tokenEdicion);
    formData.append("fields[tag]", datos.tag);

    // Adjuntar imagen si existe
    if (req.file) {
      formData.append("files[Foto]", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    }

    // ✅ Enviar a NocoDB
    const respuesta = await axios.post(
      'https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records',
      formData,
      {
        headers: {
          'xc-token': process.env.NOCODB_TOKEN,
          ...formData.getHeaders(),
        },
      }
    );

    res.json({ success: true, token: tokenEdicion });

  } catch (err) {
    console.error('Error al registrar:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: 'Error al registrar los datos.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend IDGoNow activo en puerto ${port}`);
});


