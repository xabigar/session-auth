# session-auth

Ejemplo de autenticación basada en sesiones: Express, express-session y bcryptjs.

Hay dos ramas:

- `main`: los usuarios se guardan en memoria.
- `mongo`: los usuarios y las sesiones se guardan en MongoDB.

En esta rama (`mongo`): los usuarios se guardan en MongoDB (Mongoose) y las sesiones también (connect-mongo, caducan al cabo de 1 día).

## Requisitos

- Node.js 18 o superior
- MongoDB, en la dirección `mongodb://localhost/auth_demo`

## Arrancar

```bash
npm ci
node app.js
```

Abre http://localhost:3000.

## Notas de seguridad

- Las contraseñas se guardan con hash mediante bcryptjs (en el modelo `User`, antes de guardar), nunca en texto plano.
- El registro exige usuario y contraseña (no pueden estar vacíos).
- El login da el mismo mensaje si el usuario no existe y si la contraseña es incorrecta, para no revelar qué usuarios están registrados.
- `saveUninitialized: false`: la sesión (y la cookie) solo se crea después de iniciar sesión.
- El nombre de usuario se escapa antes de insertarlo en el HTML (para evitar XSS).
- El secreto de la sesión (`your-secret-key`) es un ejemplo: en un proyecto real debe leerse de una variable de entorno (por ejemplo, un `.env`). Lo mismo vale para la dirección de MongoDB.
