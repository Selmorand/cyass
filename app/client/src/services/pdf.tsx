import { Document, Page, Text, View, StyleSheet, Image, Link, pdf } from '@react-pdf/renderer'
import type { Report, Property, RoomType } from '../types'
import { DEFAULT_INSPECTION_CATEGORIES } from '../types/report'
import { storageService } from './storage'
import QRCode from 'qrcode-generator'

// Extended photo type for PDF processing
type ProcessedPhoto = {
  thumbnailUrl: string // Data URL for embedding in PDF
  externalUrl: string | null // HTTP URL for clickable link
}

/**
 * Convert image URL to data URL for PDF embedding
 * This eliminates CORS issues with @react-pdf/renderer
 */
async function imageUrlToDataUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Enable CORS

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(dataUrl)
      } catch (error) {
        console.error('Error converting image to data URL:', error)
        reject(error)
      }
    }

    img.onerror = () => {
      console.error('Failed to load image:', imageUrl)
      reject(new Error(`Failed to load image: ${imageUrl}`))
    }

    img.src = imageUrl
  })
}

// Generate QR code for report URL
function generateQRCode(reportId: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const reportUrl = `https://app.cyass.co.za/public/reports/${reportId}`
      console.log('Generating QR code for URL:', reportUrl)
      console.log('Report ID:', reportId)
      
      // Create QR code object
      const qr = QRCode(0, 'M')
      qr.addData(reportUrl)
      qr.make()
      
      // Create canvas and draw QR code
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const moduleCount = qr.getModuleCount()
      const cellSize = 4
      const margin = 8
      
      canvas.width = moduleCount * cellSize + margin * 2
      canvas.height = moduleCount * cellSize + margin * 2
      
      if (ctx) {
        // Fill background white
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw QR code modules
        ctx.fillStyle = '#000000'
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                col * cellSize + margin,
                row * cellSize + margin,
                cellSize,
                cellSize
              )
            }
          }
        }
        
        // Convert to PNG data URL
        const dataUrl = canvas.toDataURL('image/png')
        console.log('QR code generated successfully for report:', reportId)
        resolve(dataUrl)
      } else {
        console.error('Could not get canvas context')
        resolve('')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      resolve('')
    }
  })
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 8,
    color: '#999999',
    transform: 'rotate(45deg)',
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#277020',
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  qrCodeSection: {
    alignItems: 'center',
    marginLeft: 20,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  qrCodeText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  qrCodeUrl: {
    fontSize: 7,
    color: '#0066CC',
    textAlign: 'center',
    marginTop: 3,
    textDecoration: 'underline',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#277020',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
  },
  propertyInfo: {
    fontSize: 10,
    color: '#888888',
  },
  roomSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    backgroundColor: '#F8F9FA',
    padding: 8,
    marginBottom: 10,
  },
  itemSection: {
    marginBottom: 15,
    borderBottom: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  itemName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 8,
  },
  itemCondition: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    color: '#FFFFFF',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  itemNotes: {
    fontSize: 9,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    color: '#333333',
  },
  itemPhotosCount: {
    fontSize: 8,
    color: '#888888',
    marginBottom: 5,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },
  photoContainer: {
    width: '32%',
    marginRight: '2%',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#666666',
    borderTop: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  disclaimer: {
    fontSize: 7,
    color: '#888888',
    marginTop: 5,
    lineHeight: 1.2,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#277020',
  },
  statLabel: {
    fontSize: 8,
    color: '#666666',
  }
})

interface PDFReportProps {
  report: Report
  property: Property
  creatorRole: string
  creatorName: string
  qrCodeDataURL?: string
}

const getConditionColor = (condition: string): string => {
  const colors: { [key: string]: string } = {
    'Good': '#277020',
    'Fair': '#f5a409',
    'Poor': '#c62121',
    'Urgent Repair': '#c62121',
    'N/A': '#777777'
  }
  return colors[condition] || '#777777'
}

function PDFReport({ report, property, creatorRole, creatorName, qrCodeDataURL }: PDFReportProps) {
  const totalItems = report.rooms?.reduce((total, room) => total + (room.items?.length || 0), 0) || 0
  const totalPhotos = report.rooms?.reduce((total, room) => 
    total + (room.items?.reduce((itemTotal, item) => itemTotal + (item.photos?.length || 0), 0) || 0), 0) || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>
          CYAss SOLO REPORT - Created by {creatorRole.toUpperCase()} - Not jointly signed
        </Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              CYAss Property Condition Report
            </Text>
            <Text style={styles.subtitle}>
              {property.name}
            </Text>
            <Text style={styles.propertyInfo}>
              {property.address.street_number} {property.address.street_name}, {property.address.suburb}
            </Text>
            <Text style={styles.propertyInfo}>
              {property.address.city}, {property.address.province} {property.address.postal_code}
            </Text>
            <Text style={styles.propertyInfo}>
              GPS: {property.gps_coordinates.latitude.toFixed(6)}, {property.gps_coordinates.longitude.toFixed(6)} 
              {property.gps_coordinates.accuracy && ` (±${property.gps_coordinates.accuracy}m)`}
            </Text>
          </View>
          
          {/* QR Code Section */}
          {qrCodeDataURL && (
            <View style={styles.qrCodeSection}>
              <Image style={styles.qrCode} src={qrCodeDataURL} />
              <Text style={styles.qrCodeText}>Scan for Online Report</Text>
              <Link src={`https://app.cyass.co.za/public/reports/${report.id}`}>
                <Text style={styles.qrCodeUrl}>app.cyass.co.za/public/reports/{report.id.substring(0, 8)}</Text>
              </Link>
            </View>
          )}
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{report.rooms?.length || 0}</Text>
            <Text style={styles.statLabel}>ROOMS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={styles.statLabel}>ITEMS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPhotos}</Text>
            <Text style={styles.statLabel}>PHOTOS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{new Date(report.created_at).toLocaleDateString()}</Text>
            <Text style={styles.statLabel}>CREATED</Text>
          </View>
        </View>

        {/* Room sections */}
        {report.rooms?.map((room) => {
          const categories = DEFAULT_INSPECTION_CATEGORIES[room.type as RoomType] || []
          
          return (
            <View key={room.id} style={styles.roomSection}>
              <Text style={styles.roomTitle}>
                {room.name}
              </Text>

              {/* Room Video Walkthrough Link */}
              {room.video_url && (
                <View style={{
                  backgroundColor: '#e3f2fd',
                  padding: 8,
                  borderRadius: 4,
                  marginBottom: 12
                }}>
                  <Text style={{ fontSize: 10, color: '#1976d2', marginBottom: 4 }}>
                    📹 Room Walkthrough Video
                  </Text>
                  <Link src={room.video_url} style={{ fontSize: 9, color: '#0d47a1' }}>
                    Click to view {room.video_duration ? `(${Math.floor(room.video_duration / 60)}:${(room.video_duration % 60).toString().padStart(2, '0')})` : ''}
                  </Link>
                </View>
              )}

              {categories.map((category) => {
                const item = room.items?.find(i => i.category_id === category.id)
                if (!item) return null
                
                return (
                  <View key={category.id} style={styles.itemSection}>
                    {/* Category Name and Description */}
                    <Text style={styles.itemName}>{category.name}</Text>
                    <Text style={styles.itemDescription}>{category.description}</Text>
                    
                    {/* Condition Badge */}
                    <Text style={[
                      styles.itemCondition,
                      { backgroundColor: getConditionColor(item.condition) }
                    ]}>
                      {item.condition}
                    </Text>
                    
                    {/* Notes */}
                    {item.notes && (
                      <View style={styles.itemNotes}>
                        <Text>{item.notes}</Text>
                      </View>
                    )}
                    
                    {/* Photo Count and Images */}
                    {item.photos && item.photos.length > 0 && (
                      <View>
                        <Text style={styles.itemPhotosCount}>
                          {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                        </Text>
                        <View style={styles.photoGrid}>
                          {item.photos.map((photo, index) => {
                            // Handle both string URLs and processed photo objects
                            const photoData = typeof photo === 'string' 
                              ? { thumbnailUrl: photo, externalUrl: null }
                              : photo as ProcessedPhoto
                              
                            return (
                              <View key={index} style={styles.photoContainer}>
                                {photoData.externalUrl ? (
                                  <Link src={photoData.externalUrl}>
                                    <Image style={styles.photo} src={photoData.thumbnailUrl} />
                                  </Link>
                                ) : (
                                  <Image style={styles.photo} src={photoData.thumbnailUrl} />
                                )}
                              </View>
                            )
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          )
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            CYAss Solo Condition Report | Role: {creatorRole} | Name: {creatorName} | Created: {new Date(report.created_at).toLocaleString()}
          </Text>
          <Text>
            Property: {property.name} | GPS: {property.gps_coordinates.latitude.toFixed(6)}, {property.gps_coordinates.longitude.toFixed(6)}
            {property.gps_coordinates.accuracy && ` ±${property.gps_coordinates.accuracy}m`}
          </Text>
          <Text style={styles.disclaimer}>
            Disclaimer v1.0: This document reflects the observations of the reporting party only. 
            It has not been reviewed or signed by an opposing party and may not be complete or exhaustive. 
            CYAss provides tooling only and does not certify property condition or statutory compliance.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

/**
 * CRITICAL: Configuration for external URL generation
 * ⚠️ DO NOT MODIFY without explicit user permission
 * 
 * PROTECTED SETTINGS:
 * - useSignedUrls: false (public URLs work with existing RLS)
 * - urlExpirySeconds: 5 years for long-term PDF access
 * 
 * SAFE TO CHANGE: urlExpirySeconds value only
 * NEVER CHANGE: useSignedUrls without testing RLS policies
 */
const PDF_CONFIG = {
  useSignedUrls: false, // Set to true for signed URLs - TEST RLS FIRST!
  urlExpirySeconds: 157680000, // 5 years in seconds - SAFE TO ADJUST
}

/**
 * CRITICAL: Pre-process report to generate external URLs for PDF links
 * ⚠️ DO NOT MODIFY OR REMOVE without explicit user permission
 * 
 * PROTECTED FUNCTIONALITY:
 * - Converts Supabase URLs to external clickable links
 * - Required for PDF thumbnail linking to work
 * - Handles fallbacks for failed URL generation
 * - Processes all photos in all rooms/items
 * 
 * NEVER REMOVE: This preprocessing step is essential for clickable PDFs
 */
async function preprocessReportForPDF(report: Report): Promise<Report> {
  const processedReport: Report = {
    ...report,
    rooms: []
  }

  if (report.rooms) {
    for (const room of report.rooms) {
      const processedRoom = {
        ...room,
        items: []
      }

      if (room.items) {
        for (const item of room.items) {
          const processedItem = {
            ...item,
            photos: []
          }

          if (item.photos && item.photos.length > 0) {
            for (const photoUrl of item.photos) {
              try {
                // Convert image to data URL for PDF embedding (eliminates CORS issues)
                console.log('Converting image to data URL:', photoUrl)
                const dataUrl = await imageUrlToDataUrl(photoUrl)

                // Get external URL for clickable link
                const externalUrl = await storageService.getExternalImageUrl(
                  photoUrl,
                  PDF_CONFIG.useSignedUrls,
                  PDF_CONFIG.urlExpirySeconds
                )

                processedItem.photos.push({
                  thumbnailUrl: dataUrl, // Use data URL for PDF embedding
                  externalUrl: externalUrl, // Use HTTP URL for clickable link
                })
                console.log('Successfully processed photo for PDF')
              } catch (error) {
                console.warn('Failed to process photo for PDF:', photoUrl, error)
                // Fallback: try using original URL (may not work due to CORS)
                processedItem.photos.push({
                  thumbnailUrl: photoUrl,
                  externalUrl: photoUrl,
                })
              }
            }
          }

          processedRoom.items.push(processedItem)
        }
      }

      processedReport.rooms.push(processedRoom)
    }
  }

  return processedReport
}

export const pdfService = {
  async generatePDF(report: Report, property: Property, creatorRole: string, creatorName: string): Promise<Blob> {
    console.log('Starting PDF generation for report:', report.id)
    
    // Pre-process report to generate external URLs
    const processedReport = await preprocessReportForPDF(report)
    console.log('Report preprocessed successfully')
    
    // Generate QR code for the online report
    console.log('About to generate QR code for report ID:', report.id)
    const qrCodeDataURL = await generateQRCode(report.id)
    console.log('QR code generated, length:', qrCodeDataURL.length)
    
    const doc = <PDFReport 
      report={processedReport} 
      property={property} 
      creatorRole={creatorRole}
      creatorName={creatorName}
      qrCodeDataURL={qrCodeDataURL}
    />
    
    console.log('About to generate PDF blob')
    const blob = await pdf(doc).toBlob()
    console.log('PDF blob generated successfully')
    return blob
  },

  async downloadPDF(report: Report, property: Property, creatorRole: string, creatorName: string): Promise<void> {
    console.log('Download PDF called for report:', report.id)
    const blob = await this.generatePDF(report, property, creatorRole, creatorName)
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${property.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${report.id.substring(0, 8)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}