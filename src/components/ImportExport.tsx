import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileImport, FaFileCsv, FaFileExcel, FaFileCode } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const ImportExport: React.FC = () => {
  const { clients, timeEntries, exportData, importData } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, unknown> | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        setImportPreview(data);
      } else if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setImportPreview({ clients: data });
      }
      toast.success('הקובץ נטען בהצלחה');
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בקריאת הקובץ');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleImport = () => {
    if (importPreview) {
      importData(importPreview);
      toast.success('הנתונים יובאו בהצלחה');
      setImportPreview(null);
      setShowModal(false);
    }
  };

  const handleExport = (format: 'json' | 'csv' | 'excel') => {
    const data = exportData();
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);
    
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `business-timer-export-${timestamp}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv' || format === 'excel') {
      // Prepare data for Excel/CSV
      const worksheetData = clients.map(client => {
        const clientEntries = timeEntries.filter(e => e.clientId === client.id);
        const totalHours = clientEntries.reduce((sum, e) => sum + e.duration / 3600, 0);
        
        return {
          'שם לקוח': client.name,
          'סה"כ שעות': totalHours.toFixed(2),
          'תעריף לשעה': client.hourlyRate || '',
          'סה"כ לתשלום': ((client.hourlyRate || 0) * totalHours).toFixed(2),
        };
      });

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'לקוחות');
      
      if (format === 'excel') {
        XLSX.writeFile(wb, `business-timer-export-${timestamp}.xlsx`);
      } else {
        XLSX.writeFile(wb, `business-timer-export-${timestamp}.csv`);
      }
    }
    
    toast.success('הקובץ יוצא בהצלחה');
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-lg transition-all duration-200"
      >
        <FaFileImport />
        ייבוא ייצוא
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
                <h2 className="text-2xl font-bold">ייבוא וייצוא נתונים</h2>
              </div>

              {/* Content */}
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Import Section */}
                <div>
                  <h3 className="text-lg font-bold mb-4">ייבוא נתונים</h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FaFileImport className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-medium mb-2">
                      {isDragActive ? 'שחרר את הקובץ כאן' : 'גרור קובץ או לחץ לבחירה'}
                    </p>
                    <p className="text-sm text-gray-500">
                      תומך ב: JSON, CSV, Excel
                    </p>
                  </div>

                  {importPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 rounded-xl"
                    >
                      <p className="text-green-700 font-medium mb-2">קובץ מוכן לייבוא</p>
                      <button
                        onClick={handleImport}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                      >
                        ייבא נתונים
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Export Section */}
                <div>
                  <h3 className="text-lg font-bold mb-4">ייצוא נתונים</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileCode className="text-blue-500" />
                        <span className="font-medium">JSON</span>
                      </div>
                      <span className="text-sm text-gray-500">גיבוי מלא</span>
                    </button>

                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileCsv className="text-green-500" />
                        <span className="font-medium">CSV</span>
                      </div>
                      <span className="text-sm text-gray-500">לעיבוד נתונים</span>
                    </button>

                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileExcel className="text-green-600" />
                        <span className="font-medium">Excel</span>
                      </div>
                      <span className="text-sm text-gray-500">דוח מפורט</span>
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <strong>טיפ:</strong> ייצוא JSON שומר את כל הנתונים כולל הגדרות וערכות נושא
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 