'use client'

export default function Loading() {
  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo o icono de tu PWA */}
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 bg-primary-foreground rounded-lg animate-pulse" />
        </div>

        {/* Spinner principal */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-primary" />
        </div>

        {/* Texto de carga */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Cargando...</p>
        </div>
      </div>
    </div>
  )
}
