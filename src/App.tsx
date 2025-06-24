import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaSearch, FaUsers, FaPlus, FaClock, FaTable, FaChartBar, FaCog, FaFileImport, FaPalette, FaSave } from 'react-icons/fa';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Modal, Box } from '@mui/material';
import './App.css';
import { Timer } from './components/Timer';
import { Dashboard } from './components/Dashboard';
import { AddClient } from './components/AddClient';
import { ThemeManager } from './components/ThemeManager';
import { BackupRestore } from './components/BackupRestore';
import { ImportExport } from './components/ImportExport';
import { Clients } from './components/Clients';
import { useStore } from './store/useStore';
import GoogleSheetsManager from './components/GoogleSheetsManager';

// מזהה הלקוח של גוגל
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { currentTheme, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickTools, setShowQuickTools] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'clients' | 'dashboard' | 'theme' | 'importExport' | 'backup' | 'googleSheets'>('clients');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const [showBackupRestore, setShowBackupRestore] = useState(false);

  // Apply theme on load and changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply RTL
    root.setAttribute('dir', 'rtl');
    root.setAttribute('lang', 'he');
  }, [currentTheme]);

  // Handle ESC key
  useEffect(() => {
    let escCount = 0;
    let escTimer: NodeJS.Timeout;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escCount++;
        
        if (escCount === 1) {
          // First ESC - close modals/dropdowns
          setShowQuickTools(false);
          setSearchTerm('');
        } else if (escCount === 2) {
          // Double ESC - scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        clearTimeout(escTimer);
        escTimer = setTimeout(() => {
          escCount = 0;
        }, 500);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearTimeout(escTimer);
    };
  }, []);

  // Auto save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      console.log('Auto saving...');
      // The zustand persist middleware handles this automatically
    }, settings.autoSaveInterval * 1000);

    return () => clearInterval(saveInterval);
  }, [settings.autoSaveInterval]);

  const tabs = [
    { id: 'timer', label: 'טיימר', icon: <FaClock /> },
    { id: 'clients', label: 'לקוחות', icon: <FaUsers /> },
    { id: 'dashboard', label: 'דשבורד', icon: <FaChartBar /> },
    { id: 'theme', label: 'ערכת נושא', icon: <FaPalette /> },
    { id: 'importExport', label: 'ייבוא/ייצוא', icon: <FaFileImport /> },
    { id: 'backup', label: 'גיבוי ושחזור', icon: <FaSave /> },
    { id: 'googleSheets', label: 'גוגל שיטס', icon: <FaUsers /> },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'timer':
        return <Timer />;
      case 'clients':
        return <Clients />;
      case 'theme':
        return <ThemeManager />;
      case 'importExport':
        return <ImportExport />;
      case 'backup':
        return <BackupRestore />;
      case 'googleSheets':
        return <GoogleSheetsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div
        className="min-h-screen"
        style={{
          '--color-primary': currentTheme.colors.primary,
          '--color-secondary': currentTheme.colors.secondary,
          '--color-background': currentTheme.colors.background,
          '--color-text': currentTheme.colors.text,
          '--color-border': currentTheme.colors.border,
          '--color-success': currentTheme.colors.success,
          '--color-warning': currentTheme.colors.warning,
          '--color-error': currentTheme.colors.error,
        } as React.CSSProperties}
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: currentTheme.colors.background,
              color: currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: currentTheme.colors.success,
                secondary: currentTheme.colors.background,
              },
            },
            error: {
              iconTheme: {
                primary: currentTheme.colors.error,
                secondary: currentTheme.colors.background,
              },
            },
          }}
        />

        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 w-full">
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
              >
                ניהול זמן לקוחות
              </motion.h1>

              <div className="flex items-center gap-4">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 ml-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="חיפוש..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Quick Tools */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQuickTools(!showQuickTools)}
                    className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl shadow-lg transition-all duration-200"
                  >
                    <FaBolt className="w-5 h-5" />
                  </motion.button>

                  {showQuickTools && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 min-w-[200px] z-50"
                    >
                      <button
                        onClick={() => {
                          // Quick action 1
                          setShowQuickTools(false);
                        }}
                        className="w-full text-right px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                      >
                        הוספת לקוח מהיר
                      </button>
                      <button
                        onClick={() => {
                          // Quick action 2
                          setShowQuickTools(false);
                        }}
                        className="w-full text-right px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                      >
                        ייצוא מהיר
                      </button>
                      <button
                        onClick={() => {
                          // Quick action 3
                          setShowQuickTools(false);
                        }}
                        className="w-full text-right px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                      >
                        סטטיסטיקות
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Theme Manager */}
                <button
                  onClick={() => setShowThemeManager(true)}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-200"
                >
                  <FaPalette className="w-5 h-5" />
                </button>

                {/* Import/Export */}
                <button
                  onClick={() => setShowImportExport(true)}
                  className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg transition-all duration-200"
                >
                  <FaFileImport className="w-5 h-5" />
                </button>

                {/* Backup & Restore */}
                <button
                  onClick={() => setShowBackupRestore(true)}
                  className="p-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg transition-all duration-200"
                >
                  <FaSave className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 py-8">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 w-full">
          <div className="w-full px-4 py-6">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>מערכת ניהול זמן לקוחות מתקדמת © 2024</p>
              <p className="text-sm mt-2">
                לחץ ESC פעם אחת לסגירת חלונות | לחץ ESC פעמיים לגלילה למעלה
              </p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AnimatePresence>
          {showAddClient && (
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
                <AddClient onClose={() => setShowAddClient(false)} />
              </motion.div>
            </motion.div>
          )}

          {showImportExport && (
            <Modal
              open={showImportExport}
              onClose={() => setShowImportExport(false)}
              aria-labelledby="import-export-modal"
              aria-describedby="import-export-functionality"
            >
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: '16px',
                boxShadow: 24,
                overflow: 'auto',
                p: 0,
              }}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">ייבוא / ייצוא נתונים</h2>
                    <button
                      onClick={() => setShowImportExport(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <ImportExport />
                </div>
              </Box>
            </Modal>
          )}
          
          {showThemeManager && (
            <Modal
              open={showThemeManager}
              onClose={() => setShowThemeManager(false)}
              aria-labelledby="theme-manager-modal"
              aria-describedby="theme-manager-functionality"
            >
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: '16px',
                boxShadow: 24,
                overflow: 'auto',
                p: 0,
              }}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">ערכות נושא</h2>
                    <button
                      onClick={() => setShowThemeManager(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <ThemeManager />
                </div>
              </Box>
            </Modal>
          )}
          
          {showBackupRestore && (
            <Modal
              open={showBackupRestore}
              onClose={() => setShowBackupRestore(false)}
              aria-labelledby="backup-restore-modal"
              aria-describedby="backup-restore-functionality"
            >
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: '16px',
                boxShadow: 24,
                overflow: 'auto',
                p: 0,
              }}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">ניהול גיבויים</h2>
                    <button
                      onClick={() => setShowBackupRestore(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <BackupRestore />
                </div>
              </Box>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
