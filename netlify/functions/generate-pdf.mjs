import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fetch from 'node-fetch'

// PDF Components and styles (server-side compatible version)
const { Document, Page, Text, View, StyleSheet, Image, Link } = await import('@react-pdf/renderer')

// Inspection Categories (matching client-side types)
const DEFAULT_INSPECTION_CATEGORIES = {
  Standard: [
    { id: 'walls', name: 'Walls', description: 'Wall condition, paint, cracks' },
    { id: 'windows', name: 'Windows', description: 'Window frames, glass, locks' },
    { id: 'floors', name: 'Carpets/Floors', description: 'Floor covering condition' },
    { id: 'doors', name: 'Doors', description: 'Door condition, handles, locks' },
    { id: 'ceiling', name: 'Ceiling', description: 'Ceiling condition, paint, cracks' },
    { id: 'lighting', name: 'Light Fittings', description: 'Light switches and fittings' },
    { id: 'power', name: 'Power Points', description: 'Electrical outlets condition' }
  ],
  Bathroom: [
    { id: 'walls', name: 'Walls', description: 'Wall tiles, paint, waterproofing' },
    { id: 'floors', name: 'Floors', description: 'Floor tiles, waterproofing' },
    { id: 'basin', name: 'Basin', description: 'Hand basin condition' },
    { id: 'toilet', name: 'Toilet', description: 'Toilet condition and function' },
    { id: 'shower', name: 'Shower/Bath', description: 'Shower or bath condition' },
    { id: 'taps', name: 'Taps/Plumbing', description: 'Water pressure, leaks' },
    { id: 'ventilation', name: 'Ventilation', description: 'Exhaust fan, windows' },
    { id: 'lighting', name: 'Light Fittings', description: 'Bathroom lighting' }
  ],
  Kitchen: [
    { id: 'walls', name: 'Walls', description: 'Wall tiles, backsplash, paint' },
    { id: 'windows', name: 'Windows', description: 'Window frames, glass, locks' },
    { id: 'floors', name: 'Floors', description: 'Floor covering condition' },
    { id: 'cabinets', name: 'Cabinets', description: 'Kitchen cabinets condition' },
    { id: 'counters', name: 'Countertops', description: 'Counter surface condition' },
    { id: 'sink', name: 'Sink', description: 'Kitchen sink condition' },
    { id: 'appliances', name: 'Appliances', description: 'Built-in appliances' },
    { id: 'plumbing', name: 'Plumbing', description: 'Water pressure, leaks' },
    { id: 'lighting', name: 'Light Fittings', description: 'Kitchen lighting' },
    { id: 'power', name: 'Electrical Points', description: 'Power outlets, switches condition' }
  ],
  Patio: [
    { id: 'surface', name: 'Surface', description: 'Patio surface condition' },
    { id: 'railings', name: 'Railings', description: 'Safety railings condition' },
    { id: 'roofing', name: 'Roofing/Cover', description: 'Overhead covering' },
    { id: 'drainage', name: 'Drainage', description: 'Water drainage systems' },
    { id: 'lighting', name: 'Lighting', description: 'Outdoor lighting fixtures' }
  ],
  Garage: [
    { id: 'door', name: 'Garage Door', description: 'Door mechanism and condition' },
    { id: 'walls', name: 'Walls', description: 'Wall condition' },
    { id: 'floors', name: 'Floor', description: 'Floor surface condition' },
    { id: 'lighting', name: 'Lighting', description: 'Garage lighting' },
    { id: 'power', name: 'Power Points', description: 'Electrical outlets' }
  ],
  Garden: [
    { id: 'lawn', name: 'Lawn', description: 'Grass and lawn condition' },
    { id: 'plants', name: 'Plants/Trees', description: 'Garden plants condition' },
    { id: 'fencing', name: 'Fencing', description: 'Fence and gate condition' },
    { id: 'irrigation', name: 'Irrigation', description: 'Watering systems' },
    { id: 'pathways', name: 'Pathways', description: 'Garden paths condition' }
  ]
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

const getConditionColor = (condition) => {
  const colors = {
    'Good': '#277020',
    'Fair': '#f5a409',
    'Poor': '#c62121',
    'Urgent Repair': '#c62121',
    'N/A': '#777777'
  }
  return colors[condition] || '#777777'
}

/**
 * Fetch image and convert to base64 data URL (server-side, no CORS issues)
 */
async function imageUrlToDataUrl(imageUrl) {
  try {
    console.log('Fetching image:', imageUrl)
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64}`

    console.log('Image converted to data URL successfully')
    return dataUrl
  } catch (error) {
    console.error('Failed to convert image to data URL:', error)
    throw error
  }
}

/**
 * Generate QR code data URL (simplified server-side version)
 */
function generateQRCodeDataURL(reportId) {
  // For now, return empty string - QR code generation requires canvas
  // This can be enhanced later with a server-side QR library if needed
  return ''
}

/**
 * PDF Document Component
 */
function PDFReport({ report, property, creatorRole, creatorName, qrCodeDataURL }) {
  const totalItems = report.rooms?.reduce((total, room) => total + (room.items?.length || 0), 0) || 0
  const totalPhotos = report.rooms?.reduce((total, room) =>
    total + (room.items?.reduce((itemTotal, item) => itemTotal + (item.photos?.length || 0), 0) || 0), 0) || 0

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      // Watermark
      React.createElement(Text, { style: styles.watermark },
        `CYAss SOLO REPORT - Created by ${creatorRole.toUpperCase()} - Not jointly signed`
      ),

      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, { style: styles.headerContent },
          React.createElement(Text, { style: styles.title }, 'CYAss Property Condition Report'),
          React.createElement(Text, { style: styles.subtitle }, property.name),
          React.createElement(Text, { style: styles.propertyInfo },
            `${property.address.street_number} ${property.address.street_name}, ${property.address.suburb}`
          ),
          React.createElement(Text, { style: styles.propertyInfo },
            `${property.address.city}, ${property.address.province} ${property.address.postal_code}`
          ),
          React.createElement(Text, { style: styles.propertyInfo },
            `GPS: ${property.gps_coordinates.latitude.toFixed(6)}, ${property.gps_coordinates.longitude.toFixed(6)}` +
            (property.gps_coordinates.accuracy ? ` (±${property.gps_coordinates.accuracy}m)` : '')
          )
        ),

        // QR Code Section (if available)
        qrCodeDataURL && React.createElement(View, { style: styles.qrCodeSection },
          React.createElement(Image, { style: styles.qrCode, src: qrCodeDataURL }),
          React.createElement(Text, { style: styles.qrCodeText }, 'Scan for Online Report'),
          React.createElement(Link, { src: `https://app.cyass.co.za/public/reports/${report.id}` },
            React.createElement(Text, { style: styles.qrCodeUrl },
              `app.cyass.co.za/public/reports/${report.id.substring(0, 8)}`
            )
          )
        )
      ),

      // Summary Stats
      React.createElement(View, { style: styles.summaryStats },
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statNumber }, String(report.rooms?.length || 0)),
          React.createElement(Text, { style: styles.statLabel }, 'ROOMS')
        ),
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statNumber }, String(totalItems)),
          React.createElement(Text, { style: styles.statLabel }, 'ITEMS')
        ),
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statNumber }, String(totalPhotos)),
          React.createElement(Text, { style: styles.statLabel }, 'PHOTOS')
        ),
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statNumber }, new Date(report.created_at).toLocaleDateString()),
          React.createElement(Text, { style: styles.statLabel }, 'CREATED')
        )
      ),

      // Rooms
      ...(report.rooms || []).map((room) =>
        React.createElement(View, { key: room.id, style: styles.roomSection },
          React.createElement(Text, { style: styles.roomTitle }, room.name),

          // Room Video
          room.video_url && React.createElement(View, {
            style: {
              backgroundColor: '#e3f2fd',
              padding: 8,
              borderRadius: 4,
              marginBottom: 12
            }
          },
            React.createElement(Text, { style: { fontSize: 10, color: '#1976d2', marginBottom: 4 } },
              '📹 Room Walkthrough Video'
            ),
            React.createElement(Link, { src: room.video_url, style: { fontSize: 9, color: '#0d47a1' } },
              `Click to view${room.video_duration ? ` (${Math.floor(room.video_duration / 60)}:${(room.video_duration % 60).toString().padStart(2, '0')})` : ''}`
            )
          ),

          // Items
          ...(room.items || []).map((item) => {
            // Look up category info
            const categories = DEFAULT_INSPECTION_CATEGORIES[room.type] || []
            const category = categories.find(c => c.id === item.category_id)
            const categoryName = category?.name || 'Item'
            const categoryDescription = category?.description || ''

            return React.createElement(View, { key: item.category_id, style: styles.itemSection },
              React.createElement(Text, { style: styles.itemName }, categoryName),
              categoryDescription && React.createElement(Text, { style: styles.itemDescription }, categoryDescription),

              React.createElement(Text, {
                style: [styles.itemCondition, { backgroundColor: getConditionColor(item.condition) }]
              }, item.condition),

              item.notes && React.createElement(View, { style: styles.itemNotes },
                React.createElement(Text, null, item.notes)
              ),

              item.photos && item.photos.length > 0 && React.createElement(View, null,
                React.createElement(Text, { style: styles.itemPhotosCount },
                  `${item.photos.length} photo${item.photos.length > 1 ? 's' : ''}`
                ),
                React.createElement(View, { style: styles.photoGrid },
                  ...item.photos.map((photo, index) => {
                    const photoData = typeof photo === 'string'
                      ? { thumbnailUrl: photo, externalUrl: null }
                      : photo

                    return React.createElement(View, { key: index, style: styles.photoContainer },
                      photoData.externalUrl
                        ? React.createElement(Link, { src: photoData.externalUrl },
                            React.createElement(Image, { style: styles.photo, src: photoData.thumbnailUrl })
                          )
                        : React.createElement(Image, { style: styles.photo, src: photoData.thumbnailUrl })
                    )
                  })
                )
              )
            )
          })  // Close the items map function
        )
      ),

      // Footer
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, null,
          `CYAss Solo Condition Report | Role: ${creatorRole} | Name: ${creatorName} | Created: ${new Date(report.created_at).toLocaleString()}`
        ),
        React.createElement(Text, null,
          `Property: ${property.name} | GPS: ${property.gps_coordinates.latitude.toFixed(6)}, ${property.gps_coordinates.longitude.toFixed(6)}` +
          (property.gps_coordinates.accuracy ? ` ±${property.gps_coordinates.accuracy}m` : '')
        ),
        React.createElement(Text, { style: styles.disclaimer },
          'Disclaimer v1.0: This document reflects the observations of the reporting party only. ' +
          'It has not been reviewed or signed by an opposing party and may not be complete or exhaustive. ' +
          'CYAss provides tooling only and does not certify property condition or statutory compliance.'
        )
      )
    )
  )
}

/**
 * Preprocess report to fetch and convert images to data URLs
 */
async function preprocessReportForPDF(report) {
  console.log('Preprocessing report for PDF...')
  const processedReport = {
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
                // Fetch image and convert to data URL (no CORS on server!)
                const dataUrl = await imageUrlToDataUrl(photoUrl)

                processedItem.photos.push({
                  thumbnailUrl: dataUrl,
                  externalUrl: photoUrl // Keep original URL for clickable link
                })
                console.log('Successfully processed photo')
              } catch (error) {
                console.warn('Failed to process photo:', photoUrl, error)
                // Skip failed photos
              }
            }
          }

          processedRoom.items.push(processedItem)
        }
      }

      processedReport.rooms.push(processedRoom)
    }
  }

  console.log('Report preprocessing complete')
  return processedReport
}

/**
 * Netlify Function Handler
 */
export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    console.log('PDF generation request received')

    // Parse request body
    const { report, property, creatorRole, creatorName } = JSON.parse(event.body)

    if (!report || !property || !creatorRole || !creatorName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    console.log('Generating PDF for report:', report.id)

    // Preprocess report (fetch and convert images)
    const processedReport = await preprocessReportForPDF(report)

    // Generate QR code (simplified for now)
    const qrCodeDataURL = generateQRCodeDataURL(report.id)

    // Create PDF document
    const doc = React.createElement(PDFReport, {
      report: processedReport,
      property,
      creatorRole,
      creatorName,
      qrCodeDataURL
    })

    // Render to buffer
    console.log('Rendering PDF...')
    const pdfBuffer = await renderToBuffer(doc)
    console.log('PDF rendered successfully')

    // Return PDF
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${property.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${report.id.substring(0, 8)}.pdf"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    }
  } catch (error) {
    console.error('PDF generation error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate PDF',
        message: error.message
      })
    }
  }
}
