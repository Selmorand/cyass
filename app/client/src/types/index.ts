export type {
  UserRole,
  ConditionState,
  RoomType,
  GPSCoordinates,
  BaseEntity
} from './common'

export type {
  PropertyType,
  PropertyAddress,
  Property,
  CreatePropertyInput,
  UpdatePropertyInput
} from './property'

export type {
  InspectionCategory,
  InspectionItem,
  Room,
  Report,
  CreateReportInput,
  UpdateReportInput,
  InspectionItemInput,
  RoomTemplate
} from './report'

export type { Database } from './database'

export { CONDITION_COLORS, SA_PROVINCES, USER_ROLES, CONDITION_STATES } from './common'
export { DEFAULT_INSPECTION_CATEGORIES } from './report'