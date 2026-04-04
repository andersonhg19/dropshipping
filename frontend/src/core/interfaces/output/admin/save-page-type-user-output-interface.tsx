export interface SavePageTypeUserOutputInterface {
  id: number
  idTypeUser: number
  idModifiedBy: number
  pages: PagePermission[]
}

export interface PagePermission {
  idPage: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canRead: boolean
  active: boolean
}
