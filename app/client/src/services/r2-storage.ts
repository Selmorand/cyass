import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from './supabase'

// R2 Configuration
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || ''
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '' // e.g., https://pub-xxxxx.r2.dev

// Create S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export const r2StorageService = {
  /**
   * Upload photo to Cloudflare R2
   * Organized path: {userId}/{reportId}/{itemId}/{timestamp}.jpg
   * Returns public URL for the uploaded photo
   */
  async uploadPhoto(file: File, reportId: string, itemId: string): Promise<string> {
    try {
      console.log('R2: Checking authentication...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('R2: User not authenticated')
        throw new Error('User not authenticated')
      }
      console.log('R2: User authenticated:', user.id)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${reportId}/${itemId}/${Date.now()}.${fileExt}`
      console.log('R2: Uploading to path:', fileName)

      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      })

      await r2Client.send(command)

      // Generate public URL
      const publicUrl = `${R2_PUBLIC_URL}/${fileName}`
      console.log('R2: Upload successful, public URL:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('R2: uploadPhoto failed:', error)
      throw error
    }
  },

  /**
   * Upload PDF to Cloudflare R2
   * Organized path: {userId}/{reportId}/report-{timestamp}.pdf
   * Returns public URL for the uploaded PDF
   */
  async uploadPDF(file: Blob, reportId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileName = `${user.id}/${reportId}/report-${Date.now()}.pdf`

      // Convert blob to ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: 'application/pdf',
        CacheControl: 'public, max-age=31536000', // 1 year cache
      })

      await r2Client.send(command)

      // Generate public URL
      const publicUrl = `${R2_PUBLIC_URL}/${fileName}`
      console.log('R2: PDF upload successful:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('R2: uploadPDF failed:', error)
      throw error
    }
  },

  /**
   * Get external URL for image (for PDF linking)
   * Since R2 uses public URLs, we just return the URL as-is
   */
  async getExternalImageUrl(imageUrl: string): Promise<string> {
    // R2 URLs are already public and external-accessible
    return imageUrl
  },

  /**
   * Compress image before upload (same as Supabase version)
   */
  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  },

  /**
   * Check if R2 is properly configured
   */
  isConfigured(): boolean {
    return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL)
  }
}
