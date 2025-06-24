import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaClock } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const Timer: React.FC = () => {
  const {
    clients,
    timerState,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateElapsedTime,
  } = useStore();

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - new Date(timerState.startTime!).getTime()) / 1000
        );
        updateElapsedTime(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.startTime, updateElapsedTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedClientId && !timerState.currentClientId) {
      toast.error('נא לבחור לקוח לפני התחלת הטיימר');
      setShowClientDropdown(true);
      return;
    }
    startTimer(selectedClientId || timerState.currentClientId!);
    toast.success('הטיימר הופעל');
  };

  const handleStop = () => {
    stopTimer();
    toast.success('הזמן נשמר בהצלחה');
    setSelectedClientId('');
  };

  const handlePause = () => {
    pauseTimer();
    toast.info('הטיימר הושהה');
  };

  const handleResume = () => {
    resumeTimer();
    toast.info('הטיימר ממשיך');
  };

  const currentClient = clients.find(
    (c) => c.id === (timerState.currentClientId || selectedClientId)
  );

  return (
    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 shadow-2xl">
      <div className="text-center">
        <motion.div
          className="mb-4"
          animate={{ scale: timerState.isRunning ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaClock className="w-16 h-16 mx-auto text-white/80" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">טיימר חכם</h2>

        {/* Client selector */}
        <div className="relative mb-6">
          {!timerState.isRunning && (
            <button
              onClick={() => setShowClientDropdown(!showClientDropdown)}
              className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-3 text-lg font-medium transition-all duration-200 backdrop-blur-sm"
            >
              {currentClient ? currentClient.name : 'בחר לקוח'}
            </button>
          )}

          {timerState.isRunning && currentClient && (
            <div className="text-white text-xl font-medium">
              עובד עבור: {currentClient.name}
            </div>
          )}

          {showClientDropdown && !timerState.isRunning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl max-h-60 overflow-y-auto z-50"
            >
              {clients.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  אין לקוחות. נא להוסיף לקוח חדש
                </div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setShowClientDropdown(false);
                    }}
                    className="w-full text-right px-4 py-3 hover:bg-gray-100 transition-colors duration-150 border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">
                      סה"כ שעות: {client.totalHours.toFixed(2)}
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </div>

        {/* Timer display */}
        <motion.div
          className="text-6xl font-mono font-bold text-white mb-8"
          animate={{ opacity: timerState.isRunning ? [1, 0.7, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {formatTime(timerState.elapsedTime)}
        </motion.div>

        {/* Control buttons */}
        <div className="flex justify-center gap-4">
          {!timerState.isRunning && timerState.elapsedTime === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
            >
              <FaPlay className="w-6 h-6" />
            </motion.button>
          )}

          {timerState.isRunning && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
              >
                <FaPause className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
              >
                <FaStop className="w-6 h-6" />
              </motion.button>
            </>
          )}

          {!timerState.isRunning && timerState.elapsedTime > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResume}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
              >
                <FaPlay className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
              >
                <FaStop className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 