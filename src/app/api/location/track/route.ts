import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude, batteryLevel, appointmentId, sosAlertId } = body;

    if (!latitude || !longitude) {
      return new NextResponse("Missing coordinates", { status: 400 });
    }

    // Guardar el log histórico a la nube
    await prisma.locationLog.create({
      data: {
        userId: session.user.id,
        appointmentId,
        sosAlertId,
        latitude,
        longitude,
        batteryLevel,
      },
    });

    // Actualizar la última posición conocida en el perfil del usuario (opcional, para accesos rápidos)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationUpdate: new Date(),
      }
    });

    // NOTA: Si estuviéramos usando webSockets / Supabase Realtime / Pusher, emitiríamos aquí el evento
    // channel(`sos-${sosAlertId}`).push('location_update', { userId, latitude, longitude })

    return NextResponse.json({ success: true, message: "Ubicación sincronizada y respaldada." });

  } catch (error) {
    console.error("[LOCATION_TRACK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
