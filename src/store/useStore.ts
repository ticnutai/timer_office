import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Client,
  TimeEntry,
  TimerState,
  TableData,
  Theme,
  AppSettings,
  CellMerge,
  BackupData,
} from '../types';

interface AppStore {
  // Clients
  clients: Client[];
  addClient: (name: string) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Time entries
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  getClientTimeEntries: (clientId: string) => TimeEntry[];
  
  // Timer
  timerState: TimerState;
  startTimer: (clientId: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  updateElapsedTime: (time: number) => void;
  
  // Tables
  tables: TableData[];
  currentTableId: string;
  addTable: (name: string, type: 'timeTracking' | 'regular') => void;
  updateTable: (id: string, updates: Partial<TableData>) => void;
  deleteTable: (id: string) => void;
  setCurrentTable: (id: string) => void;
  
  // Themes
  currentTheme: Theme;
  customThemes: Theme[];
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Omit<Theme, 'id'>) => void;
  deleteCustomTheme: (id: string) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Cell merges
  cellMerges: CellMerge[];
  addCellMerge: (merge: Omit<CellMerge, 'id'>) => void;
  removeCellMerge: (id: string) => void;
  
  // Backups
  backups: BackupData[];
  createBackup: (type: 'auto' | 'manual') => void;
  restoreBackup: (backupId: string) => void;
  deleteBackup: (id: string) => void;
  
  // Utility functions
  exportData: () => Record<string, unknown>;
  importData: (data: Record<string, unknown>) => void;
  clearAllData: () => void;
}

const defaultTheme: Theme = {
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
};

const defaultSettings: AppSettings = {
  language: 'he',
  autoSaveInterval: 5,
  autoBackupInterval: 30,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: '₪',
};

const defaultColumns = [
  { id: 'name', label: 'שם לקוח', type: 'text' as const, isVisible: true, isFixed: true, order: 0 },
  { id: 'sunday', label: 'ראשון', type: 'time' as const, isVisible: true, order: 1 },
  { id: 'monday', label: 'שני', type: 'time' as const, isVisible: true, order: 2 },
  { id: 'tuesday', label: 'שלישי', type: 'time' as const, isVisible: true, order: 3 },
  { id: 'wednesday', label: 'רביעי', type: 'time' as const, isVisible: true, order: 4 },
  { id: 'thursday', label: 'חמישי', type: 'time' as const, isVisible: true, order: 5 },
  { id: 'friday', label: 'שישי', type: 'time' as const, isVisible: true, order: 6 },
  { id: 'saturday', label: 'שבת', type: 'time' as const, isVisible: true, order: 7 },
  { id: 'total', label: 'סה"כ שעות', type: 'number' as const, isVisible: true, isFixed: true, order: 8 },
];

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      clients: [],
      timeEntries: [],
      timerState: {
        isRunning: false,
        elapsedTime: 0,
      },
      tables: [],
      currentTableId: '',
      currentTheme: defaultTheme,
      customThemes: [],
      settings: defaultSettings,
      cellMerges: [],
      backups: [],
      
      // Client actions
      addClient: (name: string) => {
        const newClient: Client = {
          id: uuidv4(),
          name,
          totalHours: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state: AppStore) => ({ clients: [...state.clients, newClient] }));
      },
      
      updateClient: (id: string, updates: Partial<Client>) => {
        set((state: AppStore) => ({
          clients: state.clients.map((client) =>
            client.id === id
              ? { ...client, ...updates, updatedAt: new Date() }
              : client
          ),
        }));
      },
      
      deleteClient: (id: string) => {
        set((state: AppStore) => ({
          clients: state.clients.filter((client) => client.id !== id),
          timeEntries: state.timeEntries.filter((entry) => entry.clientId !== id),
        }));
      },
      
      // Time entry actions
      addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => {
        const newEntry: TimeEntry = {
          ...entry,
          id: uuidv4(),
        };
        set((state: AppStore) => ({ timeEntries: [...state.timeEntries, newEntry] }));
        
        // Update client total hours
        const duration = entry.duration / 3600; // Convert to hours
        get().updateClient(entry.clientId, {
          totalHours: (get().clients.find(c => c.id === entry.clientId)?.totalHours || 0) + duration,
        });
      },
      
      updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => {
        set((state: AppStore) => ({
          timeEntries: state.timeEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },
      
      deleteTimeEntry: (id: string) => {
        const entry = get().timeEntries.find((e) => e.id === id);
        if (entry) {
          const duration = entry.duration / 3600;
          get().updateClient(entry.clientId, {
            totalHours: Math.max(0, (get().clients.find(c => c.id === entry.clientId)?.totalHours || 0) - duration),
          });
        }
        set((state: AppStore) => ({
          timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
        }));
      },
      
      getClientTimeEntries: (clientId: string) => {
        return get().timeEntries.filter((entry) => entry.clientId === clientId);
      },
      
      // Timer actions
      startTimer: (clientId: string) => {
        set({
          timerState: {
            isRunning: true,
            currentClientId: clientId,
            startTime: new Date(),
            elapsedTime: 0,
          },
        });
      },
      
      stopTimer: () => {
        const { timerState } = get();
        if (timerState.isRunning && timerState.currentClientId && timerState.startTime) {
          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - timerState.startTime.getTime()) / 1000);
          
          get().addTimeEntry({
            clientId: timerState.currentClientId,
            startTime: timerState.startTime,
            endTime,
            duration,
            date: new Date().toISOString().split('T')[0],
          });
        }
        set({
          timerState: {
            isRunning: false,
            elapsedTime: 0,
          },
        });
      },
      
      pauseTimer: () => {
        set((state: AppStore) => ({
          timerState: {
            ...state.timerState,
            isRunning: false,
          },
        }));
      },
      
      resumeTimer: () => {
        set((state: AppStore) => ({
          timerState: {
            ...state.timerState,
            isRunning: true,
            startTime: new Date(Date.now() - state.timerState.elapsedTime * 1000),
          },
        }));
      },
      
      resetTimer: () => {
        set({
          timerState: {
            isRunning: false,
            elapsedTime: 0,
          },
        });
      },
      
      updateElapsedTime: (time: number) => {
        set((state: AppStore) => ({
          timerState: {
            ...state.timerState,
            elapsedTime: time,
          },
        }));
      },
      
      // Table actions
      addTable: (name: string, type: 'timeTracking' | 'regular') => {
        const newTable: TableData = {
          id: uuidv4(),
          name,
          type,
          columns: type === 'timeTracking' ? defaultColumns : [],
          rows: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state: AppStore) => { 
          const tables = [...state.tables, newTable];
          return {
            tables,
            currentTableId: state.currentTableId || newTable.id,
          };
        });
      },
      
      updateTable: (id: string, updates: Partial<TableData>) => {
        set((state: AppStore) => ({
          tables: state.tables.map((table) =>
            table.id === id
              ? { ...table, ...updates, updatedAt: new Date() }
              : table
          ),
        }));
      },
      
      deleteTable: (id: string) => {
        set((state: AppStore) => {
          const tables = state.tables.filter((table) => table.id !== id);
          const currentTableId = state.currentTableId === id
            ? tables[0]?.id || ''
            : state.currentTableId;
          return { tables, currentTableId };
        });
      },
      
      setCurrentTable: (id: string) => {
        set({ currentTableId: id });
      },
      
      // Theme actions
      setTheme: (theme: Theme) => {
        set({ currentTheme: theme });
      },
      
      addCustomTheme: (theme: Omit<Theme, 'id'>) => {
        const newTheme: Theme = {
          ...theme,
          id: uuidv4(),
        };
        set((state: AppStore) => ({
          customThemes: [...state.customThemes, newTheme],
        }));
      },
      
      deleteCustomTheme: (id: string) => {
        set((state: AppStore) => ({
          customThemes: state.customThemes.filter((theme) => theme.id !== id),
        }));
      },
      
      // Settings actions
      updateSettings: (updates: Partial<AppSettings>) => {
        set((state: AppStore) => ({
          settings: { ...state.settings, ...updates },
        }));
      },
      
      // Cell merge actions
      addCellMerge: (merge: Omit<CellMerge, 'id'>) => {
        const newMerge: CellMerge = {
          ...merge,
          id: uuidv4(),
        };
        set((state: AppStore) => ({
          cellMerges: [...state.cellMerges, newMerge],
        }));
      },
      
      removeCellMerge: (id: string) => {
        set((state: AppStore) => ({
          cellMerges: state.cellMerges.filter((merge) => merge.id !== id),
        }));
      },
      
      // Backup actions
      createBackup: (type: 'auto' | 'manual') => {
        const state = get();
        const backup: BackupData = {
          id: uuidv4(),
          timestamp: new Date(),
          type,
          size: JSON.stringify(state).length,
          data: {
            clients: state.clients,
            timeEntries: state.timeEntries,
            tables: state.tables,
            theme: state.currentTheme,
            settings: state.settings,
          },
        };
        
        set((state: AppStore) => {
          const backups = [...state.backups, backup];
          // Keep only last 10 backups
          if (backups.length > 10) {
            backups.shift();
          }
          return { backups };
        });
      },
      
      restoreBackup: (backupId: string) => {
        const backup = get().backups.find((b) => b.id === backupId);
        if (backup) {
          set({
            clients: backup.data.clients,
            timeEntries: backup.data.timeEntries,
            tables: backup.data.tables,
            currentTheme: backup.data.theme,
            settings: backup.data.settings,
          });
        }
      },
      
      deleteBackup: (id: string) => {
        set((state: AppStore) => ({
          backups: state.backups.filter((backup) => backup.id !== id),
        }));
      },
      
      // Utility functions
      exportData: () => {
        const state = get();
        return {
          clients: state.clients,
          timeEntries: state.timeEntries,
          tables: state.tables,
          theme: state.currentTheme,
          settings: state.settings,
          cellMerges: state.cellMerges,
          exportDate: new Date().toISOString(),
        };
      },
      
      importData: (data: Record<string, unknown>) => {
        if (data.clients) set({ clients: data.clients as Client[] });
        if (data.timeEntries) set({ timeEntries: data.timeEntries as TimeEntry[] });
        if (data.tables) set({ tables: data.tables as TableData[] });
        if (data.theme) set({ currentTheme: data.theme as Theme });
        if (data.settings) set({ settings: data.settings as AppSettings });
        if (data.cellMerges) set({ cellMerges: data.cellMerges as CellMerge[] });
      },
      
      clearAllData: () => {
        set({
          clients: [],
          timeEntries: [],
          timerState: {
            isRunning: false,
            elapsedTime: 0,
          },
          tables: [],
          currentTableId: '',
          currentTheme: defaultTheme,
          customThemes: [],
          settings: defaultSettings,
          cellMerges: [],
          backups: [],
        });
      },
    }),
    {
      name: 'business-timer-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Initialize with default table if none exists
const state = useStore.getState();
if (state.tables.length === 0) {
  state.addTable('טבלת זמן עבודה ראשית', 'timeTracking');
} 