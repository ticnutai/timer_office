import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaClock, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { format, startOfWeek, startOfMonth, isAfter, parseISO } from 'date-fns';
import { useStore } from '../store/useStore';

export const Dashboard: React.FC = () => {
  const { clients, timeEntries, settings } = useStore();

  // Calculate statistics
  const totalClients = clients.length;
  
  const todayEntries = timeEntries.filter(
    (entry) => entry.date === format(new Date(), 'yyyy-MM-dd')
  );
  const todayHours = todayEntries.reduce((sum, entry) => sum + entry.duration / 3600, 0);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEntries = timeEntries.filter(
    (entry) => isAfter(parseISO(entry.date), weekStart)
  );
  const weekHours = weekEntries.reduce((sum, entry) => sum + entry.duration / 3600, 0);

  const monthStart = startOfMonth(new Date());
  const monthEntries = timeEntries.filter(
    (entry) => isAfter(parseISO(entry.date), monthStart)
  );
  const monthHours = monthEntries.reduce((sum, entry) => sum + entry.duration / 3600, 0);

  const averageHourlyRate = clients.reduce((sum, client) => {
    return sum + (client.hourlyRate || settings.defaultHourlyRate || 0);
  }, 0) / (clients.length || 1);

  const monthlyRevenue = monthHours * averageHourlyRate;

  const stats = [
    {
      id: 'clients',
      label: 'סה"כ לקוחות',
      value: totalClients,
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      suffix: '',
    },
    {
      id: 'today',
      label: 'שעות היום',
      value: todayHours.toFixed(1),
      icon: FaClock,
      color: 'from-green-500 to-green-600',
      suffix: ' שעות',
    },
    {
      id: 'week',
      label: 'שעות השבוע',
      value: weekHours.toFixed(1),
      icon: FaChartLine,
      color: 'from-purple-500 to-purple-600',
      suffix: ' שעות',
    },
    {
      id: 'revenue',
      label: 'רווחים החודש',
      value: monthlyRevenue.toFixed(0),
      icon: FaMoneyBillWave,
      color: 'from-yellow-500 to-yellow-600',
      suffix: settings.currency,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="text-3xl font-bold text-gray-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
              >
                {stat.value}
                <span className="text-base font-normal text-gray-600">{stat.suffix}</span>
              </motion.div>
            </div>
            <h3 className="text-gray-600 font-medium">{stat.label}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 