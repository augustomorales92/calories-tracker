'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Check, RotateCcw, RotateCw, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type CameraFacing = 'user' | 'environment'

export function CameraCapturePage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false)
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false)
  const [currentCamera, setCurrentCamera] = useState<CameraFacing>('user')
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  )
  const [cameraError, setCameraError] = useState<string | null>(null)

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

  // Get available cameras
  const getAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      )
      setAvailableCameras(videoDevices)
      console.log(
        `Found ${videoDevices.length} camera(s):`,
        videoDevices.map((d) => d.label)
      )
    } catch (error) {
      console.error('Error enumerating devices:', error)
    }
  }, [])

  const startCameraAndPlay = useCallback(
    async (facingMode: CameraFacing = currentCamera) => {
      // Prevent multiple simultaneous calls
      if (stream || isStartingCamera) {
        console.log('Camera already starting or active, skipping...')
        if (stream) {
          const tracks = stream.getTracks()
          tracks.forEach((track: MediaStreamTrack) => track.stop())
          setStream(null)
        }
        return
      }

      setIsStartingCamera(true)
      setCameraError(null)
      console.log(
        `[PASO 1] Iniciando cámara (${
          facingMode === 'user' ? 'frontal' : 'trasera'
        })...`
      )

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        )
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
        setCurrentCamera(facingMode)
      } catch (error: any) {
        console.error('ERROR durante startCameraAndPlay:', error)

        if (error.name === 'NotAllowedError') {
          setCameraError('Permisos de cámara denegados')
        } else if (error.name === 'NotFoundError') {
          setCameraError('No se encontró la cámara solicitada')
        } else if (error.name === 'OverconstrainedError') {
          setCameraError('La cámara no soporta la configuración solicitada')
        } else {
          setCameraError('Error al iniciar la cámara')
        }
      } finally {
        setIsStartingCamera(false)
      }
    },
    [stream, isStartingCamera, currentCamera]
  )

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
    setCameraError(null)
  }, [stream])

  const switchCamera = useCallback(async () => {
    if (isStartingCamera) return

    const newFacingMode: CameraFacing =
      currentCamera === 'user' ? 'environment' : 'user'
    console.log(`Switching from ${currentCamera} to ${newFacingMode}`)

    // Stop current stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    // Start new camera
    await startCameraAndPlay(newFacingMode)
  }, [currentCamera, stream, isStartingCamera, startCameraAndPlay])

  useEffect(() => {
    if (isDialogOpen) {
      getAvailableCameras()
    }
  }, [isDialogOpen, getAvailableCameras])

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
    setCameraError(null)
    // The useEffect will automatically restart the camera when capturedImage becomes null
  }, [])

  const canSwitchCamera = availableCameras.length > 1

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="e py-3 text-lg" size="lg">
          <Camera className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 gap-0 bg-black border-0">
        {/* Header estilo WhatsApp */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <h1 className="text-white font-medium">Cámara</h1>
            <span className="text-xs text-gray-300">
              ({currentCamera === 'user' ? 'Frontal' : 'Trasera'})
            </span>
          </div>
          {canSwitchCamera && !capturedImage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              disabled={isStartingCamera}
              className="text-white hover:bg-white/20 disabled:opacity-50"
              title="Cambiar cámara"
            >
              <RotateCw className="w-6 h-6" />
            </Button>
          )}
          {!canSwitchCamera && <div className="w-10" />}
        </div>

        {/* Error message */}
        {cameraError && (
          <div className="p-3 bg-red-500 text-white text-center text-sm">
            {cameraError}
          </div>
        )}

        {/* Área principal de cámara/preview */}
        <div className="relative bg-black" style={{ minHeight: '500px' }}>
          {!capturedImage ? (
            <>
              {/* Feed de cámara en vivo */}
              <video
                ref={videoCallbackRef}
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: '500px' }}
              />

              {/* Loading indicator */}
              {isStartingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="mb-2">Iniciando cámara...</div>
                    <div className="text-sm text-gray-300">
                      {currentCamera === 'user'
                        ? 'Cámara frontal'
                        : 'Cámara trasera'}
                    </div>
                  </div>
                </div>
              )}

              {/* Camera switch button (floating) */}
              {canSwitchCamera && !isStartingCamera && stream && (
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={switchCamera}
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70 rounded-full"
                    title="Cambiar cámara"
                  >
                    <RotateCw className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Botón de captura estilo WhatsApp */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={capturePhoto}
                  disabled={!stream || isStartingCamera || !!cameraError}
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

              {/* Camera info overlay */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentCamera === 'user' ? 'Cámara frontal' : 'Cámara trasera'}
              </div>

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
