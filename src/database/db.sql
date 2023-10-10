


CREATE DATABASE Biblioteca

USE Biblioteca;

CREATE TABLE libros(
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    autor VARCHAR(255),
    fecha_publicacion DATE,
    disponibilidad BOOLEAN
);

SELECT * FROM libros;



/* tabla de usuarios*/

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);
