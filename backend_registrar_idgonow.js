const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/registrar', upload.single('Foto'), async (req, res) => {
    try {
        const datos = req.body;
        const archivo = req.file;  // Aquí está el archivo de imagen
        const tokenEdicion = uuidv4();

        const campos = {
            ...datos,
            token_edicion: tokenEdicion
        };

        // Si hay imagen, la adjuntamos
        if (archivo) {
            campos["Foto"] = [
                {
                    name: archivo.originalname,
                    data: archivo.buffer.toString('base64')
                }
            ];
        }

        const nuevoRegistro = { fields: campos };

        const respuesta = await axios.post(
            'https://idgonow.up.railway.app/api/v2/tables/m1ebsgkhbspdiqq/records',
            nuevoRegistro,
            {
                headers: {
                    'xc-token': process.env.NOCODB_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
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
