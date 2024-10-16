"use client";
import { useState } from "react";
import { Select, SelectItem, Button } from "@nextui-org/react";
import { servers } from "@/info/servers";
import { sites } from "@/info/sites";
import {
  googleLocal,
  facebookLocal,
  youtubeLocal,
} from "@/traceroutes/local/Colombia";
import {
  googleUSA,
  facebookUSA,
  youtubeUSA,
} from "@/traceroutes/northAmerica/USA";
import {
  googleBrasil,
  facebookBrasil,
  youtubeBrasil,
} from "@/traceroutes/southAmerica/Brasil";
import {
  googlePanama,
  facebookPanama,
  youtubePanama,
} from "@/traceroutes/centralAmerica/Panama";
import {
  googleFrancia,
  facebookFrancia,
  youtubeFrancia,
} from "@/traceroutes/europe/Francia";
import {
  googleHongKong,
  facebookHongKong,
  youtubeHongKong,
} from "@/traceroutes/asia/HongKong";
import {
  googleSouthAfrica,
  facebookSouthAfrica,
  youtubeSouthAfrica,
} from "@/traceroutes/africa/SouthAfrica";
import {
  googleAustralia,
  facebookAustralia,
  youtubeAustralia,
} from "@/traceroutes/oceania/Australia";
import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import { TracerouteResult } from "@/interfaces/ipAPI";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

export default function Home() {
  // Estados
  const [selectedServer, setSelectedServer] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [tracerouteData, setTracerouteData] = useState<TracerouteResult[]>([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapKey, setMapKey] = useState(0); // Estado para forzar la re-renderización del mapa

  // Manejadores de eventos
  const handleSelectedServer = (serverId: string) => {
    setSelectedServer(serverId);
  };

  const handleSelectedSite = (siteId: string) => {
    setSelectedSite(siteId);
  };

  // Función para realizar las peticiones POST a la API de IP-API y obtener la longitud y latitud de las direcciones IP
  async function fetchTraceroutes(querys: Array<object>) {
    const response = await fetch("/api/fetchTraceroutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ querys }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al realizar la solicitud de traceroute:", errorData);
      throw new Error("Error al realizar la solicitud de traceroute");
    }

    const data = await response.json();
    return data;
  }

  // Función para manejar el clic en el botón "Trazar"
  const handleTraceroute = async () => {
    if (selectedServer && selectedSite) {
      // Limpiar datos anteriores
      setTracerouteData([]); // Limpiar datos previos de la traza
      setMapCenter(defaultCenter); // Restablecer el centro del mapa si es necesario
      setMapKey((prev) => prev + 1); // Forzar la re-renderización del mapa

      // Determinar el traceroute seleccionado
      let selectedTraceroute: string | any[] = [];

      // Local
      if (selectedServer === "1" && selectedSite === "1") {
        selectedTraceroute = googleLocal;
      } else if (selectedServer === "1" && selectedSite === "2") {
        selectedTraceroute = facebookLocal;
      } else if (selectedServer === "1" && selectedSite === "3") {
        selectedTraceroute = youtubeLocal;
      }

      // USA
      if (selectedServer === "2" && selectedSite === "1") {
        selectedTraceroute = googleUSA;
      } else if (selectedServer === "2" && selectedSite === "2") {
        selectedTraceroute = facebookUSA;
      } else if (selectedServer === "2" && selectedSite === "3") {
        selectedTraceroute = youtubeUSA;
      }

      // Brasil
      if (selectedServer === "3" && selectedSite === "1") {
        selectedTraceroute = googleBrasil;
      } else if (selectedServer === "3" && selectedSite === "2") {
        selectedTraceroute = facebookBrasil;
      } else if (selectedServer === "3" && selectedSite === "3") {
        selectedTraceroute = youtubeBrasil;
      }

      // Panama
      if (selectedServer === "4" && selectedSite === "1") {
        selectedTraceroute = googlePanama;
      } else if (selectedServer === "4" && selectedSite === "2") {
        selectedTraceroute = facebookPanama;
      } else if (selectedServer === "4" && selectedSite === "3") {
        selectedTraceroute = youtubePanama;
      }

      // Francia
      if (selectedServer === "5" && selectedSite === "1") {
        selectedTraceroute = googleFrancia;
      } else if (selectedServer === "5" && selectedSite === "2") {
        selectedTraceroute = facebookFrancia;
      } else if (selectedServer === "5" && selectedSite === "3") {
        selectedTraceroute = youtubeFrancia;
      }

      // HongKong
      if (selectedServer === "6" && selectedSite === "1") {
        selectedTraceroute = googleHongKong;
      } else if (selectedServer === "6" && selectedSite === "2") {
        selectedTraceroute = facebookHongKong;
      } else if (selectedServer === "6" && selectedSite === "3") {
        selectedTraceroute = youtubeHongKong;
      }

      // SudAfrica
      if (selectedServer === "7" && selectedSite === "1") {
        selectedTraceroute = googleSouthAfrica;
      } else if (selectedServer === "7" && selectedSite === "2") {
        selectedTraceroute = facebookSouthAfrica;
      } else if (selectedServer === "7" && selectedSite === "3") {
        selectedTraceroute = youtubeSouthAfrica;
      }

      // Australia
      if (selectedServer === "8" && selectedSite === "1") {
        selectedTraceroute = googleAustralia;
      } else if (selectedServer === "8" && selectedSite === "2") {
        selectedTraceroute = facebookAustralia;
      } else if (selectedServer === "8" && selectedSite === "3") {
        selectedTraceroute = youtubeAustralia;
      }

      // Realizar el traceroute si hay datos seleccionados
      if (selectedTraceroute.length > 0) {
        try {
          const data = await fetchTraceroutes(selectedTraceroute);

          // Filtrar solo los objetos que tienen 'status: success' y lat/lon válidos
          const successData = data.filter(
            (item: TracerouteResult) =>
              item.status === "success" && item.lat && item.lon
          );

          // Actualizar el estado con los nuevos datos
          setTracerouteData(successData);

          // Centrar el mapa en el primer punto válido
          if (successData.length > 0) {
            setMapCenter({
              lat: successData[0].lat!,
              lng: successData[0].lon!,
            });
          }
        } catch (error) {
          console.error("Error al obtener traceroute:", error);
        }
      }
    }
  };

  // Función para exportar los datos a un archivo TXT
  const exportToTxt = () => {
    if (tracerouteData.length === 0) {
      return;
    }

    // Formatear los datos como texto
    const header =
      "IP Inicial: " +
      tracerouteData[0]?.query +
      "\n" +
      "IP Final: " +
      tracerouteData[tracerouteData.length - 1]?.query +
      "\n" +
      "Número de Saltos: " +
      tracerouteData.length +
      "\n\n" +
      "Saltos:\n";

    const content = tracerouteData
      .map((route, index) => `${index + 1}. ${route.query}`)
      .join("\n");

    const txtContent = header + content;

    // Crear un Blob con el contenido
    const blob = new Blob([txtContent], { type: "text/plain" });

    // Crear una URL para el Blob
    const url = URL.createObjectURL(blob);

    // Crear un elemento <a> para descargar el archivo
    const link = document.createElement("a");
    link.href = url;
    link.download = "traceroute_resultados.txt";

    // Añadir el enlace al DOM y hacer clic en él
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cargar el script de Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (loadError) return <div>Error al cargar el mapa</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div className="container mx-auto md:p-10 p-5">
      <div className="rounded-lg">
        <div className="flex flex-col space-y-3 p-6">
          <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight text-white">
            ¡Bienvenido a Traza Rutas!
          </h3>
          <p className="text-sm text-muted-foreground text-white md:text-start text-justify">
            Bienvenido a nuestra aplicación web que te permite visualizar la
            ruta que toma tu conexión desde un servidor hasta diversos sitios
            web. Esta herramienta está diseñada para ayudarte a entender mejor
            el tráfico de la red y analizar los puntos de conexión globales.
          </p>
        </div>
      </div>

      <div className="rounded-lg">
        <div className="flex flex-col space-y-3 p-6">
          <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight text-white">
            ¿Cómo funciona?
          </h3>
          <ol className="list-decimal list-inside text-white">
            <li>
              Selecciona un servidor desde el cual quieras iniciar la traza.
            </li>
            <li>Escoge un sitio web de destino.</li>
            <li>Visualiza los resultados en un mapa interactivo.</li>
          </ol>
        </div>
      </div>

      <div className="flex md:flex-row flex-col gap-4 mb-6 p-6 md:items-center">
        <Select
          label="Selecciona un servidor"
          className="md:max-w-xs"
          size="sm"
        >
          {servers.map((server) => (
            <SelectItem
              key={server?.key!}
              value={server?.key}
              onClick={() => server && handleSelectedServer(server.key)}
            >
              {server?.label}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Selecciona un sitio web"
          className="md:max-w-xs"
          size="sm"
        >
          {sites.map((site) => (
            <SelectItem
              key={site.key}
              value={site.key}
              onClick={() => handleSelectedSite(site.key)}
            >
              {site.label}
            </SelectItem>
          ))}
        </Select>
        <Button
          color="primary"
          variant="shadow"
          isDisabled={!selectedServer || !selectedSite}
          className="disabled:cursor-not-allowed"
          onClick={handleTraceroute}
        >
          Trazar
        </Button>
      </div>

      <div className="h-[600px] w-full p-6">
        <GoogleMap
          key={mapKey} // Usar el key para forzar el re-render
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          center={mapCenter}
        >
          {tracerouteData.map((route, index) => (
            <Marker
              key={index}
              position={{ lat: route.lat!, lng: route.lon! }}
              title={route.city}
            />
          ))}
          {tracerouteData.length > 1 && (
            <Polyline
              path={tracerouteData.map((route) => ({
                lat: route.lat!,
                lng: route.lon!,
              }))}
              options={{
                strokeColor: "#0000FF",
                strokeOpacity: 0.7,
                strokeWeight: 3,
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div className="rounded-lg text-white">
        <div className="flex flex-col space-y-3 p-6">
          <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight text-white">
            Resultados Traza
          </h3>
          <div className="ml-2">
            <p>
              <span className="font-semibold">IP inicial:</span>{" "}
              {tracerouteData[0]?.query}
            </p>
            <p>
              <span className="font-semibold">IP final:</span>{" "}
              {tracerouteData[tracerouteData.length - 1]?.query}
            </p>
            <p>
              <span className="font-semibold">Número de saltos:</span>{" "}
              {tracerouteData.length}
            </p>
            <p className="font-semibold">Saltos:</p>
            {tracerouteData.map((route, index) => (
              <ul key={index}>
                <li>{route?.query}</li>
              </ul>
            ))}
          </div>
          <Button
            color="primary"
            variant="shadow"
            isDisabled={!selectedServer || !selectedSite}
            className="mt-2 w-min"
            onClick={exportToTxt}
          >
            Exportar a TXT
          </Button>
        </div>
      </div>
    </div>
  );
}
