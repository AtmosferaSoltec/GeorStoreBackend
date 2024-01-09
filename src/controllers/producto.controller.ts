import { Request, Response } from "express";
import { pool } from '../db';
import { tbCategoria, tbColor, tbEmpresa, tbInventario, tbKardex, tbMarca, tbProducto, tbTalla } from "../core/tables";


const getAll = async (req: Request, res: Response) => {
    try {
        const { estado } = req.query;
        const { id_empresa } = req.body.user;

        let query = `SELECT p.*,ca.nombre as categoria , t.nombre AS talla, c.nombre AS color, m.nombre AS marca
        FROM ${tbProducto} p
        LEFT JOIN ${tbCategoria} ca ON p.id_categoria = ca.id_categoria
        LEFT JOIN ${tbColor} c ON p.id_color = c.id_color
        LEFT JOIN ${tbMarca} m ON p.id_marca = m.id_marca
        LEFT JOIN ${tbTalla} t ON p.id_talla = t.id_talla
        WHERE p.id_empresa = ?`
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

const search = async (req: Request, res: Response) => {
    try {
        const { id_empresa } = req.body.user;
        const { valor } = req.params;

        const query = `SELECT * FROM ${tbProducto} WHERE id_empresa = ? AND (codigo LIKE ? OR nombre LIKE ?)`;
        const [call]: any[] = await pool.query(query, [id_empresa, `%${valor}%`, `%${valor}%`]);
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
        const { id_empresa, id_usuario } = req.body.user;
        const { codigo, nombre, descrip, precio, id_categoria, id_talla, id_color, id_marca, cant } = req.body;

        //Validar Datos
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El nombre es obligatorio'
            });
        }
        if (!precio) {
            return res.json({
                isSuccess: false,
                mensaje: 'El precio es obligatorio'
            });
        }
        if (!id_categoria) {
            return res.json({
                isSuccess: false,
                mensaje: 'La categoria es obligatoria'
            });
        }
        if (!id_talla) {
            return res.json({
                isSuccess: false,
                mensaje: 'La talla es obligatoria'
            });
        }
        if (!id_color) {
            return res.json({
                isSuccess: false,
                mensaje: 'El color es obligatorio'
            });
        }
        if (!id_marca) {
            return res.json({
                isSuccess: false,
                mensaje: 'La marca es obligatoria'
            });
        }
        if (!cant) {
            return res.json({
                isSuccess: false,
                mensaje: 'La cantidad es obligatoria'
            });
        }

        const queryConsulta = `
        SELECT 
        (SELECT COUNT(*) FROM ${tbCategoria} WHERE id_categoria = ?) AS countCategoria,
        (SELECT COUNT(*) FROM ${tbColor} WHERE id_color = ?) AS countColor,
        (SELECT COUNT(*) FROM ${tbMarca} WHERE id_marca = ?) AS countMarca,
        (SELECT COUNT(*) FROM ${tbTalla} WHERE id_talla = ?) AS countTalla
        `;
        const [results]: any[] = await pool.query(queryConsulta, [id_categoria, id_color, id_marca, id_talla]);
        if (results[0].countCategoria === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_categoria no existe"
            });
        }
        if (results[0].countColor === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_color no existe"
            });
        }
        if (results[0].countMarca === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_marca no existe"
            });
        }
        if (results[0].countTalla === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_talla no existe"
            });
        }

        // Insertamos el producto
        const query = `INSERT INTO ${tbProducto} (codigo, nombre, descrip, precio, id_categoria, id_talla, id_color, id_marca, id_empresa) VALUES (?,?,?,?,?,?,?,?,?)`;
        const [call]: any[] = await pool.query(query, [codigo, nombre, descrip, precio, id_categoria, id_talla, id_color, id_marca, id_empresa]);

        // Error al insertar
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al insertar'
            });
        }

        //Insertamor el kardex
        const queryKardex = `INSERT INTO ${tbKardex} (id_producto, id_tipo_mov, cant, precio, id_empresa, id_usuario) VALUES (?,?,?,?,?,?)`;
        const [callKardex]: any[] = await pool.query(queryKardex, [call.insertId, 1, cant, (precio * cant), id_empresa, id_usuario]);


        //Insertamos el inventario
        const queryInventario = `INSERT INTO ${tbInventario} (id_producto, cant_disponible, id_empresa, id_usuario) VALUES (?,?,?,?)`;
        const [callInventario]: any[] = await pool.query(queryInventario, [call.insertId, cant, id_empresa, id_usuario]);

        // Error al insertar en kardex e inventario
        if (callKardex.affectedRows === 0 || callInventario.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al insertar'
            });
        }

        // Respuesta
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
        const { id_producto, codigo, nombre, descrip, precio, id_categoria, id_color, id_marca, id_talla } = req.body;

        //Validar Datos
        if (!id_producto) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_producto es obligatorio'
            });
        }
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El nombre es obligatorio'
            });
        }
        if (!precio) {
            return res.json({
                isSuccess: false,
                mensaje: 'El precio es obligatorio'
            });
        }
        if (!id_talla) {
            return res.json({
                isSuccess: false,
                mensaje: 'La talla es obligatoria'
            });
        }
        if (!id_color) {
            return res.json({
                isSuccess: false,
                mensaje: 'El color es obligatorio'
            });
        }
        if (!id_marca) {
            return res.json({
                isSuccess: false,
                mensaje: 'La marca es obligatoria'
            });
        }

        // Verificamos si el id_producto existe con COUNT
        const queryProducto = `SELECT COUNT(*) AS count FROM ${tbProducto} WHERE id_producto = ?`;
        const [countProducto]: any[] = await pool.query(queryProducto, [id_producto]);
        if (countProducto[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_producto no existe"
            });
        }
        const query = `
        SELECT 
        (SELECT COUNT(*) FROM ${tbCategoria} WHERE id_categoria = ?) AS countCategoria,
        (SELECT COUNT(*) FROM ${tbColor} WHERE id_color = ?) AS countColor,
        (SELECT COUNT(*) FROM ${tbMarca} WHERE id_marca = ?) AS countMarca,
        (SELECT COUNT(*) FROM ${tbTalla} WHERE id_talla = ?) AS countTalla
        `;
        const [results]: any[] = await pool.query(query, [id_categoria, id_color, id_marca, id_talla]);
        if (results[0].countCategoria === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_categoria no existe"
            });
        }
        if (results[0].countColor === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_color no existe"
            });
        }
        if (results[0].countMarca === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_marca no existe"
            });
        }
        if (results[0].countTalla === 0) {
            return res.json({
                isSuccess: false,
                mensaje: "El id_talla no existe"
            });
        }

        // Actualizamos el producto
        const queryUpdate = `UPDATE ${tbProducto} SET codigo = ?, nombre = ?, descrip = ?, precio = ?, id_categoria = ?, id_talla = ?, id_color = ?, id_marca = ? WHERE id_producto = ?`;
        const [call]: any[] = await pool.query(queryUpdate, [codigo, nombre, descrip, precio, id_categoria, id_talla, id_color, id_marca, id_producto]);
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al actualizar'
            });
        }

        // Respuesta
        res.json({
            isSuccess: true,
            mensaje: 'Se actualizo correctamente'
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const setEstado = async (req: Request, res: Response) => {
    try {
        const { id_producto, estado } = req.body;

        //Validar datos
        if (!id_producto) {
            return res.json({
                isSuccess: false,
                mensaje: 'El id_producto es obligatorio'
            });
        }
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El estado es obligatorio'
            });
        }

        //Verificar si existe el id_producto
        const queryTalla = `SELECT COUNT(*) AS total FROM ${tbProducto} WHERE id_producto = ?`;
        const [talla]: any[] = await pool.query(queryTalla, [id_producto]);
        if (talla[0].total === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El id_producto ${id_producto} no existe`
            });
        }

        //Actualizar
        const query = `UPDATE ${tbProducto} SET estado = ? WHERE id_producto = ?`;
        const [call]: any[] = await pool.query(query, [estado, id_producto]);

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

export default { getAll, search, insert, update, setEstado }