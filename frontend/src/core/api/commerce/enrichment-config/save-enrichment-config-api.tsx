import { getKeyApi } from '@utils/utilities'
import i18n from '@config/language/i18n'
import { BASE_URL_COMMERCE_ENRICHMENT_CONFIG } from '@api/api-path'
import { RawFetchData } from '@api/raw-fetch-data'
import { GenericSaveResponse } from '@api/generic-response'

export async function SaveEnrichmentConfigApi(data: any): Promise<GenericSaveResponse> {
  const token = await getKeyApi()
  const options: RequestInit = {
    method: 'POST', mode: 'cors',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: i18n.language },
    body: JSON.stringify(data),
  }
  return RawFetchData<GenericSaveResponse>(BASE_URL_COMMERCE_ENRICHMENT_CONFIG, 'save', options)
}
