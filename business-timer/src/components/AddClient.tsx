import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaPlus } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const AddClient: React.FC = () => {
  const { addClient } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientName, setClientName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      toast.error('נא להזין שם לקוח');
      return;
    }
    
    addClient(clientName.trim());
    toast.success(`הלקוח "${clientName}" נוסף בהצלחה`);
    setClientName('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setClientName('');
    }
  };

  return (
    <div className="relative">
      <motion.div
        layout
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <motion.div
          layout
          className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl text-white">
                <FaUserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">הוספת לקוח</h3>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isExpanded
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              <FaPlus
                className={`w-5 h-5 transition-transform duration-300 ${
                  isExpanded ? 'rotate-45' : ''
                }`}
              />
            </motion.button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="mt-6"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="clientName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      שם הלקוח
                    </label>
                    <input
                      id="clientName"
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="הזן את שם הלקוח"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      הוסף לקוח
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setClientName('');
                      }}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200"
                    >
                      ביטול
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}; 