import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileImport, FaFileExcel, FaFileDownload, FaGoogle } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { ExcelImport } from './ExcelImport';
import GoogleSheetsManager from './GoogleSheetsManager';

export const ImportExport: React.FC = () => {
  const { exportData, importData } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, unknown> | null>(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showGoogleSheets, setShowGoogleSheets] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') return;
        
        const data = JSON.parse(result);
        setImportPreview(data);
        setShowModal(true);
      } catch {
        toast.error('שגיאה בקריאת הקובץ. ודא שהקובץ הוא בפורמט JSON תקין.');
      }
    };
    
    reader.readAsText(file);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });
  
  const handleConfirmImport = () => {
    if (importPreview) {
      importData(importPreview);
      toast.success('הנתונים יובאו בהצלחה');
      setShowModal(false);
      setImportPreview(null);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-timer-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('הנתונים יוצאו בהצלחה');
  };

  const handleExportExcel = () => {
    const { clients, timeEntries } = useStore.getState();
    
    // Create a workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Clients sheet
    const clientsData = clients.map(client => ({
      'מזהה': client.id,
      'שם לקוח': client.name,
      'סה"כ שעות': client.totalHours,
      'תעריף שעתי': client.hourlyRate || '',
      'נוצר בתאריך': new Date(client.createdAt).toLocaleString('he-IL'),
      'עודכן בתאריך': new Date(client.updatedAt).toLocaleString('he-IL'),
    }));
    
    const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(wb, clientsSheet, 'לקוחות');
    
    // Time entries sheet
    const timeEntriesData = timeEntries.map(entry => {
      const client = clients.find(c => c.id === entry.clientId);
      return {
        'מזהה': entry.id,
        'שם לקוח': client?.name || entry.clientId,
        'תאריך': entry.date,
        'שעת התחלה': entry.startTime ? new Date(entry.startTime).toLocaleTimeString('he-IL') : '',
        'שעת סיום': entry.endTime ? new Date(entry.endTime).toLocaleTimeString('he-IL') : '',
        'משך (שעות)': (entry.duration / 3600).toFixed(2),
        'תיאור': entry.description || '',
      };
    });
    
    const timeEntriesSheet = XLSX.utils.json_to_sheet(timeEntriesData);
    XLSX.utils.book_append_sheet(wb, timeEntriesSheet, 'רשומות זמן');
    
    // Generate Excel file
    XLSX.writeFile(wb, `business-timer-excel-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('הנתונים יוצאו לאקסל בהצלחה');
  };

  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ייבוא / ייצוא נתונים</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ייבוא */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">ייבוא נתונים</h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-8 rounded-xl text-center cursor-pointer transition-colors duration-200 ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <FaFileImport className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {isDragActive ? 'שחרר כאן את הקובץ' : 'גרור לכאן קובץ או לחץ לבחירת קובץ'}
              </p>
              <p className="text-sm text-gray-500">קבצי JSON בלבד</p>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setShowExcelImport(true)}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaFileExcel />
                ייבוא מאקסל
              </button>
              
              <button
                onClick={() => setShowGoogleSheets(true)}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaGoogle />
                סנכרון עם גוגל שיטס
              </button>
            </div>
          </div>
          
          {/* ייצוא */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">ייצוא נתונים</h3>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-600 mb-4">בחר פורמט לייצוא הנתונים:</p>
              
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <FaFileDownload />
                    <span className="font-medium">JSON</span>
                  </div>
                  <span className="text-sm text-gray-500">גיבוי מלא</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <FaFileExcel />
                    <span className="font-medium">Excel</span>
                  </div>
                  <span className="text-sm text-gray-500">לעיבוד נתונים</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">אישור ייבוא נתונים</h3>
                <p className="text-gray-600 mb-6">
                  האם אתה בטוח שברצונך לייבא את הנתונים? פעולה זו תחליף את כל הנתונים הקיימים.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-48 overflow-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {importPreview && JSON.stringify(importPreview, null, 2)}
                  </pre>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setImportPreview(null);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                  >
                    אישור ייבוא
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showExcelImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">ייבוא מאקסל</h2>
                <button
                  onClick={() => setShowExcelImport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ExcelImport onClose={() => setShowExcelImport(false)} />
            </div>
          </div>
        </div>
      )}
      
      {showGoogleSheets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">גוגל שיטס</h2>
                <button
                  onClick={() => setShowGoogleSheets(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <GoogleSheetsManager />
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 