'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Camera, Check, RotateCcw, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export function CameraCapturePage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false)
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node
      setIsVideoReady(true)
      console.log('Video Ref está LISTO y asignado.')
    } else {
      setIsVideoReady(false)
      console.log('Video Ref se ha desmontado.')
    }
  }, [])

  const startCameraAndPlay = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (stream || isStartingCamera) {
      console.log('Camera already starting or active, skipping...')
      return
    }

    setIsStartingCamera(true)
    console.log('[PASO 1] Iniciando cámara y reproducción...')

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })
      console.log('[PASO 2] Permiso de cámara OK.')

      const videoElement = videoRef.current
      if (!videoElement) {
        console.log('Video element not available')
        setIsStartingCamera(false)
        return
      }

      // Clear any existing srcObject first
      if (videoElement.srcObject) {
        const existingStream = videoElement.srcObject as MediaStream
        existingStream.getTracks().forEach((track) => track.stop())
        videoElement.srcObject = null
      }

      // Set new stream and play
      videoElement.srcObject = mediaStream

      // Wait for loadedmetadata before playing
      await new Promise<void>((resolve, reject) => {
        const onLoadedMetadata = () => {
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
          resolve()
        }

        const onError = () => {
          videoElement.removeEventListener('error', onError)
          reject(new Error('Video loading failed'))
        }

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata)
        videoElement.addEventListener('error', onError)

        // Timeout after 5 seconds
        setTimeout(() => {
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
          videoElement.removeEventListener('error', onError)
          reject(new Error('Video loading timeout'))
        }, 5000)
      })

      await videoElement.play()

      console.log('[PASO 3] La reproducción ha comenzado con éxito.')
      setStream(mediaStream)
    } catch (error) {
      console.error('ERROR durante startCameraAndPlay:', error)
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Acción bloqueada por el navegador.')
      } else {
        alert('Hubo un problema al iniciar la cámara.')
      }
      setIsDialogOpen(false)
    } finally {
      setIsStartingCamera(false)
    }
  }, [stream, isStartingCamera])

  const stopCamera = useCallback(() => {
    if (stream) {
      console.log('[INFO] Deteniendo la cámara.')
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null
    }

    setCapturedImage(null)
    setIsStartingCamera(false)
  }, [stream])

  useEffect(() => {
    if (isDialogOpen && isVideoReady && !capturedImage) {
      startCameraAndPlay()
    } else if (!isDialogOpen) {
      stopCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [
    isDialogOpen,
    isVideoReady,
    capturedImage,
    startCameraAndPlay,
    stopCamera,
    stream
  ])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageDataUrl)

        // Stop the video stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }

        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }
  }, [stream])

  const acceptPhoto = useCallback(() => {
    if (capturedImage) {
      const link = document.createElement('a')
      link.href = capturedImage
      link.download = `foto-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsDialogOpen(false)
    }
  }, [capturedImage])

  const discardPhoto = useCallback(() => {
    setCapturedImage(null)
    // The useEffect will automatically restart the camera when capturedImage becomes null
  }, [])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTitle></DialogTitle>
      <DialogTrigger asChild>
        <Button className="  py-3 text-lg" size="lg">
          <Camera className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 gap-0 bg-black border-0">
        {/* Header estilo WhatsApp */}
        <div className="flex items-center justify-between p-2 bg-black/80 backdrop-blur-sm relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <h1 className="text-white font-medium">Cámara</h1>
          <div className="w-10" />
        </div>

        {/* Área principal de cámara/preview */}
        <div className="relative bg-black" style={{ minHeight: '80vh' }}>
          {!capturedImage ? (
            <>
              {/* Feed de cámara en vivo */}
              <video
                ref={videoCallbackRef}
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: '80vh' }}
              />

              {/* Loading indicator */}
              {isStartingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white">Iniciando cámara...</div>
                </div>
              )}

              {/* Botón de captura estilo WhatsApp */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={capturePhoto}
                  disabled={!stream || isStartingCamera}
                  className="bg-white hover:bg-gray-100 text-black px-8 py-4 text-lg font-medium shadow-lg disabled:opacity-50"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capturar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Preview de foto capturada */}
              <img
                src={capturedImage || '/placeholder.svg'}
                alt="Foto capturada"
                className="w-full h-full object-contain"
                style={{ minHeight: '500px' }}
              />

              {/* Botones de aceptar/descartar */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <Button
                  onClick={discardPhoto}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Repetir
                </Button>

                <Button
                  onClick={acceptPhoto}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
                  size="lg"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  )
}
