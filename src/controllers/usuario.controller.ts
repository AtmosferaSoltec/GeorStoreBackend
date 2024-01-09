import { Request, Response } from "express";
import { pool } from '../db';
import { tbEmpresa, tbRol, tbUsuario } from "../core/tables";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from 'bcrypt';

const idTabla = 'id_usuario';

const verificarToken = (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization;

        //Verificar si el token existe
        if (!token) {
            return res.json({
                isSuccess: false,
                mensaje: 'El token es obligatorio'
            });
        }

        //Verificar si el token es valido
        const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        res.json({
            isSuccess: true,
            mensaje: 'El token es valido',
            data
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const { documento, clave } = req.body;

        //Validar datos
        if (!documento) {
            return res.json({
                isSuccess: false,
                mensaje: 'El documento es obligatorio'
            });
        }
        if (!clave) {
            return res.json({
                isSuccess: false,
                mensaje: 'La clave es obligatoria'
            });
        }

        //Verificar si existe el documento
        const queryDocumento = `SELECT COUNT(*) AS total FROM ${tbUsuario} WHERE documento = ?`;
        const [callDocumento]: any[] = await pool.query(queryDocumento, [documento]);
        if (callDocumento[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El documento ${documento} no existe`
            });
        }

        //Login con JWT y Bcrypt
        const query = `SELECT * FROM ${tbUsuario} WHERE documento = ?`;
        const [call]: any[] = await pool.query(query, [documento]);
        if (call.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al consultar'
            });
        }

        //Verificar clave
        const claveCorrecta = bcrypt.compareSync(clave, call[0].clave);
        if (!claveCorrecta) {
            return res.json({
                isSuccess: false,
                mensaje: 'La clave es incorrecta'
            });
        }

        //Verificar si el usuario esta activo
        if (call[0].estado === 'N') {
            return res.json({
                isSuccess: false,
                mensaje: 'El usuario esta inactivo'
            });
        }

        //Crear token
        const token = jwt.sign({
            id_usuario: call[0].id_usuario,
            documento: call[0].documento,
            nombres: call[0].nombres,
            apellidos: call[0].apellidos,
            cod_rol: call[0].cod_rol,
            id_empresa: call[0].id_empresa
        }, process.env.JWT_SECRET || 'secret', { expiresIn: '5h' });

        res.json({
            isSuccess: true,
            mensaje: 'Login correcto',
            data: {
                token
            }
        });


    } catch (error: any) {
        console.log(error);
        res.json({
            isSuccess: false,
            mensaje: error.message
        });

    }
}

const getAll = async (req: Request, res: Response) => {
    try {
        const { id_empresa } = req.body.user;
        const { estado } = req.query;

        let query = `SELECT * FROM ${tbUsuario} WHERE id_empresa = ?`
        let params = [id_empresa];

        if (estado === 'S' || estado === 'N') {
            query += ' AND estado = ?';
            params.push(estado);
        }

        const [call]: any[] = await pool.query(query, params);
        res.json({
            isSuccess: true,
            data: call
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const insert = async (req: Request, res: Response) => {
    try {
        const { id_empresa } = req.body.user;
        const { documento, clave, nombres, apellidos, telefono, cod_rol } = req.body;

        //Validar datos
        if (!documento) {
            return res.json({
                isSuccess: false,
                mensaje: 'El documento es obligatorio'
            });
        }
        if (!clave) {
            return res.json({
                isSuccess: false,
                mensaje: 'La clave es obligatoria'
            });
        }
        if (!nombres) {
            return res.json({
                isSuccess: false,
                mensaje: 'El nombre es obligatorio'
            });
        }
        if (!cod_rol) {
            return res.json({
                isSuccess: false,
                mensaje: 'El cod_rol es obligatorio'
            });
        }

        //Verificar si existe el id_empresa
        const queryEmpresa = `SELECT COUNT(*) AS total FROM ${tbEmpresa} WHERE id_empresa = ?`;
        const [empresa]: any[] = await pool.query(queryEmpresa, [id_empresa]);
        if (empresa[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El id_empresa ${id_empresa} no existe`
            });
        }

        //Verificar si existe el cod_rol
        const queryRol = `SELECT COUNT(*) AS total FROM ${tbRol} WHERE cod = ?`;
        const [rol]: any[] = await pool.query(queryRol, [cod_rol]);
        if (rol[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El cod_rol ${cod_rol} no existe`
            });
        }

        //Verificar si existe el documento
        const queryDocumento = `SELECT COUNT(*) AS total FROM ${tbUsuario} WHERE documento = ? AND id_empresa = ?`;
        const [callDocumento]: any[] = await pool.query(queryDocumento, [documento, id_empresa]);

        if (callDocumento[0].total > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El documento ${documento} ya existe`
            });
        }

        //Encriptar clave
        const saltRounds = 10;
        const claveEncriptada = bcrypt.hashSync(clave, saltRounds);

        //Insertar
        const query = `INSERT INTO ${tbUsuario} (id_empresa, documento, clave, nombres, apellidos, telefono, cod_rol) VALUES (?,?,?,?,?,?,?)`;
        const [call]: any[] = await pool.query(query, [id_empresa, documento, claveEncriptada, nombres, apellidos, telefono, cod_rol]);

        //Error al insertar
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al insertar'
            });
        }

        res.json({
            isSuccess: true,
            mensaje: 'Se inserto correctamente',
            data: {
                id: call.insertId
            }
        });

    } catch (error: any) {
        console.log(error);
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const setEstado = async (req: Request, res: Response) => {
    try {
        const { id_usuario, estado } = req.body;

        //Validar datos
        if (!id_usuario) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_usuario es obligatorio'
            });
        }
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El estado es obligatorio'
            });
        }

        //Verificar si existe el id_usuario
        const queryTalla = `SELECT COUNT(*) AS total FROM ${tbUsuario} WHERE ${idTabla} = ?`;
        const [talla]: any[] = await pool.query(queryTalla, [id_usuario]);
        if (talla[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El id_usuario ${id_usuario} no existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbUsuario} SET estado = ? WHERE ${idTabla} = ?`;
        const [call]: any[] = await pool.query(query, [estado, id_usuario]);

        //Error al actualizar
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al actualizar'
            });
        }

        res.json({
            isSuccess: true,
            mensaje: 'Se actualizo correctamente'
        });

    } catch (error: any) {
        console.log(error);
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

export default { verificarToken,login, getAll, insert, setEstado }