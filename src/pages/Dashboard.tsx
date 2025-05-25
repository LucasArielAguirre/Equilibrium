import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import supabase from "../utils/supabase";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

interface DolarBlue {
  value_avg: number;
  value_sell: number;
  value_buy: number;
}

const Dashboard = () => {
  const [dolarBlue, setDolarBlue] = useState<DolarBlue | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  useEffect(() => {
    fetch("https://api.bluelytics.com.ar/v2/latest")
      .then((response) => response.json())
      .then((data) => setDolarBlue(data.blue));
  }, []);

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
    };

    fetchTransacciones();
  }, []);

  const ingresosPorCategoria: Record<string, number> = {};
  const egresosPorCategoria: Record<string, number> = {};

  transacciones.forEach((t) => {
    if (t.tipo_movimiento === "ingreso") {
      ingresosPorCategoria[t.tipo_category] =
        (ingresosPorCategoria[t.tipo_category] || 0) + t.monto;
    } else {
      egresosPorCategoria[t.tipo_category] =
        (egresosPorCategoria[t.tipo_category] || 0) + t.monto;
    }
  });

  const categorias = Array.from(
    new Set([
      ...Object.keys(ingresosPorCategoria),
      ...Object.keys(egresosPorCategoria),
    ])
  );

  const data = {
    labels: categorias,
    datasets: [
      {
        label: "Ingresos",
        data: categorias.map((cat) => ingresosPorCategoria[cat] || 0),
        backgroundColor: "rgba(34,197,94,0.7)", // verde
      },
      {
        label: "Egresos",
        data: categorias.map((cat) => egresosPorCategoria[cat] || 0),
        backgroundColor: "rgba(220,38,38,0.7)", // rojo
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Ingresos y Egresos por Categoría",
      },
    },
  };

  const montoFinal = transacciones.reduce((total, t) => {
    return t.tipo_movimiento === "egreso" ? total - t.monto : total + t.monto;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="transparent w-full h-full"
    >
      <div className="grid grid-cols-6 grid-rows-9 gap-6 w-full h-full text-white">
        <div className="rounded-xl col-span-2 row-span-3 border border-secondary justify-center align-middle text-center flex flex-col items-center bg-primary shadow-lg shadow-secondary bg-clip-padding backdrop-filter  backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100 ">
          <h1 className="text-secondary text-6xl">BALANCE</h1>
          <h2 className="text-white text-4xl font-extralight">
            ${montoFinal.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-secondary">$ USD</span>
          </h2>
          <button className="py-2 px-4 border border-secondary w-[40%] mt-5 hover:cursor-pointer hover:text-primary hover:bg-secondary transition-all delay-50">
            New Balance
          </button>
        </div>
        <div className="col-span-2 row-span-3 col-start-3 border border-black/80  bg-clip-padding backdrop-filter backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100 clip-custom bg-black shadow-lg shadow-secondary ">
          <h1 className="w-full h-full text-center text-2xl font-inter underline text-white">
            CONSEJO HECHO POR IA
          </h1>
        </div>
        <div className="col-span-2 row-span-3 col-start-5 border border-secondary/70 w-full text-secondary justify-center align-middle flex flex-col items-center bg-primary shadow-lg shadow-secondary bg-clip-padding backdrop-filter  backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100">
          {dolarBlue ? (
            <div className=" w-full h-full flex">
              <div className="space-y-4 flex flex-col items-center text-center justify-center m-auto">
                <div className="flex flex-col">
                  <span className="text-secondary text-6xl">Dolar blue</span>
                  <h2 className="text-2xl font-extralight text-white">
                    ${dolarBlue.value_avg}{" "}
                    <span className="text-secondary px-1">$ USD</span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-6 text-white">
                  <div className="flex flex-col items-center justify-center py-2 px-4">
                    <span className="text-sm text-secondary opacity-75">COMPRA</span>
                    <h2 className="text-lg font-medium text-white">
                      ${dolarBlue.value_buy}{" "}
                      <span className="text-secondary px-1">$ USD</span>
                    </h2>
                  </div>
                  <div className="flex flex-col items-center justify-center py-2 px-4">
                    <span className="text-sm text-secondary opacity-75">VENTA</span>
                    <h2 className="text-lg font-medium text-white">
                      ${dolarBlue.value_sell}{" "}
                      <span className="text-secondary px-1">$ USD</span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <h1 className="text-white text-lg">Cargando...</h1>
            </div>
          )}
        </div>
        <div className="row-span-3 row-start-4 border border-secondary bg-black bg-clip-padding backdrop-filter  backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100">
          4
        </div>
        <div className="row-span-3 row-start-4 border border-secondary bg-black bg-clip-padding backdrop-filter  backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100">
          5
        </div>
        <div className="col-span-4 row-span-3 row-start-4 border border-secondary bg-secondary/20 bg-clip-padding backdrop-filter  backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100 justify-center w-full items-center flex">
          <Bar options={options} data={data} />
        </div>
        <div className="col-span-6 row-span-3 row-start-7 border border-secondary bg-secondary/20 bg-clip-padding backdrop-filter  backdrop-blur-2xl backdrop-saturate-100 backdrop-contrast-100">
          <table className="w-full border-collapse border border-black/80">
            <thead>
              <th className="border border-secondary">Nombre</th>
              <th className="border border-secondary">Categoria</th>
              <th className="border border-secondary">Fecha</th>
              <th className="border border-secondary">Motivo</th>
              <th className="border border-secondary">Monto</th>
              <th className="border border-secondary">Eliminar</th>
              <th className="border border-secondary">Editar</th>
            </thead>
            <tbody className="border border-secondary w-full h-full text-white">
              {transacciones.slice(0, 4).map((t) => (
                <tr key={t.transaccion_id} className="text-center border border-secondary">
                  <td className="border border-secondary p-2">{t.nombre || "-"}</td>
                  <td className="border border-secondary p-2">{t.tipo_category}</td>
                  <td className="border border-secondary p-2">
                    {new Date(t.fecha).toLocaleDateString()}
                  </td>
                  <td className="border border-secondary p-2">{t.motivo || "-"}</td>
                  <td className="border border-secondary p-2 font-semibold">
                    {t.tipo_movimiento === "egreso" ? "-" : ""}${t.monto.toFixed(2)}
                  </td>
                  <td className="border border-secondary p-2">
                    <button
                   
                      className="hover:text-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </td>
                  <td className="border border-secondary p-2">
                    <button
                   
                      className="hover:text-blue-600 transition-colors"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;