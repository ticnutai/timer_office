import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaUndo, FaTrash, FaUpload, FaClock, FaDatabase } from 'react-icons/fa';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface BackupRestoreProps {
  onClose?: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onClose }) => {
  const { backups, createBackup, restoreBackup, deleteBackup, settings, exportData } = useStore();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [lastAutoBackup, setLastAutoBackup] = useState<Date | null>(null);

  // Auto backup
  useEffect(() => {
    const interval = setInterval(() => {
      createBackup('auto');
      setLastAutoBackup(new Date());
      console.log('Auto backup created');
    }, settings.autoBackupInterval * 60 * 1000); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [settings.autoBackupInterval, createBackup]);

  const handleManualBackup = () => {
    createBackup('manual');
    const data = exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `backup-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('גיבוי ידני נוצר והורד בהצלחה');
  };

  const handleRestore = (backupId: string) => {
    if (confirm('האם אתה בטוח שברצונך לשחזר גיבוי זה? כל הנתונים הנוכחיים יוחלפו.')) {
      restoreBackup(backupId);
      toast.success('הגיבוי שוחזר בהצלחה');
      setShowRestoreModal(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        useStore.getState().importData(data);
        toast.success('הגיבוי יובא ושוחזר בהצלחה');
        setShowRestoreModal(false);
        if (onClose) {
          onClose();
        }
      } catch (error) {
        toast.error('שגיאה בקריאת קובץ הגיבוי');
      }
    };
    reader.readAsText(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      {/* Backup buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleManualBackup}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg transition-all duration-200"
        >
          <FaSave />
          גיבוי ידני
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRestoreModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg transition-all duration-200"
        >
          <FaUndo />
          שחזור
        </motion.button>
      </div>

      {/* Restore Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRestoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FaDatabase />
                  מערכת שחזור
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                {/* Upload backup */}
                <div className="mb-6">
                  <label className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-colors duration-200">
                    <FaUpload />
                    <span className="font-medium">העלה קובץ גיבוי</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Backup list */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold mb-3">גיבויים זמינים</h3>
                  {backups.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      אין גיבויים זמינים
                    </div>
                  ) : (
                    backups.map((backup) => (
                      <motion.div
                        key={backup.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <FaClock className="text-gray-400" />
                              <span className="font-medium">
                                {format(new Date(backup.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                backup.type === 'auto'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {backup.type === 'auto' ? 'אוטומטי' : 'ידני'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              גודל: {formatFileSize(backup.size)} | 
                              לקוחות: {backup.data.clients.length} | 
                              טבלאות: {backup.data.tables.length}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRestore(backup.id)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors duration-200"
                            >
                              שחזר
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('האם אתה בטוח שברצונך למחוק גיבוי זה?')) {
                                  deleteBackup(backup.id);
                                  toast.success('הגיבוי נמחק בהצלחה');
                                }
                              }}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-200"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Auto backup info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaClock />
                    <span className="font-medium">גיבוי אוטומטי</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    גיבוי אוטומטי מתבצע כל {settings.autoBackupInterval} דקות
                    {lastAutoBackup && (
                      <> | גיבוי אחרון: {format(lastAutoBackup, 'HH:mm:ss')}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 flex justify-end">
                <button
                  onClick={() => setShowRestoreModal(false)}
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