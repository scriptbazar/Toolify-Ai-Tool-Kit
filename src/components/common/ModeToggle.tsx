"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  
  // To avoid hydration mismatch, we need to wait for the component to mount
  // before we can know the current theme.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Render a placeholder or nothing until mounted
    return <div className="w-11 h-6" />
  }

  const isDarkMode = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark")
  }

  return (
    <div className="flex items-center">
      <Switch
        id="theme-toggle"
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Label htmlFor="theme-toggle" className="sr-only">
        Toggle theme
      </Label>
    </div>
  )
}
