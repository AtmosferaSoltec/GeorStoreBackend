import { Request, Response } from "express";
import { pool } from '../db';
import { tbEmpresa } from "../core/tables";


const getAll = async (req: Request, res: Response) => {
    try {
        const { estado } = req.query;

        let query = `SELECT * FROM ${tbEmpresa}`
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
        const { ruc, razon_social } = req.body;


        //Validar datos
        if (!ruc) {
            return res.json({
                isSuccess: false,
                mensaje: 'El ruc es obligatorio'
            });
        }
        if (ruc.length !== 11) {
            return res.json({
                isSuccess: false,
                mensaje: 'El ruc debe tener 11 digitos'
            });
        }
        if (!razon_social) {
            return res.json({
                isSuccess: false,
                mensaje: 'La razon social es obligatorio'
            });
        }

        //Verificar si existe el ruc
        const queryRuc = `SELECT COUNT(*) AS total FROM ${tbEmpresa} WHERE ruc = ?`;
        const [empresa]: any[] = await pool.query(queryRuc, [ruc]);
        if (empresa[0].total > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El ruc ${ruc} ya existe`
            });
        }

        //Insertar
        const query = `INSERT INTO ${tbEmpresa} (ruc, razon_social) VALUES (?, ?)`;
        const [call]: any[] = await pool.query(query, [ruc, razon_social]);

        //Si no se inserto correctamente
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }

        //Respuesta si se inserto correctamente y devolvemos el id
        return res.json({
            isSuccess: true,
            data: {
                id: call.insertId
            }
        });


    } catch (error: any) {
        return res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const update = async (req: Request, res: Response) => {
    try {

        const { id_empresa, ruc, razon_social } = req.body;

        //Validar datos
        if (!id_empresa) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id es obligatorio'
            });
        }
        if (!ruc) {
            return res.json({
                isSuccess: false,
                mensaje: 'El ruc es obligatorio'
            });
        }
        if (ruc.length !== 11) {
            return res.json({
                isSuccess: false,
                mensaje: 'El ruc debe tener 11 digitos'
            });
        }
        if (!razon_social) {
            return res.json({
                isSuccess: false,
                mensaje: 'La razon social es obligatorio'
            });
        }

        //Verificar si existe el id_empresa
        const queryEmpresa = `SELECT COUNT(*) AS total FROM ${tbEmpresa} WHERE id_empresa = ?`;
        const [empresa]: any[] = await pool.query(queryEmpresa, [id_empresa]);

        if (empresa[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `La empresa no existe`
            });
        }

        //Verificar si existe el ruc
        const queryRuc = `SELECT COUNT(*) AS total FROM ${tbEmpresa} WHERE ruc = ? AND id_empresa != ?`;
        const [empresaRuc]: any[] = await pool.query(queryRuc, [ruc, id_empresa]);
        if (empresaRuc[0].total > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El ruc ${ruc} ya existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbEmpresa} SET ruc = ?, razon_social = ? WHERE id_empresa = ?`;
        const [call]: any[] = await pool.query(query, [ruc, razon_social, id_empresa]);
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar'
            });
        }

        //Respuesta si se actualizo correctamente
        return res.json({
            isSuccess: true,
            mensaje: 'Se actualizo correctamente'
        });
    } catch (error: any) {
        return res.json({
            isSuccess: false,
            mensaje: error.message
        })
    }
}

const setEstado = async (req: Request, res: Response) => {
    try {
        const { id_empresa, estado } = req.body;

        //Validar datos
        if (!id_empresa) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id es obligatorio'
            });
        }

        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El estado es obligatorio'
            });
        }

        //Verificar si existe el id_empresa
        const queryEmpresa = `SELECT COUNT(*) AS total FROM ${tbEmpresa} WHERE id_empresa = ?`;
        const [empresa]: any[] = await pool.query(queryEmpresa, [id_empresa]);
        if (empresa[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `La empresa no existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbEmpresa} SET estado = ? WHERE id_empresa = ?`;
        const [call]: any[] = await pool.query(query, [estado, id_empresa]);
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar'
            });
        }

        //Respuesta si se actualizo correctamente
        return res.json({
            isSuccess: true,
            mensaje: 'Se actualizo correctamente'
        });

    } catch (error: any) {
        return res.json({
            isSuccess: false,
            mensaje: error.message
        })
    }
}

export default { getAll, insert, update, setEstado }