# session-auth

Ejemplo de autenticación basada en sesiones: Express, express-session y bcryptjs.

Hay dos ramas:

- `main`: los usuarios se guardan en memoria.
- `mongo`: los usuarios y las sesiones se guardan en MongoDB.

En esta rama (`main`): los usuarios se guardan en memoria (se pierden al reiniciar el servidor).

## Requisitos

- Node.js 18 o superior

## Arrancar

```bash
npm ci
node app.js
```

Abre http://localhost:3000.

## Notas de seguridad

- Las contraseñas se guardan con hash mediante bcryptjs, nunca en texto plano.
- El login da el mismo mensaje si el usuario no existe y si la contraseña es incorrecta, para no revelar qué usuarios están registrados.
- `saveUninitialized: false`: la sesión (y la cookie) solo se crea después de iniciar sesión.
- El nombre de usuario se escapa antes de insertarlo en el HTML (para evitar XSS).
- La cookie de sesión es `httpOnly` (no accesible desde JavaScript) y caduca a la hora (`maxAge`).
- El cierre de sesión es `POST /logout` (no GET), para que un enlace o imagen de otra página no pueda cerrar la sesión.
- El secreto de la sesión (`your-secret-key`) es un ejemplo: en un proyecto real debe leerse de una variable de entorno (por ejemplo, un `.env`).
