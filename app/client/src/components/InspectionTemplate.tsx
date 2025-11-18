import { DEFAULT_INSPECTION_CATEGORIES } from '../types'
import type { RoomType, InspectionCategory } from '../types'

interface InspectionTemplateProps {
  roomType: RoomType
  roomName: string
}

export default function InspectionTemplate({ roomType, roomName }: InspectionTemplateProps) {
  const categories = DEFAULT_INSPECTION_CATEGORIES[roomType] || []

  const getRoomIcon = (type: RoomType): string => {
    const icons = {
      Standard: '🛏️',
      Kitchen: '🍳', 
      Bathroom: '🛁',
      Patio: '🏡',
      Outbuilding: '🏠',
      Exterior: '🌳'
    }
    return icons[type] || '🏠'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">{getRoomIcon(roomType)}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{roomName}</h3>
          <p className="text-sm text-gray-500">{roomType} Room Template</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            Inspection Categories ({categories.length})
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            These categories will be available for condition assessment in this room
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category: InspectionCategory) => (
            <div key={category.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{category.name}</h5>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="ml-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Template Available</h4>
            <p className="text-gray-600">This room type doesn't have predefined inspection categories yet.</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">💡</span>
            <div>
              <h5 className="font-medium text-blue-900">What happens next?</h5>
              <p className="text-sm text-blue-700 mt-1">
                For each category, you'll rate the condition (Good/Fair/Poor/Urgent Repair/N/A) 
                and add photos and notes as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}