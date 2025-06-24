import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaEllipsisV } from 'react-icons/fa';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import { TableColumn } from '../../types';

interface ClientTableProps {
  tableId: string;
}

export const ClientTable: React.FC<ClientTableProps> = ({ tableId }) => {
  const {
    clients,
    tables,
    timeEntries,
    addClient,
    updateClient,
    deleteClient,
    updateTable,
  } = useStore();

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingClientName, setEditingClientName] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ clientId: string; columnId: string } | null>(null);
  const [cellValue, setCellValue] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const currentTable = tables.find(t => t.id === tableId);

  if (!currentTable) {
    return <div className="text-center text-gray-500 py-8">טבלה לא נמצאה</div>;
  }

  const visibleColumns = currentTable.columns
    .filter(col => col.isVisible)
    .sort((a, b) => a.order - b.order);

  // Handle client name editing
  const startEditingClient = (clientId: string, currentName: string) => {
    setEditingClientId(clientId);
    setEditingClientName(currentName);
  };

  const saveClientName = () => {
    if (editingClientId && editingClientName.trim()) {
      updateClient(editingClientId, { name: editingClientName.trim() });
      toast.success('שם הלקוח עודכן בהצלחה');
    }
    setEditingClientId(null);
    setEditingClientName('');
  };

  const cancelEditingClient = () => {
    setEditingClientId(null);
    setEditingClientName('');
  };

  // Handle cell editing for custom columns
  const startEditingCell = (clientId: string, columnId: string, value: string) => {
    setEditingCell({ clientId, columnId });
    setCellValue(value);
  };

  const saveCellValue = () => {
    if (editingCell) {
      // Update the table data
      const updatedRows = currentTable.rows.map(row => {
        if (row.clientId === editingCell.clientId) {
          return { ...row, [editingCell.columnId]: cellValue };
        }
        return row;
      });
      updateTable(tableId, { rows: updatedRows });
      toast.success('התא עודכן בהצלחה');
    }
    setEditingCell(null);
    setCellValue('');
  };

  const cancelEditingCell = () => {
    setEditingCell(null);
    setCellValue('');
  };

  // Calculate hours for time tracking columns
  const getClientHours = (clientId: string, columnId: string) => {
    if (currentTable.type !== 'timeTracking') return '';

    const dayMapping: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };

    const dayIndex = dayMapping[columnId];
    if (dayIndex === undefined) return '';

    const dayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entry.clientId === clientId && entryDate.getDay() === dayIndex;
    });

    const totalHours = dayEntries.reduce((sum, entry) => sum + entry.duration / 3600, 0);
    return totalHours > 0 ? totalHours.toFixed(2) : '';
  };

  // Get cell value
  const getCellValue = (clientId: string, columnId: string) => {
    if (currentTable.type === 'timeTracking') {
      if (columnId === 'total') {
        const client = clients.find(c => c.id === clientId);
        return client?.totalHours.toFixed(2) || '0.00';
      }
      return getClientHours(clientId, columnId);
    } else {
      const row = currentTable.rows.find(r => r.clientId === clientId);
      return row?.[columnId] || '';
    }
  };

  // Toggle client selection
  const toggleClientSelection = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const toggleAllClients = () => {
    if (selectedClients.size === clients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(clients.map(c => c.id)));
    }
  };

  const deleteSelectedClients = () => {
    if (selectedClients.size === 0) return;
    
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedClients.size} לקוחות?`)) {
      selectedClients.forEach(clientId => deleteClient(clientId));
      setSelectedClients(new Set());
      toast.success('הלקוחות נמחקו בהצלחה');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Table Header Actions */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">{currentTable.name}</h3>
        <div className="flex gap-2">
          {selectedClients.size > 0 && (
            <button
              onClick={deleteSelectedClients}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaTrash />
              מחק {selectedClients.size} נבחרים
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary-50 to-secondary-50 sticky top-0 z-20">
            <tr>
              {/* Selection column */}
              <th className="sticky right-0 z-30 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={clients.length > 0 && selectedClients.size === clients.length}
                  onChange={toggleAllClients}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              {/* Columns */}
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-6 py-3 text-right text-sm font-medium text-gray-700 ${
                    column.isFixed ? 'sticky z-20' : ''
                  }`}
                  style={column.isFixed ? { left: column.id === 'name' ? '60px' : 'auto' } : {}}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  אין לקוחות. הוסף לקוח חדש כדי להתחיל
                </td>
              </tr>
            ) : (
              clients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Selection checkbox */}
                  <td className="sticky right-0 z-10 bg-white px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedClients.has(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  
                  {/* Table cells */}
                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-6 py-4 text-right ${
                        column.isFixed ? 'sticky z-10 bg-white' : ''
                      }`}
                      style={column.isFixed ? { left: column.id === 'name' ? '60px' : 'auto' } : {}}
                    >
                      {column.id === 'name' ? (
                        // Client name cell
                        <div className="flex items-center justify-between group">
                          {editingClientId === client.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingClientName}
                                onChange={(e) => setEditingClientName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveClientName();
                                  if (e.key === 'Escape') cancelEditingClient();
                                }}
                                className="flex-1 px-3 py-1 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                              />
                              <button
                                onClick={saveClientName}
                                className="text-green-600 hover:text-green-700"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={cancelEditingClient}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-medium text-gray-900">
                                {client.name}
                              </span>
                              <button
                                onClick={() => startEditingClient(client.id, client.name)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-600 transition-all duration-200"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : column.type === 'custom' && currentTable.type === 'regular' ? (
                        // Editable custom cell
                        <div
                          onDoubleClick={() =>
                            startEditingCell(client.id, column.id, getCellValue(client.id, column.id))
                          }
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          {editingCell?.clientId === client.id &&
                          editingCell?.columnId === column.id ? (
                            <input
                              type="text"
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onBlur={saveCellValue}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveCellValue();
                                if (e.key === 'Escape') cancelEditingCell();
                              }}
                              className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              autoFocus
                            />
                          ) : (
                            getCellValue(client.id, column.id) || '-'
                          )}
                        </div>
                      ) : (
                        // Read-only cell
                        <span
                          className={
                            column.type === 'number' || column.type === 'time'
                              ? 'font-mono'
                              : ''
                          }
                        >
                          {getCellValue(client.id, column.id) || '-'}
                        </span>
                      )}
                    </td>
                  ))}
                  
                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
                          deleteClient(client.id);
                          toast.success('הלקוח נמחק בהצלחה');
                        }
                      }}
                      className="text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 