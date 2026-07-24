/**
 * 📋 UTILIDAD DE COPIADO INFALIBLE
 * Intenta copiar usando la API moderna de portapapeles,
 * y tiene un fallback robusto para navegadores antiguos o entornos restringidos.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    // 1. Intentar con la API moderna
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn("Fallo en navigator.clipboard, intentando fallback...", err);
        }
    }

    // 2. Fallback: Crear elemento textarea invisible
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Asegurar que no sea visible ni afecte el scroll
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
    } catch (err) {
        console.error("Error crítico en el copiado:", err);
        return false;
    }
}
