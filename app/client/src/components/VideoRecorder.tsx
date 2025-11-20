import { useState, useRef, useEffect } from 'react'
import { storageService } from '../services/storage'
import { useNotification } from '../contexts/NotificationContext'

interface VideoRecorderProps {
  reportId: string
  roomId: string
  roomName: string
  onVideoUploaded: (videoUrl: string, duration: number, fileSize: number) => void
  existingVideoUrl?: string
}

const MAX_DURATION = 120 // 2 minutes in seconds
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function VideoRecorder({
  reportId,
  roomId,
  roomName,
  onVideoUploaded,
  existingVideoUrl
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const livePreviewRef = useRef<HTMLVideoElement>(null)

  const { showError, showSuccess, showWarning } = useNotification()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  /**
   * Cleanup all media resources and memory
   * CRITICAL for preventing memory leaks
   */
  const cleanup = () => {
    try {
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      // Clean up live preview
      if (livePreviewRef.current) {
        livePreviewRef.current.srcObject = null
      }

      // Clean up media recorder
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
        mediaRecorderRef.current = null
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Revoke object URLs to free memory
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }

      // Clear chunks
      chunksRef.current = []

      console.log('VideoRecorder: Cleanup completed')
    } catch (error) {
      console.warn('VideoRecorder: Error during cleanup:', error)
    }
  }

  const startRecording = async () => {
    try {
      // Clean up any existing resources first
      cleanup()

      // Request camera access (environment = rear camera on mobile)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24 },
          facingMode: 'environment'
        },
        audio: true
      })

      streamRef.current = stream

      // Show live preview - with error handling
      if (livePreviewRef.current) {
        livePreviewRef.current.srcObject = stream

        // Play the video stream with error handling
        try {
          await livePreviewRef.current.play()
          console.log('Live preview started successfully')
        } catch (playError) {
          console.warn('Could not auto-play live preview:', playError)
          // On some browsers, autoplay might be blocked
          // The video will still record, just no preview
        }
      }

      // Configure MediaRecorder for efficient compression
      const options: MediaRecorderOptions = {
        mimeType: getSupportedMimeType(),
        videoBitsPerSecond: 1000000  // 1 Mbps - good quality, small file
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      // Collect video chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' })

        // Check file size
        if (blob.size > MAX_FILE_SIZE) {
          showError(`Video file is too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB. Try recording for less time.`)
          cleanup()
          setRecordingTime(0)
          setIsRecording(false)
          return
        }

        setRecordedBlob(blob)

        // Create preview URL
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setIsPreviewing(true)

        // Stop camera to save battery
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        console.log('Recording completed:', {
          size: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
          duration: `${recordingTime}s`
        })
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1

          // Auto-stop at 2 minutes
          if (newTime >= MAX_DURATION) {
            stopRecording()
            showWarning('Maximum recording time (2 minutes) reached')
          }

          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Failed to start recording:', error)
      cleanup()

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          showError('Camera permission denied. Please allow camera access to record room walkthroughs.')
        } else if (error.name === 'NotFoundError') {
          showError('No camera found on this device.')
        } else {
          showError('Failed to access camera: ' + error.message)
        }
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRecording(false)
  }

  const uploadVideo = async () => {
    if (!recordedBlob) return

    try {
      setIsUploading(true)

      // Upload video
      const videoUrl = await storageService.uploadVideo(recordedBlob, reportId, roomId)

      // Callback with video details
      onVideoUploaded(videoUrl, recordingTime, recordedBlob.size)

      showSuccess('Room walkthrough video uploaded successfully!')

      // Cleanup after upload
      cleanup()
      setRecordedBlob(null)
      setIsPreviewing(false)
      setRecordingTime(0)

    } catch (error) {
      console.error('Failed to upload video:', error)
      showError(error instanceof Error ? error.message : 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  const discardVideo = () => {
    cleanup()
    setRecordedBlob(null)
    setIsPreviewing(false)
    setRecordingTime(0)
  }

  const deleteExistingVideo = () => {
    if (confirm('Delete the existing room walkthrough video?')) {
      onVideoUploaded('', 0, 0) // Empty values to delete
      showSuccess('Video removed')
    }
  }

  const getSupportedMimeType = (): string => {
    const types = [
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm' // fallback
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-3">
        <h5 className="card-title fw-medium text-dark mb-3">
          📹 Room Walkthrough Video (Optional)
        </h5>

        <p className="small text-muted mb-3">
          Record a 30-second to 2-minute video walkthrough of {roomName}.
          This provides additional context for your inspection.
        </p>

        {/* Existing Video */}
        {existingVideoUrl && !isPreviewing && (
          <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
            <span className="small">✅ Video recorded for this room</span>
            <div>
              <a
                href={existingVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary me-2"
              >
                View
              </a>
              <button
                onClick={deleteExistingVideo}
                className="btn btn-sm btn-outline-danger"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        {!isRecording && !isPreviewing && !existingVideoUrl && (
          <button
            onClick={startRecording}
            className="btn btn-primary w-100"
            disabled={isUploading}
          >
            <span className="me-2">🎥</span>
            Start Recording
          </button>
        )}

        {/* Recording Status with Live Preview */}
        {isRecording && (
          <div className="text-center">
            {/* Live camera preview */}
            <div className="mb-3 position-relative">
              <video
                ref={livePreviewRef}
                autoPlay
                playsInline
                muted
                className="w-100 rounded"
                style={{
                  maxHeight: '400px',
                  backgroundColor: '#000',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror the preview like a selfie camera
                }}
                onLoadedMetadata={(e) => {
                  // Ensure video plays when metadata is loaded
                  const video = e.currentTarget
                  video.play().catch(err => console.warn('Play failed:', err))
                }}
              />
              {/* Recording indicator overlay */}
              <div
                className="position-absolute top-0 start-0 m-2"
                style={{ zIndex: 10 }}
              >
                <span className="badge bg-danger fs-6 px-3 py-2">
                  ⏺ REC {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
                </span>
              </div>

              {/* Fallback message if preview doesn't work */}
              <div
                className="position-absolute top-50 start-50 translate-middle text-white text-center"
                style={{ pointerEvents: 'none' }}
              >
                <small className="opacity-50">
                  Recording in progress...<br/>
                  {formatTime(recordingTime)}
                </small>
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="btn btn-danger btn-lg w-100"
            >
              ⏹ Stop Recording
            </button>
            <p className="small text-muted mt-2">
              Point camera around the room. Recording will auto-stop at 2 minutes.
            </p>
          </div>
        )}

        {/* Preview & Upload */}
        {isPreviewing && recordedBlob && (
          <div>
            <div className="mb-3">
              <video
                ref={videoPreviewRef}
                src={previewUrl || undefined}
                controls
                className="w-100 rounded"
                style={{ maxHeight: '300px' }}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 small text-muted">
              <span>Duration: {formatTime(recordingTime)}</span>
              <span>Size: {(recordedBlob.size / 1024 / 1024).toFixed(1)}MB</span>
            </div>

            <div className="d-grid gap-2">
              <button
                onClick={uploadVideo}
                className="btn btn-success"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="me-2">✓</span>
                    Save Video
                  </>
                )}
              </button>

              <button
                onClick={discardVideo}
                className="btn btn-outline-secondary"
                disabled={isUploading}
              >
                Discard & Re-record
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        {!isRecording && !isPreviewing && !existingVideoUrl && (
          <div className="alert alert-light mt-3 mb-0 small">
            <strong>Tips:</strong>
            <ul className="mb-0 mt-1 ps-3">
              <li>Hold phone steady and move slowly</li>
              <li>Show all areas of the room</li>
              <li>Keep recording under 2 minutes</li>
              <li>Good lighting helps video quality</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
