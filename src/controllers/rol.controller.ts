import { Request, Response } from "express";
import { pool } from '../db';
import { tbEmpresa, tbRol } from "../core/tables";


const idTabla = 'id_rol';

const getAll = async (req: Request, res: Response) => {
    try {
        const { estado } = req.query;

        let query = `SELECT * FROM ${tbRol}`
        let params = [];

        if (estado === 'S' || estado === 'N') {
            query += ' WHERE estado = ?';
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

        const { nombre, id_empresa } = req.body;

        //Validar datos
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El nombre es obligatorio'
            });
        }

        if (!id_empresa) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_empresa es obligatorio'
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

        //Verificar si existe el nombre
        const queryNombre = `SELECT COUNT(*) AS total FROM ${tbRol} WHERE nombre = ? AND id_empresa = ?`;
        const [talla]: any[] = await pool.query(queryNombre, [nombre, id_empresa]);

        if (talla[0].total > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El nombre ${nombre} ya existe`
            });
        }

        //Insertar
        const query = `INSERT INTO ${tbRol} (nombre, id_empresa) VALUES (?,?)`;
        const [call]: any[] = await pool.query(query, [nombre, id_empresa]);

        //Error al insertar
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al insertar'
            });
        }

        res.json({
            isSuccess: true,
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
        const { id_rol, estado } = req.body;

        //Validar datos
        if (!id_rol) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_rol es obligatorio'
            });
        }
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El estado es obligatorio'
            });
        }

        //Verificar si existe el id_rol
        const queryTalla = `SELECT COUNT(*) AS total FROM ${tbRol} WHERE ${idTabla} = ?`;
        const [talla]: any[] = await pool.query(queryTalla, [id_rol]);
        if (talla[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El id_rol ${id_rol} no existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbRol} SET estado = ? WHERE ${idTabla} = ?`;
        const [call]: any[] = await pool.query(query, [estado, id_rol]);

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

export default { getAll, insert, setEstado }