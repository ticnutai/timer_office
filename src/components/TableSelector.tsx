import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTable, FaFileExcel, FaTrash } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { ExcelImportTable } from './ExcelImportTable';

export const TableSelector: React.FC = () => {
  const { tables, currentTableId, addTable, deleteTable, setCurrentTable } = useStore();
  const [showNewTableModal, setShowNewTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableType, setNewTableType] = useState<'timeTracking' | 'regular'>('regular');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleAddTable = () => {
    if (!newTableName.trim()) {
      toast.error('יש להזין שם לטבלה');
      return;
    }
    
    addTable(newTableName, newTableType);
    setNewTableName('');
    setShowNewTableModal(false);
    toast.success('הטבלה נוצרה בהצלחה');
  };

  const handleDeleteTable = (id: string, name: string) => {
    if (tables.length <= 1) {
      toast.error('לא ניתן למחוק את הטבלה האחרונה');
      return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את הטבלה "${name}"?`)) {
      deleteTable(id);
      toast.success('הטבלה נמחקה בהצלחה');
    }
  };

  const currentTable = tables.find(t => t.id === currentTableId);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-2 flex items-center gap-2 mb-4 overflow-x-auto">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setCurrentTable(table.id)}
            className={`px-4 py-2 whitespace-nowrap rounded-lg transition-all duration-200 flex items-center gap-2 ${
              table.id === currentTableId
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaTable className="w-4 h-4" />
            <span>{table.name}</span>
          </button>
        ))}
        
        <button
          onClick={() => setShowNewTableModal(true)}
          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>טבלה חדשה</span>
        </button>
      </div>
      
      {currentTable && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentTable.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaFileExcel className="w-4 h-4" />
              <span>ייבא מאקסל</span>
            </button>
            <button
              onClick={() => handleDeleteTable(currentTable.id, currentTable.name)}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Table Modal */}
      <AnimatePresence>
        {showNewTableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTableModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
                <h2 className="text-2xl font-bold">טבלה חדשה</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם הטבלה
                  </label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="הזן שם לטבלה"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    סוג טבלה
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTableType('regular')}
                      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all duration-200 ${
                        newTableType === 'regular'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaTable className="w-6 h-6" />
                      <span className="font-medium">טבלה רגילה</span>
                      <span className="text-xs text-gray-500">
                        טבלה מותאמת אישית
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTableType('timeTracking')}
                      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all duration-200 ${
                        newTableType === 'timeTracking'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaTable className="w-6 h-6" />
                      <span className="font-medium">טבלת זמן</span>
                      <span className="text-xs text-gray-500">
                        למעקב אחר שעות עבודה
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewTableModal(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddTable}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
                >
                  צור טבלה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Excel Import Modal */}
      <AnimatePresence>
        {showImportModal && currentTableId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ExcelImportTable
                tableId={currentTableId}
                onClose={() => setShowImportModal(false)}
                onImportComplete={() => {
                  // Additional actions after import if needed
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 