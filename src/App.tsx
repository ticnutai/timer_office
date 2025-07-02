import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaBolt, FaSearch, FaUsers } from 'react-icons/fa';
import { Timer } from './components/Timer';
import { Dashboard } from './components/Dashboard';
import { AddClient } from './components/AddClient';
import { ThemeManager } from './components/ThemeManager';
import { BackupRestore } from './components/BackupRestore';
import { ImportExport } from './components/ImportExport';
import { Clients } from './components/Clients';
import { TableSelector } from './components/TableSelector';
import { useStore } from './store/useStore';

function App() {
  const { currentTheme, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickTools, setShowQuickTools] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'clients'>('clients');

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
    let escTimer: ReturnType<typeof setTimeout>;

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

  return (
    <div 
      className="min-h-screen w-full transition-colors duration-300"
      style={{ backgroundColor: currentTheme.colors.background }}
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
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'home'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  דף הבית
                </button>
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    activeTab === 'clients'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaUsers />
                  לקוחות
                </button>
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
              <ThemeManager />

              {/* Import/Export */}
              <ImportExport />

              {/* Backup & Restore */}
              <BackupRestore />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 py-8">
        {activeTab === 'home' ? (
          <div className="grid gap-8">
            {/* Dashboard Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Dashboard />
            </motion.section>

            {/* Timer and Add Client */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Timer />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AddClient />
              </motion.section>
            </div>

            {/* Tables Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">טבלאות זמן עבודה</h2>
              <TableSelector />
            </motion.section>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Clients />
          </motion.div>
        )}
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
    </div>
  );
}

export default App;
