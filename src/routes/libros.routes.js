// src/routes/libros.routes.js

import express from 'express';
import session from 'express-session';
import pool from '../database.js';

const router = express.Router();

router.get('/add', (req, res) => {
    res.render('libros/add');
});



router.get('/', (req, res) => {
    const showNavbar = false; 
    res.render('auth/login', { showNavbar }); 
});


router.post('/add', async (req, res) => {
    try {
        const { titulo, autor, fecha_publicacion, disponibilidad } = req.body;
        const newLibro = {
            titulo, autor, fecha_publicacion, disponibilidad
        }
        await pool.query('INSERT INTO libros SET ?', [newLibro]);
        res.redirect('/lista');
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/lista', async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM libros');
        res.render('libros/lista', { libros: result });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [libro] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);
        const libroEdit = libro[0];
        res.render('libros/edit', { libro: libroEdit });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/edit/:id', async (req, res) => {
    try {
        const { titulo, autor, fecha_publicacion, disponibilidad } = req.body;
        const { id } = req.params;
        const editLibro = { titulo, autor, fecha_publicacion, disponibilidad };
        await pool.query('UPDATE libros SET ? WHERE id = ?', [editLibro, id]);
        res.redirect('/lista');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM libros WHERE id = ?', [id]);
        res.redirect('/lista');
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.use(session({
    secret: 'secretsoftware',
    resave: false,
    saveUninitialized: false,
}));


function requireAuth(req, res, next) {
    if (!req.session.usuarioId) {
        res.redirect('/login'); 
    } else {
        next();
    }
}


router.get('/index', (req, res) => {
    res.render('index'); 
});


router.get('/', (req, res) => {
    res.redirect('/login');
});



router.get('/login', (req, res) => {
    if (req.session.usuarioId) {
        res.redirect('/index'); 
    } else {
        res.render('auth/login', { mensajeError: '', showNavbar: false }); 
    }
});




router.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo_electronico = ?', [correo]);

        if (rows.length === 1) {
            const usuario = rows[0]; 

            if (contrasena === usuario.contrasena) {
                req.session.usuarioId = usuario.id; 
                res.redirect('/index');
            } else {
                res.render('auth/login', { mensajeError: 'Correo o contraseña incorrecta' });
            }
        } else {
            res.render('auth/login', { mensajeError: 'Correo o contraseña incorrecta' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});


router.get('/lista', requireAuth, async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM libros');
        res.render('libros/lista', { libros: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});


router.post('/logout', (req, res) => {
    
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});


router.get('/reporte', requireAuth, async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM libros WHERE disponibilidad = true');
        res.render('reporte', { libros: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.get('/register', (req, res) => {
    res.render('auth/register', { mensajeError: '', showNavbar: false });
});


router.post('/register', async (req, res) => {
    try {
        const { nombre, correo_electronico, contrasena } = req.body;
        const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE correo_electronico = ?', [correo_electronico]);

        if (existingUser.length > 0) {
            return res.render('auth/register', { mensajeError: 'El correo electrónico ya está en uso.' });
        }
        await pool.query('INSERT INTO usuarios (nombre, correo_electronico, contrasena) VALUES (?, ?, ?)', [nombre, correo_electronico, contrasena]);
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

export default router;
