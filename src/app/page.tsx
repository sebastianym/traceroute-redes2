"use client";
import { useState, useEffect, useCallback } from "react";
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
  const [selectedServer, setSelectedServer] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [tracerouteData, setTracerouteData] = useState<TracerouteResult[]>([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const handleSelectedServer = (serverId: string) => {
    setSelectedServer(serverId);
  };

  const handleSelectedSite = (siteId: string) => {
    setSelectedSite(siteId);
  };

  async function fetchTraceroutes(querys: Array<object>) {
    const response = await fetch("http://ip-api.com/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(querys),
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  useEffect(() => {
    if (selectedServer && selectedSite) {
      let selectedTraceroute: string | any[] = [];

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
    }
  }, [selectedServer, selectedSite]);

  // Cargar el script de Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Reemplaza con tu API Key
  });

  if (loadError) return <div>Error al cargar el mapa</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-white">¡Bienvenido!</h1>
      <p className="mb-4 text-white/90">
        A continuación, selecciona un servidor y un sitio web para ver el
        trazado de rutas.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select label="Selecciona un servidor" className="max-w-xs" size="sm">
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
          className="max-w-xs disabled:cursor-not-allowed"
          isDisabled={!selectedServer}
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
      </div>
      <Button
        color="primary"
        variant="shadow"
        isDisabled={!selectedServer || !selectedSite}
      >
        Trazar
      </Button>
      <div className="h-[400px] w-full mt-6">
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
          {/* Opcional: Dibujar una polilínea que conecte los puntos */}
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
