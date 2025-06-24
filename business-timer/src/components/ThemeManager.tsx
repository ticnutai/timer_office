import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaCheck, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import type { Theme } from '../types';
import toast from 'react-hot-toast';

const presetThemes: Theme[] = [
  {
    id: 'default',
    name: 'ברירת מחדל',
    colors: {
      primary: '#843dff',
      secondary: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    isCustom: false,
  },
  {
    id: 'ocean',
    name: 'אוקיינוס',
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      text: '#164e63',
      border: '#bae6fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    isCustom: false,
  },
  {
    id: 'sunset',
    name: 'שקיעה',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#fff7ed',
      text: '#7c2d12',
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    isCustom: false,
  },
  {
    id: 'forest',
    name: 'יער',
    colors: {
      primary: '#16a34a',
      secondary: '#22c55e',
      background: '#f0fdf4',
      text: '#14532d',
      border: '#bbf7d0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    isCustom: false,
  },
  {
    id: 'dark',
    name: 'מצב כהה',
    colors: {
      primary: '#a78bfa',
      secondary: '#818cf8',
      background: '#1f2937',
      text: '#f3f4f6',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    },
    isCustom: false,
  },
];

export const ThemeManager: React.FC = () => {
  const { currentTheme, customThemes, setTheme, addCustomTheme, deleteCustomTheme } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTheme, setNewTheme] = useState<Omit<Theme, 'id'>>({
    name: '',
    colors: { ...presetThemes[0].colors },
    isCustom: true,
  });

  const allThemes = [...presetThemes, ...customThemes];

  const applyTheme = (theme: Theme) => {
    setTheme(theme);
    // Apply theme to CSS variables
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    toast.success(`ערכת הנושא "${theme.name}" הוחלה בהצלחה`);
  };

  const createCustomTheme = () => {
    if (!newTheme.name.trim()) {
      toast.error('נא להזין שם לערכת הנושא');
      return;
    }
    addCustomTheme(newTheme);
    toast.success('ערכת נושא חדשה נוצרה בהצלחה');
    setIsCreating(false);
    setNewTheme({
      name: '',
      colors: { ...presetThemes[0].colors },
      isCustom: true,
    });
  };

  const exportTheme = (theme: Theme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `theme-${theme.name}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('ערכת הנושא יוצאה בהצלחה');
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string) as Theme;
        theme.isCustom = true;
        addCustomTheme(theme);
        toast.success('ערכת הנושא יובאה בהצלחה');
      } catch (error) {
        console.error(error);
        toast.error('שגיאה בייבוא ערכת הנושא');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-200"
      >
        <FaPalette className="text-lg" />
        <span className="text-base">ערכות נושא</span>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FaPalette />
                  מנהל ערכות נושא
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Actions */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
                  >
                    צור ערכת נושא חדשה
                  </button>
                  <label className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTheme}
                      className="hidden"
                    />
                    <FaUpload className="inline-block mr-2" />
                    ייבא ערכת נושא
                  </label>
                </div>

                {/* Theme creator */}
                {isCreating && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-gray-50 rounded-xl p-6 mb-6"
                  >
                    <h3 className="text-lg font-bold mb-4">יצירת ערכת נושא חדשה</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          שם הערכה
                        </label>
                        <input
                          type="text"
                          value={newTheme.name}
                          onChange={(e) =>
                            setNewTheme({ ...newTheme, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="הזן שם לערכת הנושא"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(newTheme.colors).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {key}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={value}
                                onChange={(e) =>
                                  setNewTheme({
                                    ...newTheme,
                                    colors: {
                                      ...newTheme.colors,
                                      [key]: e.target.value,
                                    },
                                  })
                                }
                                className="w-full h-10 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={value}
                                onChange={(e) =>
                                  setNewTheme({
                                    ...newTheme,
                                    colors: {
                                      ...newTheme.colors,
                                      [key]: e.target.value,
                                    },
                                  })
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setIsCreating(false)}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={createCustomTheme}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                        >
                          צור ערכה
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Theme grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allThemes.map((theme) => (
                    <motion.div
                      key={theme.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        currentTheme.id === theme.id
                          ? 'border-primary-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => applyTheme(theme)}
                    >
                      {currentTheme.id === theme.id && (
                        <div className="absolute top-2 left-2 bg-primary-500 text-white rounded-full p-1">
                          <FaCheck className="w-3 h-3" />
                        </div>
                      )}
                      
                      <h4 className="font-bold text-lg mb-2">{theme.name}</h4>
                      
                      {/* Color preview */}
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        {Object.values(theme.colors).slice(0, 8).map((color, index) => (
                          <div
                            key={index}
                            className="h-6 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportTheme(theme);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FaDownload />
                        </button>
                        {theme.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('האם אתה בטוח שברצונך למחוק ערכת נושא זו?')) {
                                deleteCustomTheme(theme.id);
                                toast.success('ערכת הנושא נמחקה בהצלחה');
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
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