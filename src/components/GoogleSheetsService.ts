import type { TableData, GoogleSheetData } from '../types';

/**
 * שירות לעבודה עם גוגל שיטס
 */
export class GoogleSheetsService {
  /**
   * המרת נתוני טבלה למבנה מתאים לגוגל שיטס
   */
  static tableToSheetValues(table: TableData): string[][] {
    // יצירת כותרות
    const headers = table.columns
      .filter(col => col.isVisible)
      .sort((a, b) => a.order - b.order)
      .map(col => col.label);
    
    // יצירת שורות נתונים
    const rows = table.rows.map(row => {
      return table.columns
        .filter(col => col.isVisible)
        .sort((a, b) => a.order - b.order)
        .map(col => String(row[col.id] || ''));
    });
    
    // החזרת מערך דו-ממדי עם כותרות ונתונים
    return [headers, ...rows];
  }
  
  /**
   * המרת נתונים מגוגל שיטס למבנה טבלה
   */
  static sheetValuesToTable(values: string[][], table: TableData): TableData {
    if (!values || values.length < 2) {
      return table; // אין מספיק נתונים
    }
    
    // השורה הראשונה היא כותרות
    const headers = values[0];
    
    // יצירת מיפוי בין כותרות לעמודות
    const columnMap = new Map<string, string>();
    
    table.columns.forEach(col => {
      const headerIndex = headers.findIndex(h => h === col.label);
      if (headerIndex !== -1) {
        columnMap.set(col.id, String(headerIndex));
      }
    });
    
    // יצירת שורות נתונים
    const rows = values.slice(1).map(rowValues => {
      const newRow: Record<string, unknown> = { clientId: '' };
      
      columnMap.forEach((headerIndex, colId) => {
        const index = parseInt(headerIndex);
        newRow[colId] = rowValues[index] || '';
      });
      
      return newRow;
    });
    
    // החזרת טבלה מעודכנת
    return {
      ...table,
      rows,
      updatedAt: new Date()
    };
  }
  
  /**
   * עדכון גיליון גוגל שיטס עם נתוני טבלה
   */
  static async updateSheet(table: TableData, sheetId: string): Promise<boolean> {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API לא זמין');
      }
      
      // המרת נתוני הטבלה למבנה המתאים לגוגל שיטס
      const values = this.tableToSheetValues(table);
      
      // עדכון הגיליון
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'A1', // התחלה מהתא הראשון
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      
      return true;
    } catch (error) {
      console.error('Error updating Google Sheet:', error);
      return false;
    }
  }
  
  /**
   * קריאת נתונים מגיליון גוגל שיטס
   */
  static async readSheet(sheetId: string): Promise<string[][] | null> {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API לא זמין');
      }
      
      // קריאת נתונים מהגיליון
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:Z' // קריאת טווח גדול של נתונים
      });
      
      return response.result.values || [];
    } catch (error) {
      console.error('Error reading Google Sheet:', error);
      return null;
    }
  }
  
  /**
   * סנכרון דו-כיווני בין טבלה לגיליון גוגל שיטס
   */
  static async syncTableWithSheet(table: TableData, sheetId: string): Promise<TableData | null> {
    try {
      // קריאת נתונים מהגיליון
      const sheetValues = await this.readSheet(sheetId);
      
      if (!sheetValues) {
        throw new Error('לא ניתן לקרוא נתונים מהגיליון');
      }
      
      // עדכון הטבלה עם נתונים מהגיליון
      const updatedTable = this.sheetValuesToTable(sheetValues, table);
      
      // עדכון הגיליון עם נתוני הטבלה המעודכנים
      await this.updateSheet(updatedTable, sheetId);
      
      // החזרת הטבלה המעודכנת עם חותמת זמן סנכרון
      return {
        ...updatedTable,
        lastSyncedAt: new Date()
      };
    } catch (error) {
      console.error('Error syncing with Google Sheet:', error);
      return null;
    }
  }
  
  /**
   * יצירת גיליון חדש
   */
  static async createSheet(title: string): Promise<GoogleSheetData | null> {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API לא זמין');
      }
      
      // יצירת גיליון חדש
      const response = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title
        }
      });
      
      const sheetId = response.result.spreadsheetId;
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      
      return {
        sheetId,
        title,
        url,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error creating Google Sheet:', error);
      return null;
    }
  }

  /**
   * בדיקת הרשאות גישה לגיליון
   */
  static async checkPermissions(sheetId: string): Promise<boolean> {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API לא זמין');
      }
      
      // ניסיון לקרוא את המטא-דאטה של הגיליון
      await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: sheetId
      });
      
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * ייצוא טבלה לגיליון חדש
   */
  static async exportTableToNewSheet(table: TableData, title: string): Promise<GoogleSheetData | null> {
    try {
      // יצירת גיליון חדש
      const newSheet = await this.createSheet(title || `${table.name} - ייצוא`);
      
      if (!newSheet) {
        throw new Error('לא ניתן ליצור גיליון חדש');
      }
      
      // עדכון הגיליון עם נתוני הטבלה
      const success = await this.updateSheet(table, newSheet.sheetId);
      
      if (!success) {
        throw new Error('לא ניתן לעדכן את הגיליון החדש');
      }
      
      return newSheet;
    } catch (error) {
      console.error('Error exporting table to new sheet:', error);
      return null;
    }
  }

  /**
   * הוספת גיליון משנה (sheet) לגיליון קיים
   */
  static async addSheetToSpreadsheet(spreadsheetId: string, sheetTitle: string): Promise<number | null> {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API לא זמין');
      }
      
      // הוספת גיליון משנה חדש
      const response = await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle
                }
              }
            }
          ]
        }
      });
      
      // החזרת מזהה גיליון המשנה החדש
      return response.result.replies[0].addSheet.properties.sheetId;
    } catch (error) {
      console.error('Error adding sheet to spreadsheet:', error);
      return null;
    }
  }
}

export default GoogleSheetsService; 