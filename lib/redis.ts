import { Redis } from '@upstash/redis'

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Redis key prefixes for organization
export const REDIS_KEYS = {
  PROFESSIONALS: 'clinic:professionals',
  CLINIC_CONFIG: 'clinic:config',
  CLINIC_INFO: 'clinic:info',
  CLINIC_ADDRESS: 'clinic:address', 
  CLINIC_CONTACTS: 'clinic:contacts',
  CLINIC_HOURS: 'clinic:hours',
  CUSTOM_HOURS: 'clinic:custom_hours',
  BOOKINGS: 'clinic:bookings',
} as const