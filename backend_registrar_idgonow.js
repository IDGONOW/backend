const express = require('express');
const cors = require('cors');
const multer = require('multer'); // ← FALTABA ESTA LÍNEA
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/registrar', upload.single('Foto'), async (req, res) => {
    try {
        const datos = req.body;
        const foto = req.file;
        const tokenEdicion = uuidv4();

        const formData = new FormData();

        // Añadir todos los campos del body al formData
        for (const key in datos) {
            formData.append(key, datos[key]);
        }

        // Añadir el token y tag
        formData.append('token_edicion', tokenEdicion);
        formData.append('tag', datos.tag);

        // Adjuntar la foto si existe
        if (foto) {
            formData.append('Foto', foto.buffer, {
                filename: foto.originalname,
                contentType: foto.mimetype
            });
        }

        const respuesta = await axios.post(
            'https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records',
            formData,
            {
                headers: {
                    'xc-token': process.env.NOCODB_TOKEN,
                    ...formData.getHeaders()
                }
            }
        );

        const idRegistro = respuesta.data.id;

        // Confirmar que el tag se guarda (si no se guarda por el formData anterior)
        await axios.patch(
            `https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records/${idRegistro}`,
            { fields: { tag: datos.tag } },
            {
                headers: {
                    'xc-token': process.env.NOCODB_TOKEN
                }
            }
        );

        res.json({ success: true, token: tokenEdicion });
    } catch (err) {
        console.error('Error al registrar los datos:', err.message);
        res.status(500).json({ success: false, error: 'Error al registrar los datos.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
});

