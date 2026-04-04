/* eslint-disable @typescript-eslint/no-explicit-any */

/** Minimal type declarations for Google APIs used by the Google Drive Picker integration */

declare namespace google {
  namespace accounts.oauth2 {
    interface TokenClient {
      requestAccessToken(config?: { prompt?: string }): void
      callback: (response: TokenResponse) => void
    }
    interface TokenResponse {
      access_token: string
      error?: string
    }
    function initTokenClient(config: {
      client_id: string
      scope: string
      callback: (response: TokenResponse) => void
    }): TokenClient
  }

  namespace picker {
    enum Action {
      PICKED = 'picked',
      CANCEL = 'cancel',
    }

    interface ResponseObject {
      action: string
      docs?: Array<{ id: string; name: string; url: string; mimeType: string }>
    }

    class DocsView {
      constructor(viewId?: any)
      setIncludeFolders(include: boolean): DocsView
      setSelectFolderEnabled(enabled: boolean): DocsView
      setMimeTypes(mimeTypes: string): DocsView
    }

    class DocsUploadView {
      constructor()
      setIncludeFolders(include: boolean): DocsUploadView
      setParent(folderId: string): DocsUploadView
    }

    class PickerBuilder {
      addView(view: DocsView | DocsUploadView): PickerBuilder
      setOAuthToken(token: string): PickerBuilder
      setDeveloperKey(key: string): PickerBuilder
      setAppId(appId: string): PickerBuilder
      setCallback(callback: (data: ResponseObject) => void): PickerBuilder
      setTitle(title: string): PickerBuilder
      build(): Picker
    }

    interface Picker {
      setVisible(visible: boolean): void
      dispose(): void
    }
  }
}

declare const gapi: {
  load(api: string, callback: () => void): void
  client: {
    init(config: { apiKey: string; discoveryDocs: string[] }): Promise<void>
    drive: {
      files: {
        create(params: any): Promise<any>
        get(params: any): Promise<any>
      }
      permissions: {
        create(params: any): Promise<any>
      }
    }
  }
}
