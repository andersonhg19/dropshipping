import { getUser } from '@utils/utilities'

import i18n from '@config/language/i18n'

let idUser = ''

export const initializeConstants = () => {
  idUser = getUser() && getUser().id ? getUser().id : ''
}

export const API_PASS_SERVICE = process.env.API_PASS_SERVICE

export const API_USER_TOKEN_SERVICE = 'admin'

export const SECRET_KEY = 'ADAERYUUCZ1PICANR'

export const GRID_SIZE = 10

export const DEFAULT_PASSWORD = 'Visnex123'

export const INFINITY_SYMBOL = '∞'

export const NOT_AVAILABLE = 'N/A'

export const BASE_URL_LANGUAGE = i18n.language

export const PAGE_SIZE_OPTIONS = [6, 10, 20, 50, 100]

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const BLOCKING_TIME = 19000000

export const DEFAULT_USER_ID = '1'

export const GENERIC_CUSTOMER = {
  id: '1',
  idCompany: '1',
  companyName: 'Default Company',
  idSubsidiary: 1,
  nameSubsidiary: 'Default Subsidiary',
  externalClientId: null,
  name: 'Cliente',
  secondName: '',
  firstSurname: 'Generico',
  secondSurname: '',
  idTypeCustomer: '1',
  nameTypeCustomer: 'Cedula',
  dni: '0000000000',
  idGender: '3',
  nameGender: 'Otro',
  idMaritalStatus: null,
  nameMaritalStatus: 'S/D',
  address: '-',
  idCity: null,
  nameCity: null,
  idCountry: null,
  nameCountry: null,
  mail: 'cliente@default.com',
  phone: '+0000000000',
  idUser: idUser,
  nameUser: 'Admin Systems',
  status: true,
  birthdate: null,
  group: [],
  NameSurname: 'Cliente Generico',
  SurnameName: 'Generico Cliente',
}
