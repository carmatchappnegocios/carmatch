// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import React from 'react'
import {
    Activity, Armchair, Bike, CircleDot, Disc, Droplet, Droplets, Fuel, Gauge,
    Glasses, Hammer, HelpCircle, Hospital, Key, Lightbulb, Mountain, Package,
    Paintbrush, PenTool, Plane, PlugZap, Recycle, Settings2, ShieldAlert,
    ShieldCheck, Ship, ShoppingBag, Snowflake, Speaker, Sparkles, Square,
    SquareParking, Syringe, Thermometer, TrainFront, Truck, Wallet, Wrench,
    Wind, Zap
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
    Activity, Armchair, Bike, CircleDot, Disc, Droplet, Droplets, Fuel, Gauge,
    Glasses, Hammer, HelpCircle, Hospital, Key, Lightbulb, Mountain, Package,
    Paintbrush, PenTool, Plane, PlugZap, Recycle, Settings2, ShieldAlert,
    ShieldCheck, Ship, ShoppingBag, Snowflake, Speaker, Sparkles, Square,
    SquareParking, Syringe, Thermometer, TrainFront, Truck, Wallet, Wrench,
    Wind, Zap
}

interface CategoryIconProps {
    iconName: string
    className?: string
    size?: number
    color?: string
}

const CategoryIcon = ({ iconName, className = '', size = 20, color }: CategoryIconProps) => {
    const Icon = ICON_MAP[iconName] || HelpCircle
    return <Icon className={className} size={size} style={{ color }} />
}

export default CategoryIcon
