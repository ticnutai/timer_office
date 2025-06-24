/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  // הוסף משתני סביבה נוספים כאן
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// הגדרות טיפוסים עבור Google Sheets API
interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: {
        apiKey: string;
        clientId: string;
        scope: string;
        discoveryDocs?: string[];
      }) => Promise<void>;
      load: (api: string, version: string) => Promise<void>;
      sheets: {
        spreadsheets: {
          get: (params: { spreadsheetId: string }) => Promise<{
            result: {
              properties: {
                title: string;
              };
              sheets: Array<{
                properties: {
                  sheetId: number;
                  title: string;
                };
              }>;
            };
          }>;
          create: (params: { properties: { title: string } }) => Promise<{
            result: {
              spreadsheetId: string;
              properties: {
                title: string;
              };
            };
          }>;
          values: {
            get: (params: { spreadsheetId: string; range: string }) => Promise<{
              result: {
                values: string[][];
              };
            }>;
            update: (params: {
              spreadsheetId: string;
              range: string;
              valueInputOption: string;
              resource: { values: unknown[][] };
            }) => Promise<{
              result: {
                updatedCells: number;
                updatedRows: number;
                updatedColumns: number;
              };
            }>;
            append: (params: {
              spreadsheetId: string;
              range: string;
              valueInputOption: string;
              resource: { values: unknown[][] };
            }) => Promise<{
              result: {
                updates: {
                  updatedCells: number;
                  updatedRows: number;
                  updatedColumns: number;
                };
              };
            }>;
          };
          batchUpdate: (params: {
            spreadsheetId: string;
            resource: {
              requests: Array<{
                addSheet?: {
                  properties: {
                    title: string;
                  };
                };
              }>;
            };
          }) => Promise<{
            result: {
              replies: Array<{
                addSheet?: {
                  properties: {
                    sheetId: number;
                    title: string;
                  };
                };
              }>;
            };
          }>;
        };
      };
    };
    auth2: {
      getAuthInstance: () => {
        isSignedIn: {
          get: () => boolean;
          listen: (callback: (isSignedIn: boolean) => void) => void;
        };
        signIn: () => Promise<unknown>;
        signOut: () => Promise<unknown>;
        currentUser: {
          get: () => {
            getBasicProfile: () => {
              getName: () => string;
              getEmail: () => string;
              getImageUrl: () => string;
            };
          };
        };
      };
    };
  };
}
