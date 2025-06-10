'use client'

import Image from 'next/image'

export default function Loading() {
  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">

        {/* Spinner principal */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-primary">
            <Image
              src="/app-logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-12 h-12"
            />
          </div>
        </div>

        {/* Texto de carga */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Cargando...</p>
        </div>
      </div>
    </div>
  )
}
