"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavButtonProps {
  icon: LucideIcon
  label: string
  isActive?: boolean
  onClick?: () => void
}

export function NavButton({
  icon: Icon,
  label,
  isActive,
  onClick
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
        "hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
