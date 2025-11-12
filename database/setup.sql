-- Crear base de datos para módulo de reportes
CREATE DATABASE IF NOT EXISTS reportes_db;
USE reportes_db;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    tipo ENUM('estudiante', 'instructor', 'admin') DEFAULT 'estudiante',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    instructor_id INT,
    categoria VARCHAR(100),
    duracion_horas INT DEFAULT 0,
    nivel ENUM('basico', 'intermedio', 'avanzado') DEFAULT 'basico',
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES usuarios(id)
);

-- Tabla de inscripciones
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completado DATETIME,
    progreso DECIMAL(5,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE,
    precio_pagado DECIMAL(10,2) DEFAULT 0.00,
    metodo_pago VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    UNIQUE KEY unique_inscripcion (usuario_id, curso_id)
);

-- Tabla de ventas
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL,
    curso_id INT NOT NULL,
    usuario_id INT NOT NULL,
    instructor_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    comision_instructor DECIMAL(10,2) DEFAULT 0.00,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'completada',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (instructor_id) REFERENCES usuarios(id)
);

-- Tabla de actividad de usuarios
CREATE TABLE actividad_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    curso_id INT,
    tipo_actividad ENUM('login', 'curso_iniciado', 'leccion_completada', 'curso_completado', 'descarga') NOT NULL,
    descripcion TEXT,
    fecha_actividad DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- Insertar datos de prueba

-- Usuarios (instructores y estudiantes)
INSERT INTO usuarios (nombre, email, tipo, activo, fecha_registro, fecha_ultimo_acceso) VALUES
('Ana García', 'ana.garcia@email.com', 'instructor', TRUE, '2024-01-15', '2024-11-12'),
('Carlos López', 'carlos.lopez@email.com', 'instructor', TRUE, '2024-02-20', '2024-11-11'),
('María González', 'maria.gonzalez@email.com', 'estudiante', TRUE, '2024-03-10', '2024-11-12'),
('Juan Pérez', 'juan.perez@email.com', 'estudiante', TRUE, '2024-03-15', '2024-11-10'),
('Laura Martín', 'laura.martin@email.com', 'estudiante', TRUE, '2024-04-01', '2024-11-12'),
('Pedro Sánchez', 'pedro.sanchez@email.com', 'estudiante', TRUE, '2024-04-15', '2024-11-09'),
('Isabel Torres', 'isabel.torres@email.com', 'instructor', TRUE, '2024-05-01', '2024-11-12'),
('Miguel Ruiz', 'miguel.ruiz@email.com', 'estudiante', TRUE, '2024-05-10', '2024-11-11'),
('Carmen Díaz', 'carmen.diaz@email.com', 'estudiante', TRUE, '2024-06-01', '2024-11-12'),
('Roberto Silva', 'roberto.silva@email.com', 'estudiante', TRUE, '2024-06-15', '2024-11-08');

-- Cursos
INSERT INTO cursos (titulo, descripcion, precio, instructor_id, categoria, duracion_horas, nivel, activo) VALUES
('React Fundamentals', 'Curso completo de React desde cero', 99.99, 1, 'Desarrollo Web', 40, 'basico', TRUE),
('Angular', 'Curso completo de Angular desde cero', 99.99, 1, 'Desarrollo Web', 40, 'basico', TRUE),
('Node.js Avanzado', 'Desarrollo backend con Node.js', 149.99, 1, 'Desarrollo Web', 60, 'avanzado', TRUE),
('Python para Data Science', 'Análisis de datos con Python', 199.99, 2, 'Data Science', 80, 'intermedio', TRUE),
('JavaScript Moderno', 'ES6+ y mejores prácticas', 79.99, 1, 'Desarrollo Web', 30, 'basico', TRUE),
('Machine Learning Básico', 'Introducción al ML', 249.99, 2, 'Data Science', 100, 'intermedio', TRUE),
('CSS Grid y Flexbox', 'Layout moderno en CSS', 59.99, 7, 'Desarrollo Web', 25, 'basico', TRUE),
('TypeScript Professional', 'TypeScript para proyectos grandes', 129.99, 7, 'Desarrollo Web', 45, 'avanzado', TRUE),
('MongoDB Práctico', 'Base de datos NoSQL', 89.99, 2, 'Bases de Datos', 35, 'intermedio', TRUE);

-- Inscripciones
INSERT INTO inscripciones (usuario_id, curso_id, fecha_inscripcion, fecha_completado, progreso, precio_pagado, metodo_pago) VALUES
(3, 1, '2024-07-01', '2024-08-15', 100.00, 99.99, 'tarjeta'),
(4, 1, '2024-07-05', NULL, 75.50, 99.99, 'paypal'),
(5, 2, '2024-07-10', '2024-09-20', 100.00, 149.99, 'tarjeta'),
(6, 3, '2024-07-15', NULL, 45.25, 199.99, 'transferencia'),
(3, 4, '2024-08-01', '2024-08-25', 100.00, 79.99, 'tarjeta'),
(8, 1, '2024-08-10', NULL, 60.75, 99.99, 'paypal'),
(9, 5, '2024-08-15', NULL, 30.50, 249.99, 'tarjeta'),
(10, 6, '2024-09-01', '2024-09-15', 100.00, 59.99, 'paypal'),
(4, 7, '2024-09-10', NULL, 85.25, 129.99, 'tarjeta'),
(5, 8, '2024-09-15', '2024-10-30', 100.00, 89.99, 'transferencia'),
(6, 1, '2024-10-01', NULL, 25.75, 99.99, 'tarjeta'),
(8, 3, '2024-10-05', NULL, 40.50, 199.99, 'paypal'),
(9, 4, '2024-10-10', '2024-11-01', 100.00, 79.99, 'tarjeta'),
(10, 2, '2024-10-15', NULL, 55.25, 149.99, 'transferencia'),
(3, 6, '2024-11-01', NULL, 80.75, 59.99, 'paypal');

-- Ventas
INSERT INTO ventas (inscripcion_id, curso_id, usuario_id, instructor_id, monto, comision_instructor, fecha_venta, metodo_pago) VALUES
(1, 1, 3, 1, 99.99, 69.99, '2024-07-01', 'tarjeta'),
(2, 1, 4, 1, 99.99, 69.99, '2024-07-05', 'paypal'),
(3, 2, 5, 1, 149.99, 104.99, '2024-07-10', 'tarjeta'),
(4, 3, 6, 2, 199.99, 139.99, '2024-07-15', 'transferencia'),
(5, 4, 3, 1, 79.99, 55.99, '2024-08-01', 'tarjeta'),
(6, 1, 8, 1, 99.99, 69.99, '2024-08-10', 'paypal'),
(7, 5, 9, 2, 249.99, 174.99, '2024-08-15', 'tarjeta'),
(8, 6, 10, 7, 59.99, 41.99, '2024-09-01', 'paypal'),
(9, 7, 4, 7, 129.99, 90.99, '2024-09-10', 'tarjeta'),
(10, 8, 5, 2, 89.99, 62.99, '2024-09-15', 'transferencia'),
(11, 1, 6, 1, 99.99, 69.99, '2024-10-01', 'tarjeta'),
(12, 3, 8, 2, 199.99, 139.99, '2024-10-05', 'paypal'),
(13, 4, 9, 1, 79.99, 55.99, '2024-10-10', 'tarjeta'),
(14, 2, 10, 1, 149.99, 104.99, '2024-10-15', 'transferencia'),
(15, 6, 3, 7, 59.99, 41.99, '2024-11-01', 'paypal');

-- Actividad de usuarios (datos recientes)
INSERT INTO actividad_usuarios (usuario_id, curso_id, tipo_actividad, descripcion, fecha_actividad) VALUES
(3, 1, 'login', 'Usuario inició sesión', '2024-11-12 09:00:00'),
(4, 1, 'leccion_completada', 'Completó lección 5', '2024-11-11 14:30:00'),
(5, 2, 'login', 'Usuario inició sesión', '2024-11-12 08:15:00'),
(6, 3, 'leccion_completada', 'Completó lección 3', '2024-11-10 16:45:00'),
(8, 1, 'curso_iniciado', 'Comenzó el curso', '2024-11-11 10:20:00'),
(9, 5, 'login', 'Usuario inició sesión', '2024-11-12 11:30:00'),
(10, 6, 'login', 'Usuario inició sesión', '2024-11-09 13:15:00'),
(3, 6, 'curso_iniciado', 'Comenzó nuevo curso', '2024-11-12 15:45:00'),
(4, 7, 'leccion_completada', 'Completó lección 8', '2024-11-11 18:20:00'),
(5, 8, 'curso_completado', 'Finalizó el curso', '2024-11-10 20:30:00');

-- Crear índices para mejorar performance
CREATE INDEX idx_inscripciones_usuario ON inscripciones(usuario_id);
CREATE INDEX idx_inscripciones_curso ON inscripciones(curso_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_instructor ON ventas(instructor_id);
CREATE INDEX idx_actividad_usuario ON actividad_usuarios(usuario_id);
CREATE INDEX idx_actividad_fecha ON actividad_usuarios(fecha_actividad);

-- Mostrar resumen de datos insertados
SELECT 'Usuarios' as Tabla, COUNT(*) as Total FROM usuarios
UNION ALL
SELECT 'Cursos' as Tabla, COUNT(*) as Total FROM cursos
UNION ALL
SELECT 'Inscripciones' as Tabla, COUNT(*) as Total FROM inscripciones
UNION ALL
SELECT 'Ventas' as Tabla, COUNT(*) as Total FROM ventas
UNION ALL
SELECT 'Actividades' as Tabla, COUNT(*) as Total FROM actividad_usuarios;