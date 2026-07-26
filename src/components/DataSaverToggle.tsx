// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

'use client'

import { useDataSaver } from '@/contexts/DataSaverContext'
import { Wifi, WifiOff } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DataSaverToggle() {
    const { ultraLiteMode, setUltraLiteMode } = useDataSaver()
    const { t } = useLanguage()

    return (
        <div className="fixed bottom-20 right-6 z-40">
            <button
                onClick={() => setUltraLiteMode(!ultraLiteMode)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${ultraLiteMode
                        ? 'bg-green-600 text-white'
                        : 'bg-surface border border-surface-highlight text-text-primary'
                    }`}
                title={ultraLiteMode ? t('data_saver.mode_activated') : t('data_saver.activate')}
            >
                {ultraLiteMode ? (
                    <>
                        <WifiOff size={20} />
                        <span className="text-sm font-medium hidden sm:block">{t('data_saver.no_data')}</span>
                    </>
                ) : (
                    <>
                        <Wifi size={20} />
                        <span className="text-sm font-medium hidden sm:block">{t('data_saver.save_data')}</span>
                    </>
                )}
            </button>

            {ultraLiteMode && (
                <div className="mt-2 bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                    <p className="font-bold">{t('data_saver.no_data_mode')}</p>
                    <p className="opacity-90">{t('data_saver.text_only')}</p>
                    <p className="opacity-75 text-[10px] mt-1">{t('data_saver.data_usage')}</p>
                </div>
            )}
        </div>
    )
}
