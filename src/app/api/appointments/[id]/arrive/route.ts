import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    // Obtener la cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        chat: true,
      },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    // Verificar quién es el usuario (comprador o vendedor)
    const isBuyer = appointment.chat.buyerId === session.user.id;
    const isSeller = appointment.chat.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Actualizar la cita marcando la llegada
    const updateData: any = {};
    if (isBuyer) updateData.buyerArrived = true;
    if (isSeller) updateData.sellerArrived = true;

    // Si es el primero en llegar, activar el tiempo de fin de rastreo (ej. 3 horas)
    // Pero solo si no estaba activado ya
    if (!appointment.trackingEndTime) {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 3); // Cita normal dura máximo 3 horas
      updateData.trackingEndTime = endTime;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    // 📊 REGISTRAR EVENTO: Llegada a cita (posible completación)
    try {
      const { trackAppointmentEvent } = await import('@/lib/tracking')
      const bothArrived = updatedAppointment.buyerArrived && updatedAppointment.sellerArrived
      await trackAppointmentEvent({
        eventType: bothArrived ? 'APPOINTMENT_COMPLETED' : 'APPOINTMENT_CREATED',
        userId: session.user.id,
        entityId: appointmentId,
        metadata: {
          chatId: appointment.chatId,
          whoArrived: isBuyer ? 'buyer' : 'seller',
          bothArrived,
          buyerArrived: updatedAppointment.buyerArrived,
          sellerArrived: updatedAppointment.sellerArrived
        }
      })
    } catch {
      // Fail silently
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: "Llegada confirmada exitosamente."
    });

  } catch (error) {
    console.error("[APPOINTMENT_ARRIVE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
