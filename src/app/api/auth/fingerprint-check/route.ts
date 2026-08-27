// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.

import { NextResponse } from "next/server"

export async function POST() {
    // Endpoint eliminado intencionalmente - no se usa huella digital ni bloqueo de dispositivos
    return NextResponse.json({ isLinked: false })
}
