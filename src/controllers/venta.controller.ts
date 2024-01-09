import { Request, Response } from "express";
import { pool } from '../db';
import { tbDetalleVenta, tbEmpresa, tbInventario, tbKardex, tbMetodoPago, tbVenta } from "../core/tables";


const getAll = async (req: Request, res: Response) => {
    try {
        const { id_empresa } = req.body.user;
        const { estado } = req.query;

        let query = `SELECT * FROM ${tbVenta} WHERE id_empresa = ?`
        let params = [id_empresa];

        if (estado === 'S' || estado === 'N') {
            query += ' AND estado = ?';
            params.push(estado);
        }

        const [call]: any[] = await pool.query(query, params);
        return res.json({
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

        const { id_usuario, id_empresa } = req.body.user;
        const { precio_venta, id_metodo_pago, list_productos } = req.body;


        //Verificar si todos los campos estan llenos
        if (!precio_venta) {
            return res.json({
                isSuccess: false,
                mensaje: "El precio_venta es necesario"
            });
        }
        if (!id_metodo_pago) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_metodo_pago es necesario"
            });
        }
        if (!list_productos) {
            return res.json({
                isSuccess: false,
                mensaje: "El list_productos es necesario"
            });
        }

        //Verificamos si el list_productos es un array y si tiene datos
        if (!Array.isArray(list_productos) || list_productos.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El list_productos debe ser un array y debe tener datos"
            });
        }


        //Verificamos si el metodo de pago existe con COUNT
        const queryMetodoPago = `SELECT COUNT(*) AS count FROM ${tbMetodoPago} WHERE id_metodo_pago = ? AND id_empresa = ?`;
        const [count]: any[] = await pool.query(queryMetodoPago, [id_metodo_pago, id_empresa]);
        if (count[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El metodo de pago no existe"
            });
        }

        //Verificamos si hay suficiente stock de los productos
        for (let prod of list_productos) {
            const queryCant = `SELECT cant_disponible FROM ${tbInventario} WHERE id_producto = ? AND id_empresa = ?`;
            const [cant]: any[] = await pool.query(queryCant, [prod.id_producto, id_empresa]);
            console.log(prod);

            if (cant.length === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: `El producto ${prod.id_producto} no existe`
                });
            }
            if (cant[0].cant_disponible < prod.cant_vendida) {
                return res.json({
                    isSuccess: false,
                    mensaje: `No hay suficiente stock del producto ${prod.codigo}`
                });
            }
        }

        //Insertamos la venta
        const queryVenta = `INSERT INTO ${tbVenta} (id_usuario, id_empresa, precio_venta, id_metodo_pago) VALUES (?, ?, ?, ?)`;
        const [venta]: any[] = await pool.query(queryVenta, [id_usuario, id_empresa, precio_venta, id_metodo_pago]);
        if (venta.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "No se pudo insertar la venta"
            });
        }


        const listDetalleVenta: any[] = [];

        list_productos.forEach((prod: any) => {
            const detalle_venta = {
                id_venta: venta.insertId,
                id_producto: prod.id_producto,
                cant_vendida: prod.cant_vendida,
                precio_un: prod.precio_un,
                sub_total: prod.sub_total,
                id_empresa: id_empresa
            }
            listDetalleVenta.push(detalle_venta);
        });


        //Insertamos el detalle de la venta
        listDetalleVenta.forEach(async (detalle: any) => {
            const queryDetalleVenta = `INSERT INTO ${tbDetalleVenta} (id_venta, id_producto, cant_vendida, precio_un, sub_total, id_empresa, id_usuario) VALUES (?,?,?,?,?,?,?)`;
            const [detalleVenta]: any[] = await pool.query(queryDetalleVenta, [detalle.id_venta, detalle.id_producto, detalle.cant_vendida, detalle.precio_un, detalle.sub_total, id_empresa, id_usuario]);
            if (detalleVenta.affectedRows === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: "No se pudo insertar el detalle de la venta"
                });
            }
        });

        //Actualizamos el stock de los productos en la tabla inventario
        list_productos.forEach(async (prod: any) => {
            const queryCant = `SELECT cant_disponible FROM ${tbInventario} WHERE id_producto = ? AND id_empresa = ?`;
            const [cant]: any[] = await pool.query(queryCant, [prod.id_producto, id_empresa]);
            if (cant[0].cant_disponible < prod.cant_vendida) {
                return res.json({
                    isSuccess: false,
                    mensaje: `No hay suficiente stock del producto ${prod.id_producto}`
                });
            }

            const queryUpdateCant = `UPDATE ${tbInventario} SET cant_disponible = ? WHERE id_producto = ? AND id_empresa = ?`;
            const [updateCant]: any[] = await pool.query(queryUpdateCant, [cant[0].cant_disponible - prod.cant_vendida, prod.id_producto, id_empresa]);
            if (updateCant.affectedRows === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: `No se pudo actualizar el stock del producto ${prod.id_producto}`
                });
            }

            //Actualizamos el kardex
            const queryKardex = `INSERT INTO ${tbKardex} (id_producto, id_tipo_mov, cant, precio, id_empresa, id_usuario) VALUES (?,?,?,?,?,?)`;
            const [kardex]: any[] = await pool.query(queryKardex, [prod.id_producto, 2, prod.cant_vendida, (prod.precio_un * prod.cant_vendida), id_empresa, id_usuario]);
            if (kardex.affectedRows === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: `No se pudo actualizar el kardex del producto ${prod.id_producto}`
                });
            }
        })

        return res.json({
            isSuccess: true,
            mensaje: "Venta registrada correctamente"
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