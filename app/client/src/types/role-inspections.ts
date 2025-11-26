import type { UserRole } from './common'

/**
 * Role-Based Inspection System
 * Generated from CYAss_Inspection_Master_Table.xlsx
 *
 * This file defines inspection templates for each user role (Tenant, Landlord, Buyer, Seller, Agent, Contractor).
 * Agents can select any role template to use.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type InputType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'number' | 'photo-multi' | 'video'
export type ImportanceLevel = 'Yes' | 'Optional' | 'No'

/**
 * Individual input field definition for an inspection category
 */
export interface InspectionInput {
  id: string
  label: string
  type: InputType
  options?: string[]
  required: boolean
  validation?: string
  description?: string
  placeholder?: string
  maxLength?: number
  min?: number
  max?: number
}

/**
 * Inspection category with all its input fields
 */
export interface InspectionCategoryTemplate {
  category: string
  importance: ImportanceLevel
  description: string
  inputs: InspectionInput[]
}

/**
 * Complete inspection template for a specific role
 */
export interface RoleInspectionTemplate {
  role: UserRole
  inspectionSequence: InspectionCategoryTemplate[]
}

// =============================================================================
// CONDITION STATE (STANDARD ACROSS ALL CATEGORIES)
// =============================================================================

const CONDITION_OPTIONS = ['Good', 'Fair', 'Poor', 'Urgent Repair', 'N/A']
const CONDITION_VALIDATION = 'If not Good or N/A, comments are mandatory'

// =============================================================================
// INPUT DEFINITIONS BY CATEGORY
// =============================================================================

/**
 * Standard Rooms - Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting
 */
const STANDARD_ROOMS_INPUTS: InspectionInput[] = [
  { id: 'walls_condition', label: 'Walls - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'walls_photos', label: 'Walls - Photos', type: 'photo-multi', required: true },
  { id: 'walls_notes', label: 'Walls - Notes', type: 'textarea', required: false, placeholder: 'Describe any issues...' },
  { id: 'floors_condition', label: 'Floors/Carpets - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'floors_photos', label: 'Floors - Photos', type: 'photo-multi', required: true },
  { id: 'floors_notes', label: 'Floors - Notes', type: 'textarea', required: false },
  { id: 'ceiling_condition', label: 'Ceiling - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'ceiling_photos', label: 'Ceiling - Photos', type: 'photo-multi', required: true },
  { id: 'ceiling_notes', label: 'Ceiling - Notes', type: 'textarea', required: false },
  { id: 'windows_condition', label: 'Windows - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'windows_photos', label: 'Windows - Photos', type: 'photo-multi', required: true },
  { id: 'windows_notes', label: 'Windows - Notes', type: 'textarea', required: false },
  { id: 'doors_condition', label: 'Doors - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'doors_photos', label: 'Doors - Photos', type: 'photo-multi', required: true },
  { id: 'doors_notes', label: 'Doors - Notes', type: 'textarea', required: false },
  { id: 'cupboards_condition', label: 'Cupboards - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false, validation: CONDITION_VALIDATION },
  { id: 'cupboards_photos', label: 'Cupboards - Photos', type: 'photo-multi', required: false },
  { id: 'sockets_condition', label: 'Power Sockets - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'sockets_photos', label: 'Sockets - Photos', type: 'photo-multi', required: false },
  { id: 'lighting_condition', label: 'Light Fittings - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'lighting_photos', label: 'Lighting - Photos', type: 'photo-multi', required: false }
]

/**
 * Bathroom Systems - Basins, taps, toilets, showers/baths, leaks, damp, ventilation
 */
const BATHROOM_SYSTEMS_INPUTS: InspectionInput[] = [
  { id: 'basin_condition', label: 'Basin - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'basin_photos', label: 'Basin - Photos', type: 'photo-multi', required: true },
  { id: 'toilet_condition', label: 'Toilet - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'toilet_photos', label: 'Toilet - Photos', type: 'photo-multi', required: true },
  { id: 'shower_bath_condition', label: 'Shower/Bath - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'shower_bath_photos', label: 'Shower/Bath - Photos', type: 'photo-multi', required: true },
  { id: 'taps_condition', label: 'Taps/Plumbing - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'taps_photos', label: 'Taps - Photos', type: 'photo-multi', required: false },
  { id: 'leaks_present', label: 'Leaks Present?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'leaks_photos', label: 'Leak Evidence - Photos', type: 'photo-multi', required: false },
  { id: 'damp_present', label: 'Damp/Moisture Present?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'damp_photos', label: 'Damp Evidence - Photos', type: 'photo-multi', required: false },
  { id: 'ventilation_condition', label: 'Ventilation - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'bathroom_notes', label: 'Additional Notes', type: 'textarea', required: false }
]

/**
 * Kitchen Systems - Cabinets, counters, appliances, plumbing, extractor, sink
 */
const KITCHEN_SYSTEMS_INPUTS: InspectionInput[] = [
  { id: 'cabinets_condition', label: 'Cabinets - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'cabinets_photos', label: 'Cabinets - Photos', type: 'photo-multi', required: true },
  { id: 'countertops_condition', label: 'Countertops - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'countertops_photos', label: 'Countertops - Photos', type: 'photo-multi', required: true },
  { id: 'sink_condition', label: 'Sink - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'sink_photos', label: 'Sink - Photos', type: 'photo-multi', required: true },
  { id: 'appliances_present', label: 'Built-in Appliances Present?', type: 'checkbox', required: false },
  { id: 'appliances_condition', label: 'Appliances - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false, validation: CONDITION_VALIDATION },
  { id: 'appliances_photos', label: 'Appliances - Photos', type: 'photo-multi', required: false },
  { id: 'plumbing_condition', label: 'Plumbing - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'plumbing_leaks', label: 'Leaks Present?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'extractor_condition', label: 'Extractor Fan - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'kitchen_notes', label: 'Additional Notes', type: 'textarea', required: false }
]

/**
 * Exterior - Roof, gutters, paving, garden, fencing, security features
 */
const EXTERIOR_INPUTS: InspectionInput[] = [
  { id: 'roof_condition', label: 'Roof - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'roof_photos', label: 'Roof - Photos', type: 'photo-multi', required: true },
  { id: 'gutters_condition', label: 'Gutters - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: true, validation: CONDITION_VALIDATION },
  { id: 'gutters_photos', label: 'Gutters - Photos', type: 'photo-multi', required: false },
  { id: 'paving_condition', label: 'Paving/Driveway - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'paving_photos', label: 'Paving - Photos', type: 'photo-multi', required: false },
  { id: 'garden_condition', label: 'Garden/Lawn - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'garden_photos', label: 'Garden - Photos', type: 'photo-multi', required: false },
  { id: 'fencing_condition', label: 'Fencing - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'fencing_photos', label: 'Fencing - Photos', type: 'photo-multi', required: false },
  { id: 'security_features', label: 'Security Features Present?', type: 'textarea', required: false, placeholder: 'List gates, beams, cameras, etc.' },
  { id: 'security_photos', label: 'Security Features - Photos', type: 'photo-multi', required: false },
  { id: 'exterior_notes', label: 'Additional Notes', type: 'textarea', required: false }
]

/**
 * Special Features - Solar, inverter, generator, aircon, smart devices, water tanks
 */
const SPECIAL_FEATURES_INPUTS: InspectionInput[] = [
  { id: 'solar_present', label: 'Solar Power System Present?', type: 'checkbox', required: false },
  { id: 'solar_condition', label: 'Solar System - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'solar_photos', label: 'Solar System - Photos', type: 'photo-multi', required: false },
  { id: 'inverter_present', label: 'Inverter/UPS Present?', type: 'checkbox', required: false },
  { id: 'inverter_condition', label: 'Inverter - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'generator_present', label: 'Generator Present?', type: 'checkbox', required: false },
  { id: 'generator_condition', label: 'Generator - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'aircon_present', label: 'Air Conditioning Present?', type: 'checkbox', required: false },
  { id: 'aircon_condition', label: 'Air Conditioning - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'water_tanks_present', label: 'Water Tanks/JoJo Tanks Present?', type: 'checkbox', required: false },
  { id: 'water_tanks_condition', label: 'Water Tanks - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'smart_devices', label: 'Smart Home Devices Present?', type: 'textarea', required: false, placeholder: 'List smart devices, automation, etc.' },
  { id: 'special_features_photos', label: 'Special Features - Photos', type: 'photo-multi', required: false },
  { id: 'special_features_notes', label: 'Additional Notes', type: 'textarea', required: false }
]

/**
 * Meter Evidence - Electricity, water, gas meters with readings and photos
 */
const METER_EVIDENCE_INPUTS: InspectionInput[] = [
  { id: 'electricity_meter_reading', label: 'Electricity Meter Reading', type: 'number', required: true, placeholder: 'Enter kWh reading', min: 0 },
  { id: 'electricity_meter_photo', label: 'Electricity Meter - Photo', type: 'photo-multi', required: true, validation: 'Clear photo showing reading' },
  { id: 'water_meter_reading', label: 'Water Meter Reading', type: 'number', required: false, placeholder: 'Enter cubic meters', min: 0 },
  { id: 'water_meter_photo', label: 'Water Meter - Photo', type: 'photo-multi', required: false },
  { id: 'gas_meter_present', label: 'Gas Meter Present?', type: 'checkbox', required: false },
  { id: 'gas_meter_reading', label: 'Gas Meter Reading', type: 'number', required: false, min: 0 },
  { id: 'gas_meter_photo', label: 'Gas Meter - Photo', type: 'photo-multi', required: false },
  { id: 'meter_notes', label: 'Meter Notes', type: 'textarea', required: false, placeholder: 'Any anomalies, meter location, etc.' }
]

/**
 * Keys & Access - Keys, remotes, tags, gate codes (masked)
 */
const KEYS_ACCESS_INPUTS: InspectionInput[] = [
  { id: 'key_count', label: 'Number of Keys', type: 'number', required: true, min: 0, placeholder: 'Total keys provided' },
  { id: 'key_types', label: 'Key Types', type: 'textarea', required: false, placeholder: 'Front door (2), garage (1), gate (1), etc.' },
  { id: 'remote_count', label: 'Number of Remotes', type: 'number', required: false, min: 0 },
  { id: 'remote_types', label: 'Remote Types', type: 'textarea', required: false, placeholder: 'Garage remote, gate remote, alarm remote, etc.' },
  { id: 'access_tags_cards', label: 'Access Tags/Cards', type: 'text', required: false, placeholder: 'Security tags, access cards, etc.' },
  { id: 'gate_codes', label: 'Gate Codes (Last 2 Digits Masked)', type: 'text', required: false, placeholder: 'e.g., 12**' },
  { id: 'alarm_code', label: 'Alarm Code (Masked)', type: 'text', required: false, placeholder: 'Partial code only' },
  { id: 'keys_photos', label: 'Keys & Remotes - Photos', type: 'photo-multi', required: true, validation: 'Photo of all keys and remotes together' },
  { id: 'keys_notes', label: 'Additional Notes', type: 'textarea', required: false }
]

/**
 * Compliance Documents - Legal certificates and compliance documentation
 */
const COMPLIANCE_DOCUMENTS_INPUTS: InspectionInput[] = [
  { id: 'compliance_doc_types', label: 'Compliance Documents Present', type: 'textarea', required: false, placeholder: 'List all compliance docs (COC, certificates, etc.)' },
  { id: 'docs_photos', label: 'Documents - Photos', type: 'photo-multi', required: false, validation: 'Clear photos of all compliance documents' },
  { id: 'compliance_notes', label: 'Compliance Notes', type: 'textarea', required: false }
]

/**
 * Structural Indicators - Foundation cracks, roof sagging, structural movement
 */
const STRUCTURAL_INDICATORS_INPUTS: InspectionInput[] = [
  { id: 'foundation_cracks', label: 'Foundation Cracks Present?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'foundation_photos', label: 'Foundation - Photos', type: 'photo-multi', required: false },
  { id: 'roof_sagging', label: 'Roof Sagging/Movement?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'roof_structure_photos', label: 'Roof Structure - Photos', type: 'photo-multi', required: false },
  { id: 'wall_cracks', label: 'Structural Wall Cracks?', type: 'dropdown', options: ['No', 'Hairline', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'wall_cracks_photos', label: 'Wall Cracks - Photos', type: 'photo-multi', required: false },
  { id: 'settlement_signs', label: 'Settlement/Movement Signs?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: false },
  { id: 'structural_notes', label: 'Structural Notes', type: 'textarea', required: false, placeholder: 'Describe any structural concerns' }
]

/**
 * Damp / Moisture - Damp marks, moisture staining, mould, bathroom leaks
 */
const DAMP_MOISTURE_INPUTS: InspectionInput[] = [
  { id: 'damp_location', label: 'Damp/Moisture Locations', type: 'textarea', required: false, placeholder: 'List all locations with damp/moisture' },
  { id: 'damp_severity', label: 'Overall Damp Severity', type: 'dropdown', options: ['None', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'mould_present', label: 'Mould Present?', type: 'dropdown', options: ['No', 'Minor', 'Moderate', 'Severe'], required: true },
  { id: 'mould_locations', label: 'Mould Locations', type: 'textarea', required: false },
  { id: 'damp_moisture_photos', label: 'Damp/Moisture - Photos', type: 'photo-multi', required: false, validation: 'Clear photos of all affected areas' },
  { id: 'damp_notes', label: 'Damp/Moisture Notes', type: 'textarea', required: false }
]

/**
 * Appliance Serial Numbers - Record serial numbers of appliances for tracking
 */
const APPLIANCE_SERIAL_NUMBERS_INPUTS: InspectionInput[] = [
  { id: 'appliance_list', label: 'Appliances Present', type: 'textarea', required: false, placeholder: 'List all appliances (stove, oven, dishwasher, etc.)' },
  { id: 'stove_serial', label: 'Stove Serial Number', type: 'text', required: false },
  { id: 'oven_serial', label: 'Oven Serial Number', type: 'text', required: false },
  { id: 'dishwasher_serial', label: 'Dishwasher Serial Number', type: 'text', required: false },
  { id: 'washing_machine_serial', label: 'Washing Machine Serial', type: 'text', required: false },
  { id: 'dryer_serial', label: 'Dryer Serial Number', type: 'text', required: false },
  { id: 'fridge_serial', label: 'Fridge Serial Number', type: 'text', required: false },
  { id: 'other_appliance_serials', label: 'Other Appliances', type: 'textarea', required: false, placeholder: 'List other appliances and serial numbers' },
  { id: 'appliance_serial_photos', label: 'Serial Number Plates - Photos', type: 'photo-multi', required: false, validation: 'Clear photos of serial number plates' }
]

/**
 * Safety Systems - Security gates, burglar bars, fire extinguishers, pool fencing
 */
const SAFETY_SYSTEMS_INPUTS: InspectionInput[] = [
  { id: 'security_gates_present', label: 'Security Gates Present?', type: 'checkbox', required: false },
  { id: 'security_gates_condition', label: 'Security Gates - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'burglar_bars_present', label: 'Burglar Bars Present?', type: 'checkbox', required: false },
  { id: 'burglar_bars_condition', label: 'Burglar Bars - Condition', type: 'dropdown', options: CONDITION_OPTIONS, required: false },
  { id: 'fire_extinguishers', label: 'Fire Extinguishers Present?', type: 'checkbox', required: false },
  { id: 'fire_extinguisher_count', label: 'Number of Fire Extinguishers', type: 'number', required: false, min: 0 },
  { id: 'smoke_detectors', label: 'Smoke Detectors Present?', type: 'checkbox', required: false },
  { id: 'pool_fencing', label: 'Pool Safety Fencing Present?', type: 'checkbox', required: false },
  { id: 'pool_fencing_compliant', label: 'Pool Fencing Compliant?', type: 'dropdown', options: ['N/A', 'Yes', 'No', 'Unknown'], required: false },
  { id: 'safety_photos', label: 'Safety Systems - Photos', type: 'photo-multi', required: false },
  { id: 'safety_notes', label: 'Safety Notes', type: 'textarea', required: false }
]

/**
 * Marketing Photos - Photos for listings, staging, highlight features
 */
const MARKETING_PHOTOS_INPUTS: InspectionInput[] = [
  { id: 'marketing_photo_type', label: 'Marketing Photo Purpose', type: 'dropdown', options: ['Property Listing', 'Staging Photos', 'Feature Highlights', 'Virtual Tour', 'Social Media'], required: false },
  { id: 'marketing_photos', label: 'Marketing Photos', type: 'photo-multi', required: true, validation: 'High-quality photos for marketing purposes' },
  { id: 'photo_locations', label: 'Photo Locations/Descriptions', type: 'textarea', required: false, placeholder: 'Describe what each photo shows' },
  { id: 'marketing_notes', label: 'Marketing Notes', type: 'textarea', required: false }
]

/**
 * Repair Recommendations - Maintenance issues, required repairs, cost notes
 */
const REPAIR_RECOMMENDATIONS_INPUTS: InspectionInput[] = [
  { id: 'repair_list', label: 'Repairs Required', type: 'textarea', required: false, placeholder: 'List all recommended repairs' },
  { id: 'repair_priority', label: 'Repair Priority', type: 'dropdown', options: ['Low', 'Medium', 'High', 'Urgent'], required: false },
  { id: 'estimated_cost', label: 'Estimated Repair Cost (ZAR)', type: 'number', required: false, min: 0, placeholder: 'Approximate cost in Rands' },
  { id: 'repair_photos', label: 'Repair Area - Photos', type: 'photo-multi', required: false },
  { id: 'repair_notes', label: 'Repair Notes', type: 'textarea', required: false, placeholder: 'Additional details, contractor recommendations, etc.' }
]

/**
 * Before/After Repairs - Mandatory before/after photos for contractors
 */
const BEFORE_AFTER_REPAIRS_INPUTS: InspectionInput[] = [
  { id: 'repair_type', label: 'Type of Repair', type: 'text', required: true, placeholder: 'e.g., Plumbing leak repair, wall crack fix' },
  { id: 'repair_location', label: 'Repair Location', type: 'text', required: true, placeholder: 'Specific room/area' },
  { id: 'before_photos', label: 'BEFORE Repair - Photos', type: 'photo-multi', required: true, validation: 'Clear photos before work begins' },
  { id: 'after_photos', label: 'AFTER Repair - Photos', type: 'photo-multi', required: true, validation: 'Clear photos of completed work' },
  { id: 'repair_date', label: 'Repair Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'repair_cost', label: 'Actual Repair Cost (ZAR)', type: 'number', required: false, min: 0 },
  { id: 'before_after_notes', label: 'Repair Notes', type: 'textarea', required: false, placeholder: 'Work performed, materials used, etc.' }
]

/**
 * Electrical COC - Electrical Certificate of Compliance required for sale/insurance
 */
const ELECTRICAL_COC_INPUTS: InspectionInput[] = [
  { id: 'electrical_coc_present', label: 'Electrical COC Present?', type: 'dropdown', options: ['Yes', 'No', 'Expired', 'Unknown'], required: true },
  { id: 'electrical_coc_number', label: 'COC Certificate Number', type: 'text', required: false },
  { id: 'electrical_coc_issue_date', label: 'COC Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'electrical_coc_issuer', label: 'COC Issuer Name', type: 'text', required: false, placeholder: 'Electrician/Company name' },
  { id: 'electrical_coc_contact', label: 'Issuer Contact', type: 'text', required: false, placeholder: 'Phone or email' },
  { id: 'electrical_coc_photos', label: 'Electrical COC - Photos', type: 'photo-multi', required: false, validation: 'Clear photo of complete certificate' },
  { id: 'electrical_coc_notes', label: 'COC Notes', type: 'textarea', required: false }
]

/**
 * Gas COC - Gas installation compliance (regulators, piping, safety)
 */
const GAS_COC_INPUTS: InspectionInput[] = [
  { id: 'gas_coc_present', label: 'Gas COC Present?', type: 'dropdown', options: ['Yes', 'No', 'N/A - No Gas', 'Expired', 'Unknown'], required: true },
  { id: 'gas_coc_number', label: 'Gas COC Number', type: 'text', required: false },
  { id: 'gas_coc_issue_date', label: 'COC Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'gas_coc_issuer', label: 'COC Issuer Name', type: 'text', required: false },
  { id: 'gas_coc_contact', label: 'Issuer Contact', type: 'text', required: false },
  { id: 'gas_coc_photos', label: 'Gas COC - Photos', type: 'photo-multi', required: false },
  { id: 'gas_coc_notes', label: 'Gas COC Notes', type: 'textarea', required: false }
]

/**
 * Plumbing COC - Cape Town mandatory certificate for plumbing installation safety
 */
const PLUMBING_COC_INPUTS: InspectionInput[] = [
  { id: 'plumbing_coc_present', label: 'Plumbing COC Present?', type: 'dropdown', options: ['Yes', 'No', 'N/A - Not Cape Town', 'Expired', 'Unknown'], required: true },
  { id: 'plumbing_coc_number', label: 'Plumbing COC Number', type: 'text', required: false },
  { id: 'plumbing_coc_issue_date', label: 'COC Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'plumbing_coc_issuer', label: 'COC Issuer Name', type: 'text', required: false },
  { id: 'plumbing_coc_contact', label: 'Issuer Contact', type: 'text', required: false },
  { id: 'plumbing_coc_photos', label: 'Plumbing COC - Photos', type: 'photo-multi', required: false },
  { id: 'plumbing_coc_notes', label: 'Plumbing COC Notes', type: 'textarea', required: false, placeholder: 'Mandatory in Cape Town municipal area' }
]

/**
 * Beetle Certificate - Common in coastal provinces for wood borer inspections
 */
const BEETLE_CERTIFICATE_INPUTS: InspectionInput[] = [
  { id: 'beetle_cert_present', label: 'Beetle Certificate Present?', type: 'dropdown', options: ['Yes', 'No', 'Not Required', 'Expired', 'Unknown'], required: true },
  { id: 'beetle_cert_number', label: 'Certificate Number', type: 'text', required: false },
  { id: 'beetle_cert_issue_date', label: 'Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'beetle_cert_issuer', label: 'Issuer Company', type: 'text', required: false, placeholder: 'Pest control company name' },
  { id: 'beetle_treatment_done', label: 'Treatment Performed?', type: 'dropdown', options: ['N/A', 'Yes', 'No', 'Preventative Only'], required: false },
  { id: 'beetle_cert_photos', label: 'Beetle Certificate - Photos', type: 'photo-multi', required: false },
  { id: 'beetle_cert_notes', label: 'Beetle Certificate Notes', type: 'textarea', required: false, placeholder: 'Common in KZN, Western Cape, Eastern Cape coastal areas' }
]

/**
 * Water Installation Certificate - Certifies plumbing and water flow compliance
 */
const WATER_INSTALLATION_CERT_INPUTS: InspectionInput[] = [
  { id: 'water_cert_present', label: 'Water Installation Certificate Present?', type: 'dropdown', options: ['Yes', 'No', 'Not Required', 'Expired'], required: true },
  { id: 'water_cert_number', label: 'Certificate Number', type: 'text', required: false },
  { id: 'water_cert_issue_date', label: 'Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'water_cert_issuer', label: 'Issuer Name', type: 'text', required: false },
  { id: 'water_cert_photos', label: 'Water Certificate - Photos', type: 'photo-multi', required: false },
  { id: 'water_cert_notes', label: 'Water Certificate Notes', type: 'textarea', required: false }
]

/**
 * Electric Fence Certificate - Required for homes with electric fencing (security act)
 */
const ELECTRIC_FENCE_CERT_INPUTS: InspectionInput[] = [
  { id: 'efence_cert_present', label: 'Electric Fence Certificate Present?', type: 'dropdown', options: ['Yes', 'No', 'N/A - No Electric Fence', 'Expired'], required: true },
  { id: 'efence_cert_number', label: 'Certificate Number', type: 'text', required: false },
  { id: 'efence_cert_issue_date', label: 'Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'efence_cert_issuer', label: 'Issuer Name', type: 'text', required: false, placeholder: 'Security company/installer' },
  { id: 'efence_cert_photos', label: 'Electric Fence Certificate - Photos', type: 'photo-multi', required: false },
  { id: 'efence_notes', label: 'Electric Fence Notes', type: 'textarea', required: false, placeholder: 'Required by SANS 10222-3 for compliance' }
]

/**
 * Building Plans - Approved building plans for structural verification
 */
const BUILDING_PLANS_INPUTS: InspectionInput[] = [
  { id: 'building_plans_present', label: 'Approved Building Plans Present?', type: 'dropdown', options: ['Yes', 'No', 'Partial', 'Unknown'], required: true },
  { id: 'building_plans_approved', label: 'Plans Municipality Approved?', type: 'dropdown', options: ['Yes', 'No', 'Unknown'], required: false },
  { id: 'building_plans_date', label: 'Plan Approval Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'building_plans_reference', label: 'Municipality Reference Number', type: 'text', required: false },
  { id: 'building_plans_photos', label: 'Building Plans - Photos', type: 'photo-multi', required: false, validation: 'Photos of all plan pages' },
  { id: 'building_plans_notes', label: 'Building Plans Notes', type: 'textarea', required: false, placeholder: 'Any unapproved alterations or additions' }
]

/**
 * Occupation Certificate - Proof property is legally fit for occupation
 */
const OCCUPATION_CERT_INPUTS: InspectionInput[] = [
  { id: 'occupation_cert_present', label: 'Occupation Certificate Present?', type: 'dropdown', options: ['Yes', 'No', 'Not Required', 'Unknown'], required: true },
  { id: 'occupation_cert_number', label: 'Certificate Number', type: 'text', required: false },
  { id: 'occupation_cert_issue_date', label: 'Issue Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
  { id: 'occupation_cert_photos', label: 'Occupation Certificate - Photos', type: 'photo-multi', required: false },
  { id: 'occupation_cert_notes', label: 'Occupation Certificate Notes', type: 'textarea', required: false, placeholder: 'Required for new builds or major renovations' }
]

/**
 * Warranty Documents - Appliance, installation, and repair warranties
 */
const WARRANTY_DOCUMENTS_INPUTS: InspectionInput[] = [
  { id: 'warranties_present', label: 'Warranty Documents Present?', type: 'dropdown', options: ['Yes', 'Some', 'No', 'Unknown'], required: false },
  { id: 'warranty_list', label: 'List of Warranties', type: 'textarea', required: false, placeholder: 'List all warranties (appliances, installations, repairs)' },
  { id: 'warranty_expiry_dates', label: 'Warranty Expiry Dates', type: 'textarea', required: false, placeholder: 'Note expiry dates for each warranty' },
  { id: 'warranty_photos', label: 'Warranty Documents - Photos', type: 'photo-multi', required: false },
  { id: 'warranty_notes', label: 'Warranty Notes', type: 'textarea', required: false }
]

// =============================================================================
// ROLE-BASED INSPECTION TEMPLATES
// =============================================================================

/**
 * TENANT INSPECTION TEMPLATE
 * Focus: Property condition documentation, move-in/move-out evidence
 */
export const TENANT_INSPECTION_TEMPLATE: RoleInspectionTemplate = {
  role: 'tenant',
  inspectionSequence: [
    { category: 'Standard Rooms', importance: 'Yes', description: 'Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting.', inputs: STANDARD_ROOMS_INPUTS },
    { category: 'Bathroom Systems', importance: 'Yes', description: 'Basins, taps, toilets, showers/baths, leaks, damp, ventilation.', inputs: BATHROOM_SYSTEMS_INPUTS },
    { category: 'Kitchen Systems', importance: 'Yes', description: 'Cabinets, counters, appliances, plumbing, extractor, sink.', inputs: KITCHEN_SYSTEMS_INPUTS },
    { category: 'Exterior', importance: 'Yes', description: 'Roof, gutters, paving, garden, fencing, security features.', inputs: EXTERIOR_INPUTS },
    { category: 'Special Features', importance: 'Optional', description: 'Solar, inverter, generator, aircon, smart devices, water tanks.', inputs: SPECIAL_FEATURES_INPUTS },
    { category: 'Meter Evidence', importance: 'Yes', description: 'Electricity, water, gas meters with readings and photos.', inputs: METER_EVIDENCE_INPUTS },
    { category: 'Keys & Access', importance: 'Yes', description: 'Keys, remotes, tags, gate codes (masked).', inputs: KEYS_ACCESS_INPUTS },
    { category: 'Damp / Moisture', importance: 'Yes', description: 'Damp marks, moisture staining, mould, bathroom leaks.', inputs: DAMP_MOISTURE_INPUTS },
    { category: 'Appliance Serial Numbers', importance: 'Optional', description: 'Record serial numbers of appliances for tracking.', inputs: APPLIANCE_SERIAL_NUMBERS_INPUTS },
    { category: 'Safety Systems', importance: 'Optional', description: 'Security gates, burglar bars, fire extinguishers, pool fencing.', inputs: SAFETY_SYSTEMS_INPUTS }
  ]
}

/**
 * LANDLORD INSPECTION TEMPLATE
 * Focus: Maintenance tracking, property condition monitoring
 */
export const LANDLORD_INSPECTION_TEMPLATE: RoleInspectionTemplate = {
  role: 'landlord',
  inspectionSequence: [
    { category: 'Standard Rooms', importance: 'Yes', description: 'Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting.', inputs: STANDARD_ROOMS_INPUTS },
    { category: 'Bathroom Systems', importance: 'Yes', description: 'Basins, taps, toilets, showers/baths, leaks, damp, ventilation.', inputs: BATHROOM_SYSTEMS_INPUTS },
    { category: 'Kitchen Systems', importance: 'Yes', description: 'Cabinets, counters, appliances, plumbing, extractor, sink.', inputs: KITCHEN_SYSTEMS_INPUTS },
    { category: 'Exterior', importance: 'Yes', description: 'Roof, gutters, paving, garden, fencing, security features.', inputs: EXTERIOR_INPUTS },
    { category: 'Special Features', importance: 'Yes', description: 'Solar, inverter, generator, aircon, smart devices, water tanks.', inputs: SPECIAL_FEATURES_INPUTS },
    { category: 'Meter Evidence', importance: 'Yes', description: 'Electricity, water, gas meters with readings and photos.', inputs: METER_EVIDENCE_INPUTS },
    { category: 'Keys & Access', importance: 'Yes', description: 'Keys, remotes, tags, gate codes (masked).', inputs: KEYS_ACCESS_INPUTS },
    { category: 'Compliance Documents', importance: 'Optional', description: 'Legal certificates and compliance documentation.', inputs: COMPLIANCE_DOCUMENTS_INPUTS },
    { category: 'Structural Indicators', importance: 'Optional', description: 'Foundation cracks, roof sagging, structural movement.', inputs: STRUCTURAL_INDICATORS_INPUTS },
    { category: 'Damp / Moisture', importance: 'Yes', description: 'Damp marks, moisture staining, mould, bathroom leaks.', inputs: DAMP_MOISTURE_INPUTS },
    { category: 'Appliance Serial Numbers', importance: 'Yes', description: 'Record serial numbers of appliances for tracking.', inputs: APPLIANCE_SERIAL_NUMBERS_INPUTS },
    { category: 'Safety Systems', importance: 'Yes', description: 'Security gates, burglar bars, fire extinguishers, pool fencing.', inputs: SAFETY_SYSTEMS_INPUTS },
    { category: 'Repair Recommendations', importance: 'Yes', description: 'Maintenance issues, required repairs, cost notes.', inputs: REPAIR_RECOMMENDATIONS_INPUTS },
    { category: 'Before/After Repairs', importance: 'Optional', description: 'Mandatory before/after photos for contractors.', inputs: BEFORE_AFTER_REPAIRS_INPUTS },
    { category: 'Electrical COC', importance: 'Optional', description: 'Electrical Certificate of Compliance required for sale/insurance.', inputs: ELECTRICAL_COC_INPUTS },
    { category: 'Gas COC', importance: 'Optional', description: 'Gas installation compliance (regulators, piping, safety).', inputs: GAS_COC_INPUTS },
    { category: 'Plumbing COC', importance: 'Optional', description: 'Cape Town mandatory certificate for plumbing installation safety.', inputs: PLUMBING_COC_INPUTS },
    { category: 'Water Installation Certificate', importance: 'Optional', description: 'Certifies plumbing and water flow compliance.', inputs: WATER_INSTALLATION_CERT_INPUTS },
    { category: 'Electric Fence Certificate', importance: 'Optional', description: 'Required for homes with electric fencing (security act).', inputs: ELECTRIC_FENCE_CERT_INPUTS },
    { category: 'Building Plans', importance: 'Optional', description: 'Approved building plans for structural verification.', inputs: BUILDING_PLANS_INPUTS },
    { category: 'Occupation Certificate', importance: 'Optional', description: 'Proof property is legally fit for occupation.', inputs: OCCUPATION_CERT_INPUTS },
    { category: 'Warranty Documents', importance: 'Optional', description: 'Appliance, installation, and repair warranties.', inputs: WARRANTY_DOCUMENTS_INPUTS }
  ]
}

/**
 * BUYER INSPECTION TEMPLATE
 * Focus: Pre-purchase due diligence, compliance verification
 */
export const BUYER_INSPECTION_TEMPLATE: RoleInspectionTemplate = {
  role: 'buyer',
  inspectionSequence: [
    { category: 'Standard Rooms', importance: 'Yes', description: 'Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting.', inputs: STANDARD_ROOMS_INPUTS },
    { category: 'Bathroom Systems', importance: 'Yes', description: 'Basins, taps, toilets, showers/baths, leaks, damp, ventilation.', inputs: BATHROOM_SYSTEMS_INPUTS },
    { category: 'Kitchen Systems', importance: 'Yes', description: 'Cabinets, counters, appliances, plumbing, extractor, sink.', inputs: KITCHEN_SYSTEMS_INPUTS },
    { category: 'Exterior', importance: 'Yes', description: 'Roof, gutters, paving, garden, fencing, security features.', inputs: EXTERIOR_INPUTS },
    { category: 'Special Features', importance: 'Yes', description: 'Solar, inverter, generator, aircon, smart devices, water tanks.', inputs: SPECIAL_FEATURES_INPUTS },
    { category: 'Meter Evidence', importance: 'Yes', description: 'Electricity, water, gas meters with readings and photos.', inputs: METER_EVIDENCE_INPUTS },
    { category: 'Keys & Access', importance: 'Optional', description: 'Keys, remotes, tags, gate codes (masked).', inputs: KEYS_ACCESS_INPUTS },
    { category: 'Compliance Documents', importance: 'Yes', description: 'Legal certificates and compliance documentation.', inputs: COMPLIANCE_DOCUMENTS_INPUTS },
    { category: 'Structural Indicators', importance: 'Yes', description: 'Foundation cracks, roof sagging, structural movement.', inputs: STRUCTURAL_INDICATORS_INPUTS },
    { category: 'Damp / Moisture', importance: 'Yes', description: 'Damp marks, moisture staining, mould, bathroom leaks.', inputs: DAMP_MOISTURE_INPUTS },
    { category: 'Appliance Serial Numbers', importance: 'Yes', description: 'Record serial numbers of appliances for tracking.', inputs: APPLIANCE_SERIAL_NUMBERS_INPUTS },
    { category: 'Safety Systems', importance: 'Yes', description: 'Security gates, burglar bars, fire extinguishers, pool fencing.', inputs: SAFETY_SYSTEMS_INPUTS },
    { category: 'Marketing Photos', importance: 'Optional', description: 'Photos for listings, staging, highlight features.', inputs: MARKETING_PHOTOS_INPUTS },
    { category: 'Repair Recommendations', importance: 'Yes', description: 'Maintenance issues, required repairs, cost notes.', inputs: REPAIR_RECOMMENDATIONS_INPUTS },
    { category: 'Before/After Repairs', importance: 'Optional', description: 'Mandatory before/after photos for contractors.', inputs: BEFORE_AFTER_REPAIRS_INPUTS },
    { category: 'Electrical COC', importance: 'Yes', description: 'Electrical Certificate of Compliance required for sale/insurance.', inputs: ELECTRICAL_COC_INPUTS },
    { category: 'Gas COC', importance: 'Yes', description: 'Gas installation compliance (regulators, piping, safety).', inputs: GAS_COC_INPUTS },
    { category: 'Plumbing COC', importance: 'Yes', description: 'Cape Town mandatory certificate for plumbing installation safety.', inputs: PLUMBING_COC_INPUTS },
    { category: 'Beetle Certificate', importance: 'Yes', description: 'Common in coastal provinces for wood borer inspections.', inputs: BEETLE_CERTIFICATE_INPUTS },
    { category: 'Water Installation Certificate', importance: 'Yes', description: 'Certifies plumbing and water flow compliance.', inputs: WATER_INSTALLATION_CERT_INPUTS },
    { category: 'Electric Fence Certificate', importance: 'Yes', description: 'Required for homes with electric fencing (security act).', inputs: ELECTRIC_FENCE_CERT_INPUTS },
    { category: 'Building Plans', importance: 'Yes', description: 'Approved building plans for structural verification.', inputs: BUILDING_PLANS_INPUTS },
    { category: 'Occupation Certificate', importance: 'Yes', description: 'Proof property is legally fit for occupation.', inputs: OCCUPATION_CERT_INPUTS },
    { category: 'Warranty Documents', importance: 'Optional', description: 'Appliance, installation, and repair warranties.', inputs: WARRANTY_DOCUMENTS_INPUTS }
  ]
}

/**
 * SELLER INSPECTION TEMPLATE
 * Focus: Property marketing, disclosure preparation, compliance readiness
 */
export const SELLER_INSPECTION_TEMPLATE: RoleInspectionTemplate = {
  role: 'seller',
  inspectionSequence: [
    { category: 'Standard Rooms', importance: 'Yes', description: 'Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting.', inputs: STANDARD_ROOMS_INPUTS },
    { category: 'Bathroom Systems', importance: 'Yes', description: 'Basins, taps, toilets, showers/baths, leaks, damp, ventilation.', inputs: BATHROOM_SYSTEMS_INPUTS },
    { category: 'Kitchen Systems', importance: 'Yes', description: 'Cabinets, counters, appliances, plumbing, extractor, sink.', inputs: KITCHEN_SYSTEMS_INPUTS },
    { category: 'Exterior', importance: 'Yes', description: 'Roof, gutters, paving, garden, fencing, security features.', inputs: EXTERIOR_INPUTS },
    { category: 'Special Features', importance: 'Yes', description: 'Solar, inverter, generator, aircon, smart devices, water tanks.', inputs: SPECIAL_FEATURES_INPUTS },
    { category: 'Meter Evidence', importance: 'Yes', description: 'Electricity, water, gas meters with readings and photos.', inputs: METER_EVIDENCE_INPUTS },
    { category: 'Keys & Access', importance: 'Optional', description: 'Keys, remotes, tags, gate codes (masked).', inputs: KEYS_ACCESS_INPUTS },
    { category: 'Compliance Documents', importance: 'Yes', description: 'Legal certificates and compliance documentation.', inputs: COMPLIANCE_DOCUMENTS_INPUTS },
    { category: 'Structural Indicators', importance: 'Yes', description: 'Foundation cracks, roof sagging, structural movement.', inputs: STRUCTURAL_INDICATORS_INPUTS },
    { category: 'Damp / Moisture', importance: 'Yes', description: 'Damp marks, moisture staining, mould, bathroom leaks.', inputs: DAMP_MOISTURE_INPUTS },
    { category: 'Appliance Serial Numbers', importance: 'Yes', description: 'Record serial numbers of appliances for tracking.', inputs: APPLIANCE_SERIAL_NUMBERS_INPUTS },
    { category: 'Safety Systems', importance: 'Yes', description: 'Security gates, burglar bars, fire extinguishers, pool fencing.', inputs: SAFETY_SYSTEMS_INPUTS },
    { category: 'Marketing Photos', importance: 'Yes', description: 'Photos for listings, staging, highlight features.', inputs: MARKETING_PHOTOS_INPUTS },
    { category: 'Repair Recommendations', importance: 'Optional', description: 'Maintenance issues, required repairs, cost notes.', inputs: REPAIR_RECOMMENDATIONS_INPUTS },
    { category: 'Before/After Repairs', importance: 'Optional', description: 'Mandatory before/after photos for contractors.', inputs: BEFORE_AFTER_REPAIRS_INPUTS },
    { category: 'Electrical COC', importance: 'Yes', description: 'Electrical Certificate of Compliance required for sale/insurance.', inputs: ELECTRICAL_COC_INPUTS },
    { category: 'Gas COC', importance: 'Yes', description: 'Gas installation compliance (regulators, piping, safety).', inputs: GAS_COC_INPUTS },
    { category: 'Plumbing COC', importance: 'Yes', description: 'Cape Town mandatory certificate for plumbing installation safety.', inputs: PLUMBING_COC_INPUTS },
    { category: 'Beetle Certificate', importance: 'Yes', description: 'Common in coastal provinces for wood borer inspections.', inputs: BEETLE_CERTIFICATE_INPUTS },
    { category: 'Water Installation Certificate', importance: 'Yes', description: 'Certifies plumbing and water flow compliance.', inputs: WATER_INSTALLATION_CERT_INPUTS },
    { category: 'Electric Fence Certificate', importance: 'Yes', description: 'Required for homes with electric fencing (security act).', inputs: ELECTRIC_FENCE_CERT_INPUTS },
    { category: 'Building Plans', importance: 'Yes', description: 'Approved building plans for structural verification.', inputs: BUILDING_PLANS_INPUTS },
    { category: 'Occupation Certificate', importance: 'Yes', description: 'Proof property is legally fit for occupation.', inputs: OCCUPATION_CERT_INPUTS },
    { category: 'Warranty Documents', importance: 'Optional', description: 'Appliance, installation, and repair warranties.', inputs: WARRANTY_DOCUMENTS_INPUTS }
  ]
}

/**
 * AGENT INSPECTION TEMPLATE
 * Focus: Professional reporting, can select any role template
 * Note: Agents can choose to use Tenant, Landlord, Buyer, Seller, or Contractor templates
 */
export const AGENT_INSPECTION_TEMPLATE: RoleInspectionTemplate = {
  role: 'agent',
  inspectionSequence: [
    { category: 'Standard Rooms', importance: 'Yes', description: 'Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting.', inputs: STANDARD_ROOMS_INPUTS },
    { category: 'Bathroom Systems', importance: 'Yes', description: 'Basins, taps, toilets, showers/baths, leaks, damp, ventilation.', inputs: BATHROOM_SYSTEMS_INPUTS },
    { category: 'Kitchen Systems', importance: 'Yes', description: 'Cabinets, counters, appliances, plumbing, extractor, sink.', inputs: KITCHEN_SYSTEMS_INPUTS },
    { category: 'Exterior', importance: 'Yes', description: 'Roof, gutters, paving, garden, fencing, security features.', inputs: EXTERIOR_INPUTS },
    { category: 'Special Features', importance: 'Yes', description: 'Solar, inverter, generator, aircon, smart devices, water tanks.', inputs: SPECIAL_FEATURES_INPUTS },
    { category: 'Meter Evidence', importance: 'Yes', description: 'Electricity, water, gas meters with readings and photos.', inputs: METER_EVIDENCE_INPUTS },
    { category: 'Keys & Access', importance: 'Optional', description: 'Keys, remotes, tags, gate codes (masked).', inputs: KEYS_ACCESS_INPUTS },
    { category: 'Compliance Documents', importance: 'Yes', description: 'Legal certificates and compliance documentation.', inputs: COMPLIANCE_DOCUMENTS_INPUTS },
    { category: 'Structural Indicators', importance: 'Yes', description: 'Foundation cracks, roof sagging, structural movement.', inputs: STRUCTURAL_INDICATORS_INPUTS },
    { category: 'Damp / Moisture', importance: 'Yes', description: 'Damp marks, moisture staining, mould, bathroom leaks.', inputs: DAMP_MOISTURE_INPUTS },
    { category: 'Appliance Serial Numbers', importance: 'Yes', description: 'Record serial numbers of appliances for tracking.', inputs: APPLIANCE_SERIAL_NUMBERS_INPUTS },
    { category: 'Safety Systems', importance: 'Yes', description: 'Security gates, burglar bars, fire extinguishers, pool fencing.', inputs: SAFETY_SYSTEMS_INPUTS },
    { category: 'Marketing Photos', importance: 'Yes', description: 'Photos for listings, staging, highlight features.', inputs: MARKETING_PHOTOS_INPUTS },
    { category: 'Repair Recommendations', importance: 'Yes', description: 'Maintenance issues, required repairs, cost notes.', inputs: REPAIR_RECOMMENDATIONS_INPUTS },
    { category: 'Before/After Repairs', importance: 'Optional', description: 'Mandatory before/after photos for contractors.', inputs: BEFORE_AFTER_REPAIRS_INPUTS },
    { category: 'Electrical COC', importance: 'Yes', description: 'Electrical Certificate of Compliance required for sale/insurance.', inputs: ELECTRICAL_COC_INPUTS },
    { category: 'Gas COC', importance: 'Yes', description: 'Gas installation compliance (regulators, piping, safety).', inputs: GAS_COC_INPUTS },
    { category: 'Plumbing COC', importance: 'Yes', description: 'Cape Town mandatory certificate for plumbing installation safety.', inputs: PLUMBING_COC_INPUTS },
    { category: 'Beetle Certificate', importance: 'Yes', description: 'Common in coastal provinces for wood borer inspections.', inputs: BEETLE_CERTIFICATE_INPUTS },
    { category: 'Water Installation Certificate', importance: 'Yes', description: 'Certifies plumbing and water flow compliance.', inputs: WATER_INSTALLATION_CERT_INPUTS },
    { category: 'Electric Fence Certificate', importance: 'Yes', description: 'Required for homes with electric fencing (security act).', inputs: ELECTRIC_FENCE_CERT_INPUTS },
    { category: 'Building Plans', importance: 'Yes', description: 'Approved building plans for structural verification.', inputs: BUILDING_PLANS_INPUTS },
    { category: 'Occupation Certificate', importance: 'Yes', description: 'Proof property is legally fit for occupation.', inputs: OCCUPATION_CERT_INPUTS },
    { category: 'Warranty Documents', importance: 'Optional', description: 'Appliance, installation, and repair warranties.', inputs: WARRANTY_DOCUMENTS_INPUTS }
  ]
}

/**
 * CONTRACTOR INSPECTION TEMPLATE
 * Focus: Before/after documentation, warranty tracking, repair evidence
 */
export const CONTRACTOR_INSPECTION_TEMPLATE: RoleInspectionTemplate = {
  role: 'contractor',
  inspectionSequence: [
    { category: 'Standard Rooms', importance: 'Yes', description: 'Walls, floors, ceilings, windows, doors, cupboards, sockets, lighting.', inputs: STANDARD_ROOMS_INPUTS },
    { category: 'Bathroom Systems', importance: 'Yes', description: 'Basins, taps, toilets, showers/baths, leaks, damp, ventilation.', inputs: BATHROOM_SYSTEMS_INPUTS },
    { category: 'Kitchen Systems', importance: 'Yes', description: 'Cabinets, counters, appliances, plumbing, extractor, sink.', inputs: KITCHEN_SYSTEMS_INPUTS },
    { category: 'Exterior', importance: 'Yes', description: 'Roof, gutters, paving, garden, fencing, security features.', inputs: EXTERIOR_INPUTS },
    { category: 'Special Features', importance: 'Yes', description: 'Solar, inverter, generator, aircon, smart devices, water tanks.', inputs: SPECIAL_FEATURES_INPUTS },
    { category: 'Meter Evidence', importance: 'Optional', description: 'Electricity, water, gas meters with readings and photos.', inputs: METER_EVIDENCE_INPUTS },
    { category: 'Compliance Documents', importance: 'Yes', description: 'Legal certificates and compliance documentation.', inputs: COMPLIANCE_DOCUMENTS_INPUTS },
    { category: 'Structural Indicators', importance: 'Yes', description: 'Foundation cracks, roof sagging, structural movement.', inputs: STRUCTURAL_INDICATORS_INPUTS },
    { category: 'Damp / Moisture', importance: 'Yes', description: 'Damp marks, moisture staining, mould, bathroom leaks.', inputs: DAMP_MOISTURE_INPUTS },
    { category: 'Appliance Serial Numbers', importance: 'Optional', description: 'Record serial numbers of appliances for tracking.', inputs: APPLIANCE_SERIAL_NUMBERS_INPUTS },
    { category: 'Safety Systems', importance: 'Yes', description: 'Security gates, burglar bars, fire extinguishers, pool fencing.', inputs: SAFETY_SYSTEMS_INPUTS },
    { category: 'Repair Recommendations', importance: 'Yes', description: 'Maintenance issues, required repairs, cost notes.', inputs: REPAIR_RECOMMENDATIONS_INPUTS },
    { category: 'Before/After Repairs', importance: 'Yes', description: 'Mandatory before/after photos for contractors.', inputs: BEFORE_AFTER_REPAIRS_INPUTS },
    { category: 'Electrical COC', importance: 'Yes', description: 'Electrical Certificate of Compliance required for sale/insurance.', inputs: ELECTRICAL_COC_INPUTS },
    { category: 'Gas COC', importance: 'Yes', description: 'Gas installation compliance (regulators, piping, safety).', inputs: GAS_COC_INPUTS },
    { category: 'Plumbing COC', importance: 'Yes', description: 'Cape Town mandatory certificate for plumbing installation safety.', inputs: PLUMBING_COC_INPUTS },
    { category: 'Beetle Certificate', importance: 'Optional', description: 'Common in coastal provinces for wood borer inspections.', inputs: BEETLE_CERTIFICATE_INPUTS },
    { category: 'Water Installation Certificate', importance: 'Optional', description: 'Certifies plumbing and water flow compliance.', inputs: WATER_INSTALLATION_CERT_INPUTS },
    { category: 'Electric Fence Certificate', importance: 'Yes', description: 'Required for homes with electric fencing (security act).', inputs: ELECTRIC_FENCE_CERT_INPUTS },
    { category: 'Building Plans', importance: 'Optional', description: 'Approved building plans for structural verification.', inputs: BUILDING_PLANS_INPUTS },
    { category: 'Occupation Certificate', importance: 'Optional', description: 'Proof property is legally fit for occupation.', inputs: OCCUPATION_CERT_INPUTS },
    { category: 'Warranty Documents', importance: 'Yes', description: 'Appliance, installation, and repair warranties.', inputs: WARRANTY_DOCUMENTS_INPUTS }
  ]
}

// =============================================================================
// AGENT TEMPLATE SELECTOR (SPECIAL RULE)
// =============================================================================

/**
 * Agent template selection options
 * Agents can choose to use any role's inspection template
 */
export const AGENT_TEMPLATE_OPTIONS = [
  { value: 'tenant' as const, label: 'Tenant Template', description: 'Use for move-in/move-out inspections', template: TENANT_INSPECTION_TEMPLATE },
  { value: 'landlord' as const, label: 'Landlord Template', description: 'Use for property management inspections', template: LANDLORD_INSPECTION_TEMPLATE },
  { value: 'buyer' as const, label: 'Buyer Template', description: 'Use for pre-purchase due diligence', template: BUYER_INSPECTION_TEMPLATE },
  { value: 'seller' as const, label: 'Seller Template', description: 'Use for property listing preparation', template: SELLER_INSPECTION_TEMPLATE },
  { value: 'contractor' as const, label: 'Contractor Template', description: 'Use for repair/maintenance documentation', template: CONTRACTOR_INSPECTION_TEMPLATE }
] as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get inspection template for a specific role
 * For agents, accepts optional template selection
 */
export function getInspectionTemplateForRole(
  role: UserRole,
  agentSelectedTemplate?: UserRole
): RoleInspectionTemplate {
  // If role is agent and they've selected a different template, use that
  if (role === 'agent' && agentSelectedTemplate && agentSelectedTemplate !== 'agent') {
    switch (agentSelectedTemplate) {
      case 'tenant': return TENANT_INSPECTION_TEMPLATE
      case 'landlord': return LANDLORD_INSPECTION_TEMPLATE
      case 'buyer': return BUYER_INSPECTION_TEMPLATE
      case 'seller': return SELLER_INSPECTION_TEMPLATE
      case 'contractor': return CONTRACTOR_INSPECTION_TEMPLATE
      default: return AGENT_INSPECTION_TEMPLATE
    }
  }

  // Otherwise, return the template for the user's role
  switch (role) {
    case 'tenant': return TENANT_INSPECTION_TEMPLATE
    case 'landlord': return LANDLORD_INSPECTION_TEMPLATE
    case 'buyer': return BUYER_INSPECTION_TEMPLATE
    case 'seller': return SELLER_INSPECTION_TEMPLATE
    case 'agent': return AGENT_INSPECTION_TEMPLATE
    case 'contractor': return CONTRACTOR_INSPECTION_TEMPLATE
    default: return TENANT_INSPECTION_TEMPLATE
  }
}

/**
 * Get only required categories for a role (excludes Optional)
 */
export function getRequiredCategoriesForRole(role: UserRole): InspectionCategoryTemplate[] {
  const template = getInspectionTemplateForRole(role)
  return template.inspectionSequence.filter(cat => cat.importance === 'Yes')
}

/**
 * Get only optional categories for a role
 */
export function getOptionalCategoriesForRole(role: UserRole): InspectionCategoryTemplate[] {
  const template = getInspectionTemplateForRole(role)
  return template.inspectionSequence.filter(cat => cat.importance === 'Optional')
}

/**
 * Check if a category is required for a specific role
 */
export function isCategoryRequiredForRole(categoryName: string, role: UserRole): boolean {
  const template = getInspectionTemplateForRole(role)
  const category = template.inspectionSequence.find(cat => cat.category === categoryName)
  return category?.importance === 'Yes'
}

/**
 * Get input definition by ID across all categories
 */
export function getInputDefinitionById(inputId: string): InspectionInput | null {
  // Search through all category inputs
  const allInputs = [
    ...STANDARD_ROOMS_INPUTS,
    ...BATHROOM_SYSTEMS_INPUTS,
    ...KITCHEN_SYSTEMS_INPUTS,
    ...EXTERIOR_INPUTS,
    ...SPECIAL_FEATURES_INPUTS,
    ...METER_EVIDENCE_INPUTS,
    ...KEYS_ACCESS_INPUTS,
    ...COMPLIANCE_DOCUMENTS_INPUTS,
    ...STRUCTURAL_INDICATORS_INPUTS,
    ...DAMP_MOISTURE_INPUTS,
    ...APPLIANCE_SERIAL_NUMBERS_INPUTS,
    ...SAFETY_SYSTEMS_INPUTS,
    ...MARKETING_PHOTOS_INPUTS,
    ...REPAIR_RECOMMENDATIONS_INPUTS,
    ...BEFORE_AFTER_REPAIRS_INPUTS,
    ...ELECTRICAL_COC_INPUTS,
    ...GAS_COC_INPUTS,
    ...PLUMBING_COC_INPUTS,
    ...BEETLE_CERTIFICATE_INPUTS,
    ...WATER_INSTALLATION_CERT_INPUTS,
    ...ELECTRIC_FENCE_CERT_INPUTS,
    ...BUILDING_PLANS_INPUTS,
    ...OCCUPATION_CERT_INPUTS,
    ...WARRANTY_DOCUMENTS_INPUTS
  ]

  return allInputs.find(input => input.id === inputId) || null
}
