import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaTimes, FaPlus } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import type { TableColumn } from '../types';

interface ColumnManagerProps {
  tableId: string;
  onClose: () => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ tableId, onClose }) => {
  const { tables, updateTable } = useStore();
  const currentTable = tables.find(t => t.id === tableId);
  
  const [newColumnName, setNewColumnName] = useState('');
  const [columns, setColumns] = useState<TableColumn[]>(
    currentTable?.columns.sort((a, b) => a.order - b.order) || []
  );

  if (!currentTable) return null;

  const handleToggleVisibility = (columnId: string) => {
    const updatedColumns = columns.map(col => {
      if (col.id === columnId) {
        return { ...col, isVisible: !col.isVisible };
      }
      return col;
    });
    setColumns(updatedColumns);
  };

  const handleMoveColumn = (columnId: string, direction: 'up' | 'down') => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (
      (direction === 'up' && columnIndex === 0) ||
      (direction === 'down' && columnIndex === columns.length - 1)
    ) {
      return;
    }

    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
    
    // Swap orders
    const tempOrder = newColumns[columnIndex].order;
    newColumns[columnIndex].order = newColumns[targetIndex].order;
    newColumns[targetIndex].order = tempOrder;
    
    // Swap positions in array
    [newColumns[columnIndex], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[columnIndex]];
    
    setColumns(newColumns);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const newColumn: TableColumn = {
      id: `custom_${Date.now()}`,
      label: newColumnName,
      type: 'custom',
      isVisible: true,
      order: columns.length,
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnName('');
  };

  const handleRemoveColumn = (columnId: string) => {
    // Don't allow removing fixed columns like 'name'
    const column = columns.find(col => col.id === columnId);
    if (column?.isFixed) return;
    
    const updatedColumns = columns.filter(col => col.id !== columnId);
    // Reorder remaining columns
    const reorderedColumns = updatedColumns.map((col, index) => ({
      ...col,
      order: index,
    }));
    
    setColumns(reorderedColumns);
  };

  const handleSave = () => {
    updateTable(tableId, { columns });
    onClose();
  };

  const handleReset = () => {
    setColumns(currentTable.columns.sort((a, b) => a.order - b.order));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ניהול עמודות</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            גרור ושחרר עמודות כדי לשנות את הסדר שלהן, הפעל או כבה עמודות, או הוסף עמודות חדשות.
          </p>
          
          {/* Add new column */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="שם עמודה חדשה..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              <FaPlus />
            </button>
          </div>
          
          {/* Column list */}
          <div className="space-y-2">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleVisibility(column.id)}
                    className={`${
                      column.isVisible ? 'text-primary-600' : 'text-gray-400'
                    } hover:text-primary-700 transition-colors duration-200`}
                  >
                    {column.isVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <span className="font-medium">{column.label}</span>
                  {column.isFixed && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">קבוע</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveColumn(column.id, 'up')}
                    disabled={column.order === 0}
                    className={`${
                      column.order === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'
                    } transition-colors duration-200`}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => handleMoveColumn(column.id, 'down')}
                    disabled={column.order === columns.length - 1}
                    className={`${
                      column.order === columns.length - 1
                        ? 'text-gray-300'
                        : 'text-gray-600 hover:text-primary-600'
                    } transition-colors duration-200`}
                  >
                    <FaArrowDown />
                  </button>
                  {!column.isFixed && (
                    <button
                      onClick={() => handleRemoveColumn(column.id)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            איפוס
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              שמירה
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 