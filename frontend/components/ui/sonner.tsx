"use client"

import { Toaster as Sonner } from "sonner"
import { useTheme } from "next-themes"; // To get current theme

type ToasterProps = React.ComponentProps<typeof Sonner>

function SonnerToaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-medium group-[.toaster]:rounded-xl", // Custom shadow-medium, rounded-xl
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-success-50 group-[.toaster]:border-success-200 group-[.toaster]:text-success-700",
          error: "group-[.toaster]:bg-error-50 group-[.toaster]:border-error-200 group-[.toaster]:text-error-700",
          warning: "group-[.toaster]:bg-warning-50 group-[.toaster]:border-warning-200 group-[.toaster]:text-warning-700",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-700", // Using a generic blue for info
        },
      }}
      {...props}
    />
  )
}

export { SonnerToaster }