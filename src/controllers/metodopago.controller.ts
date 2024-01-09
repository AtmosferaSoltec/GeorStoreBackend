import { Request, Response } from "express";
import { pool } from '../db';
import { tbEmpresa, tbMetodoPago } from "../core/tables";

const idTabla = 'id_metodo_pago';

const getAll = async (req: Request, res: Response) => {
    try {
        const { estado, id_empresa } = req.query;

        //Verificamos si el estado y el id_empresa existe
        if (!id_empresa) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_empresa es necesario"
            });
        }

        //Verificamos si el id_empresa existe con COUNT
        const queryEmpresa = `SELECT COUNT(*) AS count FROM ${tbEmpresa} WHERE id_empresa = ?`;
        const [count]: any[] = await pool.query(queryEmpresa, [id_empresa]);
        if (count[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_empresa no existe"
            });
        }

        let query = `SELECT * FROM ${tbMetodoPago} WHERE id_empresa = ?`
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
        const queryNombre = `SELECT COUNT(*) AS total FROM ${tbMetodoPago} WHERE nombre = ? AND id_empresa = ?`;
        const [talla]: any[] = await pool.query(queryNombre, [nombre, id_empresa]);

        if (talla[0].total > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El nombre ${nombre} ya existe`
            });
        }

        //Insertar
        const query = `INSERT INTO ${tbMetodoPago} (nombre, id_empresa) VALUES (?,?)`;
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
        const { id_metodo_pago, estado } = req.body;

        //Validar datos
        if (!id_metodo_pago) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_metodo_pago es obligatorio'
            });
        }
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El estado es obligatorio'
            });
        }

        //Verificar si existe el id_metodo_pago
        const queryTalla = `SELECT COUNT(*) AS total FROM ${tbMetodoPago} WHERE ${idTabla} = ?`;
        const [talla]: any[] = await pool.query(queryTalla, [id_metodo_pago]);
        if (talla[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El id_metodo_pago ${id_metodo_pago} no existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbMetodoPago} SET estado = ? WHERE ${idTabla} = ?`;
        const [call]: any[] = await pool.query(query, [estado, id_metodo_pago]);

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