import { tbProducto } from "./tables";
import { pool } from "../db";

export function validarCampo(valor: any, nombreCampo: string): string {
    if (!valor) {
        return `El campo ${nombreCampo} es obligatorio`;
    } else return '';
}

export const getProductoByID = async (id_producto: number) => {
    const query = `SELECT * FROM ${tbProducto} WHERE id_producto = ?`;
    const [call]: any[] = await pool.query(query, [id_producto]);
    //Eliminamos los id de todos los productos traidos
    const producto = call[0];
    delete producto.id_producto;
    return producto;
};