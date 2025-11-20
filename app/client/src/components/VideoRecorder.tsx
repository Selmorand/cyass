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

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_DURATION = 120 // 2 minutes in seconds

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
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)

  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingStartTimeRef = useRef<number>(0)

  const { showError, showSuccess, showWarning } = useNotification()

  // Detect mobile device for compression settings
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  /**
   * Cleanup all media resources and memory - CRITICAL for preventing RAM issues
   */
  const cleanup = () => {
    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current = null

      // Stop all camera tracks (releases camera)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('VideoRecorder: Stopped track:', track.kind)
        })
        streamRef.current = null
      }

      // Revoke preview URL (frees memory)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }

      // Clear video chunks from memory
      chunksRef.current = []

      console.log('VideoRecorder: Cleanup completed')
    } catch (error) {
      console.warn('VideoRecorder: Error during cleanup:', error)
    }
  }

  /**
   * Start recording with compression settings optimized for mobile
   */
  const startRecording = async () => {
    try {
      cleanup() // Clean up any previous recording

      // Set recording state FIRST so video element is rendered
      setIsRecording(true)

      console.log('VideoRecorder: Requesting camera access...')

      // Small delay to ensure video element is in DOM
      await new Promise(resolve => setTimeout(resolve, 100))

      // Mobile-optimized video constraints for lower RAM usage
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: isMobile ? 640 : 1280, max: isMobile ? 720 : 1280 },
          height: { ideal: isMobile ? 480 : 720, max: isMobile ? 720 : 720 }
        },
        audio: true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      console.log('VideoRecorder: Camera access granted, setting up preview...')

      // Set up video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.muted = true
        videoPreviewRef.current.playsInline = true

        // Force play
        try {
          await videoPreviewRef.current.play()
          console.log('VideoRecorder: Preview playing')
        } catch (playError) {
          console.warn('VideoRecorder: Autoplay prevented:', playError)
          // Try to play on user interaction
        }
      } else {
        console.error('VideoRecorder: Video element not found in DOM')
      }

      // Determine best codec and mime type
      let mimeType = 'video/webm;codecs=vp8'
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9'
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8'
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4'
      }

      console.log('VideoRecorder: Using mimeType:', mimeType)

      // Aggressive compression for mobile - 500 Kbps for mobile, 1 Mbps for desktop
      const bitrate = isMobile ? 500000 : 1000000

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate, // Lower bitrate = smaller files
        audioBitsPerSecond: 64000    // Low audio bitrate
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Collect video data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('VideoRecorder: Recording stopped, processing...')

        const blob = new Blob(chunksRef.current, { type: mimeType })

        console.log('VideoRecorder: Video blob created:', {
          size: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
          type: blob.type
        })

        // Check file size
        if (blob.size > MAX_FILE_SIZE) {
          showError(`Video too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB. Try recording for less time.`)
          cleanup()
          setIsRecording(false)
          setRecordingTime(0)
          return
        }

        setVideoBlob(blob)

        // Create preview URL for playback
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setVideoDuration(recordingTime)
        setIsPreviewing(true)
        setIsRecording(false)
        setRecordingTime(0)

        // Release camera immediately after recording
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        console.error('VideoRecorder: MediaRecorder error:', event.error)
        showError('Recording error occurred')
        cleanup()
        setIsRecording(false)
        setRecordingTime(0)
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every 1 second
      recordingStartTimeRef.current = Date.now()

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        setRecordingTime(elapsed)

        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION) {
          stopRecording()
        }
      }, 1000)

      console.log('VideoRecorder: Recording started')

    } catch (error) {
      console.error('VideoRecorder: Failed to start recording:', error)

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          showError('Camera permission denied. Please allow camera access in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          showError('No camera found on this device.')
        } else {
          showError(`Failed to access camera: ${error.message}`)
        }
      } else {
        showError('Failed to start recording. Please check camera permissions.')
      }

      cleanup()
      setIsRecording(false)
    }
  }

  /**
   * Stop recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  /**
   * Upload video to storage
   */
  const uploadVideo = async () => {
    if (!videoBlob) return

    try {
      setIsUploading(true)

      console.log('VideoRecorder: Uploading video...')

      // Upload video blob
      const videoUrl = await storageService.uploadVideo(videoBlob, reportId, roomId)

      console.log('VideoRecorder: Upload successful:', videoUrl)

      // Callback with video details
      onVideoUploaded(videoUrl, videoDuration, videoBlob.size)

      showSuccess('Room walkthrough video uploaded successfully!')

      // Cleanup
      cleanup()
      setVideoBlob(null)
      setIsPreviewing(false)
      setVideoDuration(0)

    } catch (error) {
      console.error('VideoRecorder: Upload failed:', error)
      showError(error instanceof Error ? error.message : 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Discard recorded video
   */
  const discardVideo = () => {
    cleanup()
    setVideoBlob(null)
    setIsPreviewing(false)
    setVideoDuration(0)
  }

  /**
   * Delete existing video
   */
  const deleteExistingVideo = () => {
    if (confirm('Delete the existing room walkthrough video?')) {
      onVideoUploaded('', 0, 0) // Empty values to delete
      showSuccess('Video removed')
    }
  }

  /**
   * Format seconds as MM:SS
   */
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
          Record a video walkthrough of {roomName}. Compressed for low memory usage.
        </p>

        {/* Existing Video */}
        {existingVideoUrl && !isRecording && !isPreviewing && (
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

        {/* Recording Interface */}
        {isRecording && (
          <div>
            <div className="mb-3 position-relative">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-100 rounded"
                style={{ maxHeight: '400px', backgroundColor: '#000' }}
              />
              {/* Recording indicator */}
              <div
                className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-danger text-white rounded"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              >
                ⏺ REC {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="btn btn-danger w-100"
            >
              <span className="me-2">⏹</span>
              Stop Recording
            </button>

            <div className="alert alert-warning mt-3 mb-0 small">
              <strong>Recording in progress:</strong>
              <ul className="mb-0 mt-1 ps-3">
                <li>Video will auto-stop at 2 minutes</li>
                <li>Hold phone steady and move slowly</li>
                <li>Show all areas of the room</li>
              </ul>
            </div>
          </div>
        )}

        {/* Start Recording Button */}
        {!isRecording && !isPreviewing && !existingVideoUrl && (
          <div>
            <button
              onClick={startRecording}
              className="btn btn-primary w-100"
            >
              <span className="me-2">🎥</span>
              Start Recording
            </button>

            <div className="alert alert-light mt-3 mb-0 small">
              <strong>Tips:</strong>
              <ul className="mb-0 mt-1 ps-3">
                <li>Video is compressed to {isMobile ? '500 Kbps' : '1 Mbps'} to save RAM</li>
                <li>Hold phone steady and move slowly</li>
                <li>Show all areas of the room</li>
                <li>Maximum 2 minutes recording time</li>
                <li>Good lighting helps video quality</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preview & Upload */}
        {isPreviewing && videoBlob && (
          <div>
            <div className="mb-3">
              <video
                ref={videoPreviewRef}
                src={previewUrl || undefined}
                controls
                className="w-100 rounded"
                style={{ maxHeight: '300px', backgroundColor: '#000' }}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 small text-muted">
              <span>Duration: {formatTime(videoDuration)}</span>
              <span>Size: {(videoBlob.size / 1024 / 1024).toFixed(1)}MB</span>
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
      </div>
    </div>
  )
}
