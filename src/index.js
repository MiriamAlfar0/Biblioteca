import express from 'express';
import http from 'http';
import session from 'express-session';
import morgan from 'morgan';
import { engine } from 'express-handlebars';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import librosRoutes from './routes/libros.routes.js';
import { Server } from 'socket.io';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const server = http.createServer(app);
const io = new Server(server);

const socketToUsername = {};

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('set username', (username) => {
    socketToUsername[socket.id] = username;
    io.emit('user joined', { userId: socket.id, username });
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', { userId: socket.id, username: socketToUsername[socket.id], msg });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
    const username = socketToUsername[socket.id];
    delete socketToUsername[socket.id];
    io.emit('user disconnected', { userId: socket.id, username });
  });
});



app.use(session({
    secret: 'secretsoftware',
    resave: false,
    saveUninitialized: false,
}));

app.set('port', process.env.PORT || 3000);
app.set('views', join(__dirname, 'views'));

app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: join(app.get('views'), 'layouts'),
    partialsDir: join(app.get('views'), 'partials'),
    extname: '.hbs',
}));
app.set('view engine', '.hbs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
    if (req.session.usuarioId) {
        res.redirect('/lista');
    } else {
        res.redirect('/login');
    }
});

app.use('/', librosRoutes);

app.use(express.static(join(__dirname, 'public')));

server.listen(app.get('port'), () =>
    console.log('Server listening on port', app.get('port')));