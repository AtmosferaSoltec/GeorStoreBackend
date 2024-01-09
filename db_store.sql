CREATE DATABASE store;

USE store;

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    ruc CHAR(11) UNIQUE,
    razon_social VARCHAR(50),
    estado ENUM('S', 'N') DEFAULT 'S'
);

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    cod CHAR(1),
    nombre VARCHAR(15)
);

CREATE INDEX idx_cod ON rol (cod);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT,
    documento VARCHAR(15),
    clave VARCHAR(255),
    nombres VARCHAR(50),
    apellidos VARCHAR(50),
    telefono VARCHAR(15),
    cod_rol CHAR(1),
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (cod_rol) REFERENCES rol(cod)
);

-- Tabla de Categoria
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    id_empresa INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- Tabla de Talla
CREATE TABLE talla (
    id_talla INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    id_empresa INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- Tabla de Color
CREATE TABLE color (
    id_color INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    id_empresa INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- Tabla de Marca
CREATE TABLE marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    id_empresa INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- Tabla de Metodo de Pago
CREATE TABLE metodo_pago (
    id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    id_empresa INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- Tabla de Producto
CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descrip TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    id_categoria INT,
    id_color INT,
    id_talla INT,
    id_marca INT,
    id_empresa INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_color) REFERENCES color(id_color),
    FOREIGN KEY (id_talla) REFERENCES talla(id_talla),
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE INDEX idx_producto_nombre ON producto (nombre);

CREATE TABLE tipo_mov (
    id_tipo_mov INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    estado ENUM('S', 'N') DEFAULT 'S'
);

-- Tabla de Inventario
CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT,
    cant_disponible INT,
    id_empresa INT,
    id_usuario INT,
    fecha_update TIMESTAMP DEFAULT NOW(),
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE kardex(
	id_kardex INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT NOT NULL,
    id_tipo_mov INT NOT NULL,
    cant INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    id_empresa INT NOT NULL,
    id_usuario INT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_tipo_mov) REFERENCES tipo_mov(id_tipo_mov),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

DELIMITER //
CREATE TRIGGER after_insert_inventario
AFTER INSERT ON inventario
FOR EACH ROW
BEGIN
    INSERT INTO kardex (id_producto, id_tipo_mov, cant, precio, id_empresa, id_usuario)
    VALUES (NEW.ID_Producto, 1, NEW.cant_disponible, 0, NEW.id_empresa, NEW.id_usuario);
END;
//
DELIMITER ;

-- Tabla de Ventas
CREATE TABLE venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    precio_venta DECIMAL(10, 2) NOT NULL,
    id_metodo_pago INT,
    id_empresa INT,
    id_usuario INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago(id_metodo_pago),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE detalle_venta (
	id_detalle_venta INT PRIMARY KEY AUTO_INCREMENT,
    id_venta INT,
    id_producto INT,
    cant_vendida INT,
    precio_un DECIMAL(10, 2),
    sub_total DECIMAL(10, 2),
    id_empresa INT,
    id_usuario INT,
    estado ENUM('S', 'N') DEFAULT 'S',
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

TRUNCATE TABLE venta;
ALTER TABLE venta AUTO_INCREMENT = 1;
