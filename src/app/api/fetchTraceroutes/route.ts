import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Espera a que la promesa de request.json() se resuelva
    const body = await request.json();
    console.log("Cuerpo recibido en la API Route:", body);

    // Verifica que 'querys' exista y sea un arreglo
    if (!body.querys || !Array.isArray(body.querys)) {
      return NextResponse.json(
        {
          message: "Formato de petición inválido",
        },
        {
          status: 400,
        }
      );
    }

    // Realiza la solicitud a la API externa utilizando HTTPS si es posible
    const response = await fetch("http://ip-api.com/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.querys), // Envía solo el arreglo 'querys'
    });

    // Verifica si la respuesta de la API externa es exitosa
    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Error al obtener la información de las IPs",
        },
        {
          status: response.status,
        }
      );
    }

    // Extrae el contenido JSON de la respuesta
    const data = await response.json();
    console.log("Datos recibidos de la API externa:", data);

    // Devuelve los datos al cliente
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en la API Route fetchTraceroutes:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Error desconocido",
      },
      {
        status: 500,
      }
    );
  }
}
