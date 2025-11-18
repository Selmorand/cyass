// White-label configuration for multi-tenant deployment
export const whitelabelConfig = {
  // Brand Settings (can be overridden by environment variables)
  appName: import.meta.env.VITE_APP_NAME || 'SelfProHost',
  appTagline: import.meta.env.VITE_APP_TAGLINE || 'Professional Property Condition Reports',
  
  // Branding
  logoUrl: import.meta.env.VITE_LOGO_URL || '/logo.png',
  primaryColor: import.meta.env.VITE_BRAND_COLOR || '#277020',
  
  // Pricing Model
  pricingModel: import.meta.env.VITE_PRICING_MODEL || 'payperuse', // 'payperuse' | 'unlimited'
  reportPrice: 200, // R200 per report for pay-per-use
  
  // Features based on deployment type
  features: {
    showPricing: import.meta.env.VITE_PRICING_MODEL === 'payperuse',
    allowGuestReports: false, // Require signup
    watermarkText: import.meta.env.VITE_WATERMARK || 'SOLO REPORT',
    maxFreeReports: 0, // No free reports
    requirePayment: import.meta.env.VITE_PRICING_MODEL === 'payperuse'
  },
  
  // Support/Contact
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@selprohost.co.za',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '',
  
  // Legal
  companyName: import.meta.env.VITE_COMPANY_NAME || 'SelfProHost',
  companyReg: import.meta.env.VITE_COMPANY_REG || '',
  vatNumber: import.meta.env.VITE_VAT_NUMBER || ''
}

// Helper to check if running in agency mode (unlimited reports)
export const isAgencyMode = () => whitelabelConfig.pricingModel === 'unlimited'

// Helper to check if pay-per-use mode
export const isPayPerUse = () => whitelabelConfig.pricingModel === 'payperuse'