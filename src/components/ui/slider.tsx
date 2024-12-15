"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number[]
  onValueChange?: (values: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (onValueChange) {
        onValueChange([newValue])
      }
    }

    return (
      <input
        ref={ref}
        type="range"
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
          "dark:bg-gray-700",
          "focus:outline-none focus:ring-4 focus:ring-blue-300",
          "dark:focus:ring-blue-800",
          className
        )}
        {...props}
        value={value ? value[0] : undefined}
        onChange={handleChange}
      />
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
