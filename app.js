const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Usuarios guardados en memoria (en producción, usa una base de datos)
const users = [];

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'your-secret-key', // lo mejor ponerlo en un .env
    resave: false,
    // Solo se crea la sesión (y su cookie) cuando hay algo que guardar, es decir, tras el login
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60    // 1 hora
    }
}));

// Página de login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Página de registro
app.get('/register', (req, res) => {
    res.redirect('/register.html');
});

// Registro de usuarios
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Comprobar si el usuario ya existe
        if (users.find(user => user.username === username)) {
            return res.status(400).send('El nombre de usuario ya existe');
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Guardar el usuario
        users.push({
            username,
            password: hashedPassword
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error al registrar el usuario');
    }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Buscar el usuario
        const user = users.find(user => user.username === username);
        
        if (!user) {
            // Mismo mensaje exista o no el usuario: no se revela qué usuarios están registrados
            return res.status(401).send('Usuario o contraseña incorrectos');
        }

        // Comprobar la contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).send('Usuario o contraseña incorrectos');
        }

        // Guardar la sesión
        req.session.user = username;
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Error al iniciar sesión');
    }
});

// Escapar los caracteres especiales de HTML antes de insertar datos del usuario en una página
function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

// Ruta del dashboard (protegida)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.send(`¡Bienvenido/a ${escapeHtml(req.session.user)}! Has iniciado sesión.`);
});

// Cierre de sesión
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Servidor en marcha en http://localhost:${port}`);
});
