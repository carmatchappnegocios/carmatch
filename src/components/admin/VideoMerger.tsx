'use client'
import { useState, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export default function VideoMerger() {
    const [files, setFiles] = useState<(File | null)[]>([null, null])
    const [merging, setMerging] = useState(false)
    const [progress, setProgress] = useState(0)
    const [outputUrl, setOutputUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const ffmpegRef = useRef(new FFmpeg())

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFiles(prev => {
            const newFiles = [...prev]
            newFiles[index] = file
            return newFiles
        })
    }

    const mergeVideos = async () => {
        const validFiles = files.filter(f => f !== null) as File[]
        if (validFiles.length < 2) {
            setError('Sube al menos 2 videos para unirlos.')
            return
        }

        setMerging(true)
        setError(null)
        setProgress(0)
        setOutputUrl(null)

        try {
            const ffmpeg = ffmpegRef.current
            ffmpeg.on('progress', ({ progress, time }) => {
                setProgress(Math.round(progress * 100))
            })

            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
            if (!ffmpeg.loaded) {
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                })
            }

            // Escribir archivos a FFmpeg
            for (let i = 0; i < validFiles.length; i++) {
                await ffmpeg.writeFile(`input${i}.mp4`, await fetchFile(validFiles[i]))
            }

            // Crear archivo de lista para concat (safe for same codec/resolution like Veo3)
            let concatText = ''
            for (let i = 0; i < validFiles.length; i++) {
                concatText += `file 'input${i}.mp4'\n`
            }
            await ffmpeg.writeFile('list.txt', concatText)

            // Ejecutar demuxer de concat
            await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4'])

            const data = await ffmpeg.readFile('output.mp4')
            const url = URL.createObjectURL(new Blob([new Uint8Array(data as any)], { type: 'video/mp4' }))
            setOutputUrl(url)
        } catch (err: any) {
            console.error('Error uniendo videos:', err)
            setError('Hubo un error al unir los videos. Intenta recargar la página.')
        } finally {
            setMerging(false)
        }
    }

    // Siempre mostraremos los 2 inputs, ya no necesitamos la validación de promptCount < 2

    return (
        <div style={{ background: '#ffffff0a', borderRadius: 12, padding: '16px', marginTop: '16px', border: '1px solid #ffffff22' }}>
            <h4 style={{ margin: '0 0 12px', color: '#34d399', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎬</span> Unir Video Principal y Bumper
            </h4>
            
            <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 16px' }}>
                Sube el Video Principal (primer video) y tu Bumper (segundo video) en ese orden para unirlos automáticamente.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                {files.map((file, i) => (
                    <div key={i} style={{ background: '#00000044', padding: '10px', borderRadius: '8px', border: file ? '1px solid #34d39966' : '1px dashed #ffffff33' }}>
                        <span style={{ display: 'block', fontSize: 11, color: '#a7f3d0', marginBottom: 4 }}>
                            {i === 0 ? '1️⃣ Video Principal' : '2️⃣ Bumper (Final)'}
                        </span>
                        <input 
                            type="file" 
                            accept="video/mp4,video/webm" 
                            onChange={(e) => handleFileChange(i, e)} 
                            style={{ fontSize: 11, color: '#fff', width: '100%' }}
                        />
                    </div>
                ))}
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{error}</p>}

            {!outputUrl ? (
                <button
                    onClick={mergeVideos}
                    disabled={merging || files.filter(f => f).length < 2}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', background: files.filter(f => f).length >= 2 ? '#059669' : '#374151',
                        color: '#fff', border: 'none', cursor: files.filter(f => f).length >= 2 ? 'pointer' : 'not-allowed', width: '100%',
                        fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
                    }}
                >
                    {merging ? `Uniendo... ${progress}% (Puede tardar un par de minutos)` : '🔗 Unir Videos Ahora'}
                </button>
            ) : (
                <div style={{ background: '#064e3b44', border: '1px solid #059669', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#34d399', margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>✅ ¡Video Final Listo!</p>
                    <video controls src={outputUrl} style={{ width: '100%', maxHeight: 300, borderRadius: 8, background: '#000', marginBottom: 12 }} />
                    <a 
                        href={outputUrl} 
                        download="carmatch-video-unido.mp4"
                        style={{ display: 'inline-block', padding: '8px 16px', background: '#34d399', color: '#000', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}
                    >
                        ⬇️ Descargar Video Completo
                    </a>
                </div>
            )}
        </div>
    )
}
