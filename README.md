
# IDGoNow Backend

Este es un backend simple en Node.js que recibe los datos del formulario de IDGoNow, los guarda en NocoDB, asigna el `token_edicion` y actualiza el campo `tag`.

## Uso en Railway

1. Sube este proyecto como nuevo servicio.
2. En Railway, configura la variable de entorno `NOCODB_TOKEN` con tu token privado de acceso a NocoDB.
3. Railway asignará automáticamente la URL de acceso que puedes usar desde tu formulario HTML.

## Endpoint

POST /registrar
