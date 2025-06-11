'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Check, RotateCcw, RotateCw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type CameraFacing = 'user' | 'environment'

export function CameraCapturePage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentCamera, setCurrentCamera] = useState<CameraFacing>('user')
  const [error, setError] = useState<string | null>(null)
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start camera function - improved with better error handling
  const startCamera = async (facingMode: CameraFacing = 'user') => {
    if (isLoading) {
      console.log('⏳ Camera already starting, skipping...')
      return
    }

    console.log(`🎥 Starting camera: ${facingMode}`)
    setIsLoading(true)
    setError(null)
    setCapturedImage(null) // Clear any captured image

    try {
      // Stop any existing stream first
      if (stream) {
        console.log('🛑 Stopping existing stream')
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.load() // Reset video element
      }

      // Small delay to ensure cleanup
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Get new stream
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      console.log('📱 Requesting camera access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('✅ Camera access granted')

      // Verify video element is still available
      if (!videoRef.current) {
        throw new Error('Video element not available')
      }

      // Set up video element
      videoRef.current.srcObject = mediaStream

      // Wait for video to load with better error handling
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current!
        let resolved = false

        const onLoadedMetadata = () => {
          if (resolved) return
          resolved = true
          console.log(
            `📺 Video loaded: ${video.videoWidth}x${video.videoHeight}`
          )
          video.removeEventListener('loadedmetadata', onLoadedMetadata)
          video.removeEventListener('error', onError)
          resolve()
        }

        const onError = (e: Event) => {
          if (resolved) return
          resolved = true
          console.error('❌ Video loading error:', e)
          video.removeEventListener('loadedmetadata', onLoadedMetadata)
          video.removeEventListener('error', onError)
          reject(new Error('Video loading failed'))
        }

        video.addEventListener('loadedmetadata', onLoadedMetadata)
        video.addEventListener('error', onError)

        // Fallback timeout
        setTimeout(() => {
          if (resolved) return
          resolved = true
          video.removeEventListener('loadedmetadata', onLoadedMetadata)
          video.removeEventListener('error', onError)
          console.log('⏰ Video loading timeout, proceeding...')
          resolve()
        }, 3000)
      })

      // Start playback
      await videoRef.current.play()
      console.log('▶️ Video playback started')

      // Check for multiple cameras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        )
        setHasMultipleCameras(videoDevices.length > 1)
        console.log(`📷 Found ${videoDevices.length} camera(s)`)
      } catch (err) {
        console.warn('Could not enumerate devices:', err)
      }

      setStream(mediaStream)
      setCurrentCamera(facingMode)
      console.log('🎉 Camera setup completed successfully')
    } catch (err: any) {
      console.error('❌ Camera error:', err)
      let errorMessage = 'Error al iniciar la cámara'

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró la cámara'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Configuración de cámara no soportada'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación'
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Stop camera function
  const stopCamera = () => {
    console.log('🛑 Stopping camera')
    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log(`🔌 Stopping track: ${track.kind} (${track.readyState})`)
        track.stop()
      })
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load() // Reset video element
    }
    setCapturedImage(null)
    setError(null)
  }

  // Switch camera
  const switchCamera = async () => {
    if (isLoading || !hasMultipleCameras) return
    const newFacing: CameraFacing =
      currentCamera === 'user' ? 'environment' : 'user'
    console.log(`🔄 Switching camera to: ${newFacing}`)
    await startCamera(newFacing)
  }

  // Capture photo - IMPROVED to keep stream active
  const capturePhoto = () => {
    console.log('📸 Capturing photo...')

    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Missing video or canvas element')
      setError('Error: elementos no disponibles')
      return
    }

    if (!stream) {
      console.error('❌ No active stream')
      setError('Error: cámara no activa')
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Cannot get canvas context')
      }

      // Get video dimensions
      const width = video.videoWidth || 640
      const height = video.videoHeight || 480

      console.log(`📐 Video dimensions: ${width}x${height}`)

      // Set canvas size
      canvas.width = width
      canvas.height = height

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, width, height)

      // Convert to image data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)

      // Validate image data
      if (
        !imageDataUrl ||
        imageDataUrl === 'data:,' ||
        imageDataUrl.length < 100
      ) {
        throw new Error('Invalid image data')
      }

      console.log(
        `✅ Photo captured successfully (${imageDataUrl.length} bytes)`
      )

      // Set captured image - this triggers preview mode
      setCapturedImage(imageDataUrl)

      // DON'T stop the stream or pause the video - keep it running for easier restart
      console.log('🎥 Keeping stream active for potential retake')
    } catch (err) {
      console.error('❌ Capture error:', err)
      setError('Error al capturar la foto')
    }
  }

  // Accept photo
  const acceptPhoto = () => {
    if (!capturedImage) return

    console.log('💾 Downloading photo...')
    const link = document.createElement('a')
    link.href = capturedImage
    link.download = `foto-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Close dialog and reset everything
    setIsDialogOpen(false)
  }

  // Discard photo - FIXED to properly restart camera
  const discardPhoto = async () => {
    console.log('🗑️ Discarding photo and restarting camera...')

    // Clear captured image first
    setCapturedImage(null)
    setError(null)

    // Check if we still have an active stream
    if (stream && videoRef.current && videoRef.current.srcObject) {
      console.log('🔄 Stream still active, resuming video...')
      try {
        // Try to resume the existing video
        await videoRef.current.play()
        console.log('▶️ Video resumed successfully')
        return // Success - no need to restart camera
      } catch (err) {
        console.warn('⚠️ Could not resume video, restarting camera:', err)
      }
    }

    // If we get here, we need to restart the camera completely
    console.log('🔄 Restarting camera completely...')
    await startCamera(currentCamera)
  }

  // Handle dialog state - SIMPLIFIED to prevent infinite loops
  useEffect(() => {
    console.log(`🔄 Dialog state changed: ${isDialogOpen}`)

    if (isDialogOpen) {
      // Start camera when dialog opens
      startCamera(currentCamera)
    } else {
      // Stop camera when dialog closes
      stopCamera()
    }

    // Cleanup function
    return () => {
      if (stream) {
        console.log('🧹 Cleanup: stopping stream')
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isDialogOpen]) // ONLY depend on isDialogOpen

  // Debug info
  const debugInfo = {
    isDialogOpen,
    capturedImage: !!capturedImage,
    stream: !!stream,
    streamActive: stream?.active,
    videoTracks: stream?.getVideoTracks().length || 0,
    isLoading,
    currentCamera,
    error: !!error
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className=" py-3 text-lg" size="lg">
          <Camera className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 gap-0 bg-black border-0 min-h-[500px]">
        {/* Header */}
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
            {stream && (
              <span className="text-xs text-gray-300">
                ({currentCamera === 'user' ? 'Frontal' : 'Trasera'})
              </span>
            )}
          </div>

          {hasMultipleCameras && !capturedImage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              disabled={isLoading}
              className="text-white hover:bg-white/20 disabled:opacity-50"
              title="Cambiar cámara"
            >
              <RotateCw className="w-6 h-6" />
            </Button>
          )}
          {(!hasMultipleCameras || capturedImage) && <div className="w-10" />}
        </div>

        {/* Debug bar - Enhanced */}
       {/*  <div className="p-1 bg-blue-600 text-white text-xs text-center">
          Estado: {capturedImage ? 'PREVIEW' : 'CAMARA'} | Stream:{' '}
          {stream?.active ? 'ACTIVO' : 'INACTIVO'} | Tracks:{' '}
          {stream?.getVideoTracks().length || 0} | Loading:{' '}
          {isLoading ? 'SI' : 'NO'}
        </div> */}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500 text-white text-center text-sm">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null)
                startCamera(currentCamera)
              }}
              className="ml-2 text-white hover:bg-red-600"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Main camera area */}
        <div className="relative bg-black" style={{ minHeight: '500px' }}>
          {capturedImage ? (
            <>
              {/* PREVIEW MODE - Show captured image */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ minHeight: '500px' }}
              >
                <img
                  src={capturedImage || '/placeholder.svg'}
                  alt="Foto capturada"
                  className="max-w-full max-h-full object-contain"
                  style={{ minHeight: '500px' }}
                />
              </div>

              {/* Camera info */}
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                ✅ Foto capturada (
                {currentCamera === 'user' ? 'Frontal' : 'Trasera'})
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <Button
                  onClick={discardPhoto}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 disabled:opacity-50"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isLoading ? 'Reiniciando...' : 'Repetir'}
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
          ) : (
            <>
              {/* CAMERA MODE - Show live feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: '500px' }}
              />

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-white text-center">
                    <div className="mb-2">🎥 Iniciando cámara...</div>
                    <div className="text-sm text-gray-300">
                      {currentCamera === 'user'
                        ? 'Cámara frontal'
                        : 'Cámara trasera'}
                    </div>
                  </div>
                </div>
              )}

              {/* Camera switch button */}
            {/*   {hasMultipleCameras && stream && !isLoading && (
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
              )} */}

              {/* Capture button */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={capturePhoto}
                  disabled={!stream || isLoading || !!error}
                  className="bg-white hover:bg-gray-100 text-black px-8 py-4 text-lg font-medium shadow-lg disabled:opacity-50"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capturar
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  )
}
