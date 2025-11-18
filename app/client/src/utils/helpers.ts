import type { ConditionState, Room, Report } from '../types'
import { CONDITION_COLORS } from '../types/common'

export function getConditionColor(condition: ConditionState): string {
  return CONDITION_COLORS[condition]
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function calculateReportStats(report: Report) {
  const allItems = report.rooms.flatMap(room => room.items)
  
  const conditionCounts = {
    Good: 0,
    Fair: 0,
    Poor: 0,
    'Urgent Repair': 0,
    'N/A': 0
  }
  
  allItems.forEach(item => {
    conditionCounts[item.condition]++
  })
  
  const totalItems = allItems.length
  const totalPhotos = allItems.reduce((sum, item) => sum + item.photos.length, 0)
  
  const issueItems = allItems.filter(item => 
    item.condition === 'Fair' || 
    item.condition === 'Poor' || 
    item.condition === 'Urgent Repair'
  )
  
  return {
    totalRooms: report.rooms.length,
    totalItems,
    totalPhotos,
    conditionCounts,
    issueCount: issueItems.length,
    completionPercentage: totalItems > 0 ? Math.round((totalItems / totalItems) * 100) : 0
  }
}

export function sortRoomsByType(rooms: Room[]): Room[] {
  const typeOrder = ['Standard', 'Bathroom', 'Kitchen', 'Patio', 'Outbuilding', 'Exterior']
  
  return [...rooms].sort((a, b) => {
    const aIndex = typeOrder.indexOf(a.type)
    const bIndex = typeOrder.indexOf(b.type)
    
    if (aIndex !== bIndex) {
      return aIndex - bIndex
    }
    
    return a.name.localeCompare(b.name)
  })
}

export function isReportComplete(report: Report): boolean {
  if (report.rooms.length === 0) return false
  
  return report.rooms.every(room => 
    room.items.length > 0 &&
    room.items.every(item => {
      const needsComment = item.condition !== 'Good' && item.condition !== 'N/A'
      return !needsComment || (item.notes && item.notes.trim().length > 0)
    })
  )
}

export function getReportIssues(report: Report): string[] {
  const issues: string[] = []
  
  if (report.rooms.length === 0) {
    issues.push('No rooms added to report')
    return issues
  }
  
  report.rooms.forEach(room => {
    if (!room.name.trim()) {
      issues.push(`Room missing name`)
    }
    
    if (room.items.length === 0) {
      issues.push(`${room.name || 'Unnamed room'}: No inspection items`)
    }
    
    room.items.forEach((item, index) => {
      const needsComment = item.condition !== 'Good' && item.condition !== 'N/A'
      
      if (needsComment && (!item.notes || !item.notes.trim())) {
        issues.push(`${room.name} - Item ${index + 1}: Comment required for ${item.condition} condition`)
      }
      
      if (item.photos.length === 0 && item.condition !== 'N/A') {
        issues.push(`${room.name} - Item ${index + 1}: Photo required`)
      }
    })
  })
  
  return issues
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => func(...args), waitFor)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout
  let lastRan: number
  
  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      textArea.remove()
      resolve()
    } catch (error) {
      textArea.remove()
      reject(error)
    }
  })
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}