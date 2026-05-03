import type { DataProvider } from './interface'
import { MockProvider } from './mock'
import { AirtableProvider } from './airtable'
import { SupabaseProvider } from './supabase'

function createProvider(): DataProvider {
  const type = process.env.DATA_PROVIDER ?? 'mock'
  switch (type) {
    case 'supabase':
      return new SupabaseProvider()
    case 'airtable':
      return new AirtableProvider()
    case 'mock':
    default:
      return new MockProvider()
  }
}

const provider = createProvider()
export default provider
