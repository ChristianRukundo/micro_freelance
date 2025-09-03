"use client"

import { useEffect, useState } from "react"

export function LineChart() {
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-80 bg-muted/20 rounded-md animate-pulse" />
  }

  // In a real app, you would use a charting library like Recharts or Chart.js
  return (
    <div className="h-80 bg-muted/20 rounded-md flex items-center justify-center">
      <p className="text-muted-foreground">Line Chart Placeholder</p>
    </div>
  )
}

export function BarChart() {
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-80 bg-muted/20 rounded-md animate-pulse" />
  }

  // In a real app, you would use a charting library like Recharts or Chart.js
  return (
    <div className="h-80 bg-muted/20 rounded-md flex items-center justify-center">
      <p className="text-muted-foreground">Bar Chart Placeholder</p>
    </div>
  )
}

export function PieChart() {
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-80 bg-muted/20 rounded-md animate-pulse" />
  }

  // In a real app, you would use a charting library like Recharts or Chart.js
  return (
    <div className="h-80 bg-muted/20 rounded-md flex items-center justify-center">
      <p className="text-muted-foreground">Pie Chart Placeholder</p>
    </div>
  )
}
