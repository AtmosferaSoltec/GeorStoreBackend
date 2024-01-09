import { Request, Response } from "express";
import { pool } from '../db';
import { tbEmpresa, tbInventario, tbProducto } from "../core/tables";
import { getProductoByID } from "../core/functions";


const getAll = async (req: Request, res: Response) => {
    try {
        const { id_empresa } = req.body.user;
        const { estado } = req.query;

        let query = `SELECT * FROM ${tbInventario} WHERE id_empresa = ?`
        let params = [id_empresa];

        if (estado === 'S' || estado === 'N') {
            query += ' AND estado = ?';
            params.push(estado);
        }

        const [call]: any[] = await pool.query(query, params);

        const callMaps = await Promise.all(call.map(async (inv: any) => {
            return {
                ...inv,
                producto: await getProductoByID(inv.id_producto)
            }
        }));

        res.json({
            isSuccess: true,
            data: callMaps
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
        const { id_empresa, id_usuario } = req.body.user;
        const { id_producto, cant_disponible } = req.body;

        // Verificamos si los datos necesarios están presentes
        if (!id_producto || !cant_disponible) {
            return res.json({
                isSuccess: false,
                mensaje: "Los campos id_producto y cantidad son necesarios"
            });
        }

        // Insertamos el nuevo producto en el inventario
        const query = `INSERT INTO ${tbInventario} (id_producto, cant_disponible, id_empresa, id_usuario) VALUES (?, ?, ?, ?)`;
        const [call]: any[] = await pool.query(query, [id_producto, cant_disponible, id_empresa, id_usuario]);

        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "No se pudo agregar el producto al inventario"
            });
        }

        return res.json({
            isSuccess: true,
            mensaje: "Producto agregado al inventario exitosamente"
        });

    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const update = async (req: Request, res: Response) => {

}

const setEstado = async (req: Request, res: Response) => {

}

export default { getAll, insert, update, setEstado }