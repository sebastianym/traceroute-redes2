"use client";
import { useState, useEffect } from "react";
import { Select, SelectItem, Button } from "@nextui-org/react";
import { servers } from "@/info/servers";
import { sites } from "@/info/sites";
import { google, facebook, youtube } from "@/traceroutes/local/tracer";
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
  const [traceroute, setTraceroute] = useState(false);

  // Manejadores de eventos
  const handleSelectedServer = (serverId: string) => {
    setSelectedServer(serverId);
  };

  const handleSelectedSite = (siteId: string) => {
    setSelectedSite(siteId);
  };

  // Función para realizar las peticiones POST a la API de IP-API y obtener la longitud y latitud de las direcciones IP
  async function fetchTraceroutes(querys: Array<object>) {
    const response = await fetch("http://ip-api.com/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(querys),
    });
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    if (selectedServer && selectedSite) {
      // Variable para almacenar el traceroute seleccionado
      let selectedTraceroute: string | any[] = [];

      // Asignar el traceroute seleccionado
      if (selectedServer === "1" && selectedSite === "1") {
        selectedTraceroute = google;
      } else if (selectedServer === "1" && selectedSite === "2") {
        selectedTraceroute = facebook;
      } else if (selectedServer === "1" && selectedSite === "3") {
        selectedTraceroute = youtube;
      }

      // Si hay un traceroute seleccionado, lo procesamos
      if (selectedTraceroute.length > 0) {
        fetchTraceroutes(selectedTraceroute).then((data) => {
          // Filtrar solo los objetos que tienen 'status: success' y lat/lon válidos
          const successData = data.filter(
            (item: TracerouteResult) =>
              item.status === "success" && item.lat && item.lon
          );

          // Guardar los datos filtrados en el estado
          setTracerouteData(successData);

          // Centrar el mapa en el primer punto válido
          if (successData.length > 0) {
            setMapCenter({
              lat: successData[0].lat!,
              lng: successData[0].lon!,
            });
          }
        });
      }
      setTraceroute(false);
    }
  }, [traceroute]);

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
              key={server.key}
              value={server.key}
              onClick={() => handleSelectedServer(server.key)}
            >
              {server.label}
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
          onClick={() => setTraceroute(true)}
        >
          Trazar
        </Button>
      </div>

      <div className="h-[600px] w-full p-6">
        <GoogleMap
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
    </div>
  );
}
