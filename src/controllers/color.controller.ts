import { Request, Response } from "express";
import { pool } from '../db';
import { tbColor, tbEmpresa } from "../core/tables";


const idTabla = 'id_color';

const getAll = async (req: Request, res: Response) => {
    try {
        const { id_empresa } = req.body.user;
        const { estado } = req.query;

        let query = `SELECT * FROM ${tbColor} WHERE id_empresa = ?`
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
        const { nombre } = req.body;

        //Validar datos
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El nombre es obligatorio'
            });
        }

        //Verificar si existe el nombre
        const queryNombre = `SELECT COUNT(*) AS total FROM ${tbColor} WHERE nombre = ? AND id_empresa = ?`;
        const [talla]: any[] = await pool.query(queryNombre, [nombre, id_empresa]);

        if (talla[0].total > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El nombre ${nombre} ya existe`
            });
        }

        //Insertar
        const query = `INSERT INTO ${tbColor} (nombre, id_empresa) VALUES (?,?)`;
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
        const { id_color, estado } = req.body;

        //Validar datos
        if (!id_color) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_color es obligatorio'
            });
        }
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El estado es obligatorio'
            });
        }

        //Verificar si existe el id_color
        const queryTalla = `SELECT COUNT(*) AS total FROM ${tbColor} WHERE ${idTabla} = ?`;
        const [talla]: any[] = await pool.query(queryTalla, [id_color]);
        if (talla[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El id_color ${id_color} no existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbColor} SET estado = ? WHERE ${idTabla} = ?`;
        const [call]: any[] = await pool.query(query, [estado, id_color]);

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