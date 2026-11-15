const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost/auth_demo').then(() => {
    console.log('Conectado a MongoDB correctamente.');
}).catch((error) => {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    // Solo se crea la sesión (y su cookie) cuando hay algo que guardar, es decir, tras el login
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost/auth_demo',
        ttl: 24 * 60 * 60 // 1 día
    })
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
        
        if (!username || !password) {
            console.log('Faltan el usuario o la contraseña');
            return res.status(400).send('El usuario y la contraseña son obligatorios');
        }

        // Comprobar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('El nombre de usuario ya existe:', username);
            return res.status(400).send('El nombre de usuario ya existe');
        }

        // Crear el nuevo usuario
        const user = new User({ username, password });
        try {
            await user.save();
            console.log('Usuario registrado correctamente:', username);
            res.redirect('/');
        } catch (saveError) {
            console.error('Error al guardar el usuario:', saveError);
            res.status(500).send('Error al guardar el usuario');
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).send('Error al registrar el usuario');
    }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Buscar el usuario
        const user = await User.findOne({ username });
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
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Servidor en marcha en http://localhost:${port}`);
});
