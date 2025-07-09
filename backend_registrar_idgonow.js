
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer();

app.post('/registrar', upload.none(), async (req, res) => {
    try {
        const datos = req.body;
        const tokenEdicion = uuidv4();

        const nuevoRegistro = {
            fields: {
                ...datos,
                token_edicion: tokenEdicion
            }
        };

        const respuesta = await axios.post(
            'https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records',
            nuevoRegistro,
            { headers: { 'xc-token': process.env.NOCODB_TOKEN } }
        );

        const idRegistro = respuesta.data.id;
        const tag = datos.tag;

        await axios.patch(
            `https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records/${idRegistro}`,
            { fields: { tag: tag } },
            { headers: { 'xc-token': process.env.NOCODB_TOKEN } }
        );

        res.json({ success: true, token: tokenEdicion });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al registrar los datos.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
});
