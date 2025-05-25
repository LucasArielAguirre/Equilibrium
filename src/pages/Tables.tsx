import { useEffect, useState } from "react";
import { motion } from "framer-motion"; 
import supabase from "../utils/supabase";

// Define la interfaz para los datos de la tabla "control"
interface Transaccion {
  transaccion_id: number;
  usuario_id: number;
  nombre: string | null;
  motivo: string | null;
  fecha: string;
  tipo_movimiento: "ingreso" | "egreso";
  tipo_category:
    | "entretenimiento"
    | "servicios"
    | "alimentos"
    | "inmueble"
    | "viajes"
    | "salud"
    | "rodados"
    | "educacion"
    | "vestimenta"
    | "tecnologia"
    | "trabajo"
    | "otros";
  monto: number;
}

const Tables = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  
  useEffect(() => {
    const fetchTransacciones = async () => {
      const { data, error } = await supabase
        .from("control")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error al obtener datos:", error);
      } else {
        setTransacciones(data as Transaccion[]);
      }
    }

    fetchTransacciones();
  }, []);

  const montoFinal = transacciones.reduce((total, t) => {
    return t.tipo_movimiento === "egreso"
      ? total - t.monto
      : total + t.monto;
  }, 0);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className=" w-full h-full"
    >
      <h1 className="text-3xl text-white text-center">TABLES</h1>
      <table className="w-full border-collapse border border-white">
        <thead>
          <tr className="text-white">
            <th className="border border-white">Nombre</th>
            <th className="border border-white">Categoría</th>
            <th className="border border-white">Fecha</th>
            <th className="border border-white">Ingreso</th>
            <th className="border border-white">Egreso</th>
            <th className="border border-white">Monto</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.map((t) => (
        
            <tr key={t.transaccion_id} className="text-center text-white">
              <td className="border border-white p-2">{t.nombre || "-"}</td>
              <td className="border border-white p-2">{t.tipo_category}</td>
              <td className="border border-white p-2">
                {new Date(t.fecha).toLocaleDateString()}
              </td>
              <td className="border border-white p-2">
                {t.tipo_movimiento === "ingreso" ? "✔️" : "-"}
              </td>
              <td className="border border-white p-2">
                {t.tipo_movimiento === "egreso" ? "✔️" : "-"}
              </td>
              <td className={`border border-white p-2 font-semibold ${
    t.tipo_movimiento === "egreso" ? "text-red-600" : "text-green-600"
  }`}>
  {t.tipo_movimiento === "egreso" ? "-$" : "$"}
  {t.monto.toFixed(2)}
</td>
            </tr>
          ))}
        </tbody>
      </table>
         <div
        className={`w-40 mt-6 mx-auto text-center text-xl font-bold rounded p-3 shadow-md ${
          montoFinal < 0 ? "text-red-600 bg-black" : "text-green-600 bg-black"
        }`}
      >
        Monto Final: {montoFinal < 0 ? "-$" : "$"}
        {Math.abs(montoFinal).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
      </div>
    </motion.div>
  );
};

export default Tables;
