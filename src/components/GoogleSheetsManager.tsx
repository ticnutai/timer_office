import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { FaGoogle, FaPlus, FaSync, FaUnlink, FaTrash } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import type { GoogleSheetData } from '../types';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GoogleSheetsManager: React.FC = () => {
  const { 
    tables, 
    currentTableId, 
    googleSheets, 
    settings,
    updateGoogleApiConfig,
    addGoogleSheet,
    removeGoogleSheet,
    linkTableToGoogleSheet,
    unlinkTableFromGoogleSheet,
    syncTableWithGoogleSheet,
    importFromGoogleSheet
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [newSheetUrl, setNewSheetUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [gapiLoaded, setGapiLoaded] = useState(false);

  const currentTable = tables.find(t => t.id === currentTableId);
  const linkedSheet = currentTable?.googleSheetId 
    ? googleSheets.find(s => s.sheetId === currentTable.googleSheetId)
    : null;

  // הפעלת הספרייה של גוגל - גישה משופרת
  useEffect(() => {
    if (!settings.googleApiConfig && API_KEY && CLIENT_ID) {
      updateGoogleApiConfig({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scopes: SCOPES
      });
    }

    // טען את ספריית גוגל בצורה משופרת
    const loadGoogleApi = () => {
      // בדוק אם הספרייה כבר נטענה
      if (window.gapi) {
        setGapiLoaded(true);
        initClient();
        return;
      }

      // טען את הספרייה
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          setGapiLoaded(true);
          initClient();
        });
      };
      script.onerror = () => {
        console.error('Failed to load Google API script');
        toast.error('שגיאה בטעינת ספריית Google API');
      };
      document.body.appendChild(script);
    };

    const initClient = () => {
      if (!window.gapi || !window.gapi.client) {
        console.error('Google API client not available');
        return;
      }

      const apiKey = settings.googleApiConfig?.apiKey || API_KEY;
      const clientId = settings.googleApiConfig?.clientId || CLIENT_ID;
      
      if (!apiKey || !clientId) {
        console.error('Google API key or Client ID not configured');
        toast.error('מפתח API או מזהה לקוח של Google לא הוגדרו');
        return;
      }

      window.gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        scope: SCOPES.join(' '),
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
      }).then(() => {
        // בדוק אם המשתמש כבר מחובר
        if (window.gapi.auth2 && window.gapi.auth2.getAuthInstance() && 
            window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
          setIsAuthenticated(true);
          toast.success('מחובר לחשבון Google');
        }
      }).catch(error => {
        console.error('Error initializing Google API client', error);
        toast.error('שגיאה באתחול לקוח Google API');
      });
    };

    loadGoogleApi();
  }, [settings.googleApiConfig, updateGoogleApiConfig]);

  // התחברות לגוגל
  const handleGoogleLogin = useCallback((credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      const token = credentialResponse.credential;
      // שמור את הטוקן לשימוש בהמשך
      if (token) {
        localStorage.setItem('googleAccessToken', token);
        setIsAuthenticated(true);
        toast.success('התחברת בהצלחה לחשבון Google');
        
        // נסה לאתחל את ה-API אם הוא לא אותחל עדיין
        if (gapiLoaded && window.gapi && window.gapi.client && !window.gapi.client.sheets) {
          window.gapi.client.load('sheets', 'v4')
            .catch((err: Error) => {
              console.error('Error loading sheets API', err);
            });
        }
      } else {
        throw new Error('לא התקבל טוקן הזדהות');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('שגיאה בהתחברות לחשבון Google');
    } finally {
      setIsLoading(false);
    }
  }, [gapiLoaded]);

  // הוספת גיליון חדש
  const handleAddSheet = useCallback(async () => {
    if (!newSheetUrl) {
      toast.error('נא להזין כתובת URL של גיליון Google');
      return;
    }

    setIsLoading(true);
    try {
      // חלץ את מזהה הגיליון מה-URL
      const match = newSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
        toast.error('כתובת URL לא תקינה של גיליון Google');
        return;
      }

      const sheetId = match[1];
      
      // בדוק אם הגיליון כבר קיים
      if (googleSheets.some(s => s.sheetId === sheetId)) {
        toast.error('גיליון זה כבר קיים במערכת');
        return;
      }

      // קבל מידע על הגיליון
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        toast.error('Google Sheets API לא זמין, נסה להתחבר מחדש');
        return;
      }

      const response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: sheetId
      });

      const newSheet: GoogleSheetData = {
        sheetId,
        title: response.result.properties.title,
        url: newSheetUrl,
        lastUpdated: new Date()
      };

      addGoogleSheet(newSheet);
      setNewSheetUrl('');
      toast.success('גיליון Google נוסף בהצלחה');
    } catch (error) {
      console.error('Error adding Google Sheet:', error);
      toast.error('שגיאה בהוספת גיליון Google');
    } finally {
      setIsLoading(false);
    }
  }, [newSheetUrl, googleSheets, addGoogleSheet]);

  // קישור טבלה לגיליון
  const handleLinkSheet = useCallback(async () => {
    if (!currentTableId || !selectedSheetId) {
      toast.error('יש לבחור טבלה וגיליון Google');
      return;
    }

    setIsLoading(true);
    try {
      linkTableToGoogleSheet(currentTableId, selectedSheetId);
      setSyncStatus(prev => ({ ...prev, [currentTableId]: 'מקושר, לא מסונכרן' }));
      toast.success('הטבלה קושרה בהצלחה לגיליון Google');
    } catch (error) {
      console.error('Error linking table to Google Sheet:', error);
      toast.error('שגיאה בקישור הטבלה לגיליון Google');
    } finally {
      setIsLoading(false);
    }
  }, [currentTableId, selectedSheetId, linkTableToGoogleSheet]);

  // ביטול קישור טבלה מגיליון
  const handleUnlinkSheet = useCallback(() => {
    if (!currentTableId || !currentTable?.googleSheetId) return;

    if (confirm('האם אתה בטוח שברצונך לבטל את הקישור לגיליון Google?')) {
      unlinkTableFromGoogleSheet(currentTableId);
      setSyncStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[currentTableId];
        return newStatus;
      });
      toast.success('הקישור לגיליון Google בוטל בהצלחה');
    }
  }, [currentTableId, currentTable, unlinkTableFromGoogleSheet]);

  // סנכרון טבלה עם גיליון
  const handleSyncSheet = useCallback(async () => {
    if (!currentTableId || !currentTable?.googleSheetId) return;

    setIsLoading(true);
    setSyncStatus(prev => ({ ...prev, [currentTableId]: 'מסנכרן...' }));

    try {
      await syncTableWithGoogleSheet(currentTableId);
      setSyncStatus(prev => ({ ...prev, [currentTableId]: 'מסונכרן' }));
      toast.success('הטבלה סונכרנה בהצלחה עם גיליון Google');
    } catch (error) {
      console.error('Error syncing with Google Sheet:', error);
      setSyncStatus(prev => ({ ...prev, [currentTableId]: 'שגיאת סנכרון' }));
      toast.error('שגיאה בסנכרון עם גיליון Google');
    } finally {
      setIsLoading(false);
    }
  }, [currentTableId, currentTable, syncTableWithGoogleSheet]);

  // ייבוא מגיליון
  const handleImportSheet = useCallback(async () => {
    if (!selectedSheetId) {
      toast.error('יש לבחור גיליון Google לייבוא');
      return;
    }

    setIsLoading(true);
    try {
      const result = await importFromGoogleSheet(selectedSheetId, true);
      if (result.success) {
        toast.success(`ייבוא הושלם בהצלחה. ${result.importedCount} רשומות יובאו.`);
      } else {
        toast.error(`שגיאה בייבוא: ${result.message}`);
      }
    } catch (error) {
      console.error('Error importing from Google Sheet:', error);
      toast.error('שגיאה בייבוא מגיליון Google');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSheetId, importFromGoogleSheet]);

  // מחיקת גיליון
  const handleDeleteSheet = useCallback((sheetId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק גיליון זה? פעולה זו תבטל את הקישור מכל הטבלאות המקושרות.')) {
      removeGoogleSheet(sheetId);
      toast.success('הגיליון הוסר בהצלחה');
    }
  }, [removeGoogleSheet]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">התחברות לגוגל שיטס</h2>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
          <FaGoogle className="text-4xl text-red-500 mb-4" />
          <p className="text-gray-600 mb-6 text-center">
            כדי להשתמש בגוגל שיטס, עליך להתחבר תחילה לחשבון Google שלך
          </p>
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error('שגיאה בהתחברות לחשבון Google')}
              useOneTap
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ניהול גוגל שיטס</h2>
      
      {/* הוספת גיליון חדש */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">הוספת גיליון חדש</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSheetUrl}
            onChange={(e) => setNewSheetUrl(e.target.value)}
            placeholder="הכנס כתובת URL של גיליון Google"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAddSheet}
            disabled={isLoading || !newSheetUrl}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <FaPlus />
            הוסף
          </button>
        </div>
      </div>

      {/* רשימת גליונות */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">גליונות מקושרים</h3>
        {googleSheets.length === 0 ? (
          <p className="text-gray-500 text-center py-4">אין גליונות מקושרים. הוסף גיליון חדש כדי להתחיל.</p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">שם הגיליון</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {googleSheets.map((sheet) => (
                  <tr key={sheet.sheetId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-right">
                      <a 
                        href={sheet.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {sheet.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteSheet(sheet.sheetId)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* קישור הטבלה הנוכחית */}
      {currentTable && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">קישור הטבלה הנוכחית</h3>
          
          {linkedSheet ? (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium">מקושר לגיליון:</p>
                  <a 
                    href={linkedSheet.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {linkedSheet.title}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncSheet}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaSync className={isLoading ? 'animate-spin' : ''} />
                    סנכרן
                  </button>
                  <button
                    onClick={handleUnlinkSheet}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaUnlink />
                    בטל קישור
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>סטטוס: {syncStatus[currentTableId] || 'לא מסונכרן'}</p>
                {currentTable.lastSyncedAt && (
                  <p>סנכרון אחרון: {new Date(currentTable.lastSyncedAt).toLocaleString('he-IL')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="mb-3">הטבלה הנוכחית אינה מקושרת לגיליון Google.</p>
              
              {googleSheets.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={selectedSheetId}
                    onChange={(e) => setSelectedSheetId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">בחר גיליון</option>
                    {googleSheets.map((sheet) => (
                      <option key={sheet.sheetId} value={sheet.sheetId}>
                        {sheet.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleLinkSheet}
                    disabled={isLoading || !selectedSheetId}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    קשר לגיליון
                  </button>
                  <button
                    onClick={handleImportSheet}
                    disabled={isLoading || !selectedSheetId}
                    className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    ייבא מגיליון
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">הוסף גיליון Google תחילה כדי לקשר אותו לטבלה זו.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsManager; 