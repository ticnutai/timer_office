import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { FaFileExcel, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
// import type as needed

interface ExcelImportProps {
  onClose: () => void;
  onImportComplete?: () => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onClose, onImportComplete }) => {
  const { addClient } = useStore();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
      
      if (data.length === 0) {
        toast.error('הקובץ ריק או לא מכיל נתונים תקינים');
        return;
      }

      setFileName(file.name);
      setPreviewData(data.slice(0, 5)); // Preview first 5 rows
      
      // Extract headers
      const firstRow = data[0] as Record<string, unknown>;
      const extractedHeaders = Object.keys(firstRow);
      setHeaders(extractedHeaders);
      
      // Set default mappings
      const defaultMappings: Record<string, string> = {};
      extractedHeaders.forEach(header => {
        // Try to match headers to client properties
        if (header.toLowerCase().includes('שם') || 
            header.toLowerCase().includes('name')) {
          defaultMappings[header] = 'name';
        } else if (header.toLowerCase().includes('תעריף') || 
                  header.toLowerCase().includes('מחיר') || 
                  header.toLowerCase().includes('rate')) {
          defaultMappings[header] = 'hourlyRate';
        }
      });
      
      setMappings(defaultMappings);
      toast.success('הקובץ נטען בהצלחה');
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בקריאת הקובץ');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleMapping = (header: string, value: string) => {
    setMappings(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const importClients = () => {
    try {
      // Check if name mapping exists
      const nameHeader = Object.keys(mappings).find(key => mappings[key] === 'name');
      if (!nameHeader) {
        toast.error('חובה למפות את שדה שם הלקוח');
        return;
      }

      const arrayBuffer = XLSX.read(previewData, { type: 'array' });
      const sheetName = arrayBuffer.SheetNames[0];
      const worksheet = arrayBuffer.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Import clients
      let importedCount = 0;
      data.forEach((row: any) => {
        const name = row[nameHeader];
        if (!name) return; // Skip rows without name
        
        // Create client with mapped fields
        addClient(name);
        importedCount++;
      });
      
      toast.success(`יובאו ${importedCount} לקוחות בהצלחה`);
      if (onImportComplete) onImportComplete();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בייבוא הלקוחות');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto"
    >
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
        <h2 className="text-2xl font-bold">ייבוא לקוחות מאקסל</h2>
      </div>

      <div className="p-6">
        {previewData.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FaFileExcel className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <p className="font-medium mb-2">
              {isDragActive ? 'שחרר את הקובץ כאן' : 'גרור קובץ אקסל או לחץ לבחירה'}
            </p>
            <p className="text-sm text-gray-500">
              תומך ב: Excel (.xlsx, .xls)
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">קובץ: {fileName}</h3>
                <p className="text-sm text-gray-500">נמצאו {headers.length} עמודות</p>
              </div>
              <button
                onClick={() => {
                  setPreviewData([]);
                  setHeaders([]);
                  setMappings({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                בחר קובץ אחר
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">מיפוי שדות</h3>
              <p className="text-sm text-gray-500 mb-4">
                התאם את העמודות מהקובץ לשדות המערכת
              </p>

              <div className="space-y-3">
                {headers.map((header) => (
                  <div key={header} className="flex items-center gap-3">
                    <div className="w-1/3 font-medium">{header}</div>
                    <div className="w-2/3">
                      <select
                        value={mappings[header] || ''}
                        onChange={(e) => handleMapping(header, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">לא למפות</option>
                        <option value="name">שם לקוח</option>
                        <option value="hourlyRate">תעריף שעתי</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">תצוגה מקדימה</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                          {mappings[header] && (
                            <span className="text-xs text-indigo-600 block">
                              {mappings[header] === 'name' ? 'שם לקוח' : 'תעריף שעתי'}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {headers.map((header) => (
                          <td key={`${index}-${header}`} className="px-3 py-2 text-right text-sm">
                            {String(row[header] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
        >
          ביטול
        </button>
        {previewData.length > 0 && (
          <button
            onClick={importClients}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <FaCheck className="w-4 h-4" />
            ייבא לקוחות
          </button>
        )}
      </div>
    </motion.div>
  );
}; 