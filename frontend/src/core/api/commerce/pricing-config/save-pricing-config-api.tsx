import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_COMMERCE_PRICING_CONFIG } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { GenericSaveResponse } from '@api/generic-response'

async function SavePricingConfigApi(ae_object: Record<string, any>): Promise<GenericSaveResponse> {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }

  try {
    const options = {
      method: 'post',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: ae_object.id || '',
        shippingCostDefault: ae_object.shippingCostDefault ?? 0,
        customsRate: ae_object.customsRate ?? 0,
        ivaRate: ae_object.ivaRate ?? 0,
        profitMargin: ae_object.profitMargin ?? 0,
        platformFeeRate: ae_object.platformFeeRate ?? 0,
        roundToNearest: ae_object.roundToNearest ?? 0,
        active: ae_object.active,
        idModifiedBy: ae_object.idModifiedBy || '',
      }),
    }

    const data = await RawFetchData<GenericSaveResponse>(BASE_URL_COMMERCE_PRICING_CONFIG, 'save', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<GenericSaveResponse | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      }
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    }
  }
}

export { SavePricingConfigApi }
