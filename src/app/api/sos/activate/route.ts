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
    const { appointmentId, latitude, longitude } = body;

    if (!appointmentId) {
      return new NextResponse("Missing appointmentId", { status: 400 });
    }

    // Verificar la cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        chat: true,
      },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    // Identificar roles
    const isBuyer = appointment.chat.buyerId === session.user.id;
    const isSeller = appointment.chat.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Obtener contraparte
    const counterpartId = isBuyer ? appointment.chat.sellerId : appointment.chat.buyerId;

    // Prevención de abuso: Solo se puede crear si ambos han llegado (o configurarlo como se discutió)
    // Para no bloquear la emergencia real, podríamos ser flexibles aquí, pero el requisito era:
    // "El botón SOS solo puede ser presionado después de que ambos hayan confirmado que llegaron al lugar"
    if (!appointment.buyerArrived || !appointment.sellerArrived) {
      return new NextResponse(
        "Ambos usuarios deben confirmar su llegada antes de activar el SOS.",
        { status: 403 }
      );
    }

    // Configurar expiración a 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Crear la alerta
    const sosAlert = await prisma.sOSAlert.create({
      data: {
        victimId: session.user.id,
        counterpartId,
        chatId: appointment.chatId,
        appointmentId,
        status: "ACTIVE",
        victimLat: latitude,
        victimLng: longitude,
        expiresAt,
      },
    });

    // Registrar la ubicación inicial en el Log
    if (latitude && longitude) {
      await prisma.locationLog.create({
        data: {
          userId: session.user.id,
          appointmentId,
          sosAlertId: sosAlert.id,
          latitude,
          longitude,
        }
      });
    }

    // NOTA: Aquí se enviaría el SMS/WhatsApp al contacto de confianza (ej. Twilio)
    // await sendEmergencyNotificationToTrustedContact(session.user.id, sosAlert.id);

    return NextResponse.json({
      success: true,
      sosAlertId: sosAlert.id,
      message: "SOS Activado. Rastreo intensivo iniciado silenciosamente en la contraparte."
    });
  } catch (error) {
    console.error("[SOS_ACTIVATE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
