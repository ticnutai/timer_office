export interface Client {
  id: string;
  name: string;
  totalHours: number;
  hourlyRate?: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  clientId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  description?: string;
  date: string; // YYYY-MM-DD format
}

export interface TimerState {
  isRunning: boolean;
  currentClientId?: string;
  startTime?: Date;
  elapsedTime: number; // in seconds
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'custom';
  width?: number;
  isVisible: boolean;
  isFixed?: boolean;
  order: number;
}

export interface TableData {
  id: string;
  name: string;
  type: 'timeTracking' | 'regular';
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  isCustom: boolean;
}

export interface BackupData {
  id: string;
  timestamp: Date;
  size: number;
  type: 'auto' | 'manual';
  data: {
    clients: Client[];
    timeEntries: TimeEntry[];
    tables: TableData[];
    theme: Theme;
    settings: AppSettings;
  };
}

export interface AppSettings {
  language: 'he' | 'en';
  autoSaveInterval: number; // in seconds
  autoBackupInterval: number; // in minutes
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  defaultHourlyRate?: number;
}

export interface CellMerge {
  id: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  tableId: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'xml';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// export interface ClientTableProps {
//   tableId: string;
// }

// export interface HeaderGroup {
//   id: string;
//   label: string;
//   span: number;
// }

// export interface ColumnManagerProps {
//   tableId: string;
//   onClose: () => void;
// }

// export interface ThemeColors {
//   primary: string;
//   secondary: string;
//   background: string;
//   text: string;
//   border: string;
//   success: string;
//   warning: string;
//   error: string;
// }

// export interface ThemeOption {
//   id: string;
//   name: string;
//   colors: ThemeColors;
// }

// export interface TableToolsProps {
//   tableId: string;
//   onClose: () => void;
// }

// export interface QuickToolsMenuProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export interface TableSizeManagerProps {
//   tableId: string;
//   onClose: () => void;
// }

// export interface ClientDetailProps {
//   clientId: string;
//   onClose: () => void;
// }

// export interface DragColumnProps {
//   column: TableColumn;
//   index: number;
//   moveColumn: (dragIndex: number, hoverIndex: number) => void;
// }

// export interface TableTypeOption {
//   id: 'timeTracking' | 'regular';
//   label: string;
//   description: string;
//   icon: React.ComponentType;
// } 