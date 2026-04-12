import { getKeyApi } from '@utils/utilities'
import i18n from '@config/language/i18n'
import { BASE_URL_ACQUISITION_SOURCE_PRODUCT } from '@api/api-path'
import { RawFetchData } from '@api/raw-fetch-data'
import { GenericPageResponse } from '@api/generic-response'

export async function GetAllSourceProduct(filter: any): Promise<GenericPageResponse> {
  const token = await getKeyApi()
  const options: RequestInit = {
    method: 'POST', mode: 'cors',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: i18n.language },
    body: JSON.stringify({ page: filter.page ?? 0, size: filter.size ?? 20, ...filter }),
  }
  return RawFetchData<GenericPageResponse>(BASE_URL_ACQUISITION_SOURCE_PRODUCT, 'all', options)
}
