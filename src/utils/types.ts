export interface Timer {
  id: string;
  name: string;
  duration: number;
  category: string;
  createdAt: number;
}

export interface TimerWithStatus extends Timer {
  status: 'Running' | 'Paused' | 'Completed';
  remainingTime: number;
}

export interface GroupedTimers {
  [key: string]: TimerWithStatus[];
}

export interface TimerCardProps {
  timer: TimerWithStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export interface HistoryEntry {
  id: string;
  timerName: string;
  category: string;
  duration: number;
  completedAt: number;
}

export enum KEYS {
  STORAGE_KEY = '@timers',
  HISTORY_STORAGE_KEY = '@timer_history',
}

export interface CompletionModalProps {
  completedTimer: Timer | null;
  setCompletedTimer: (timer: Timer | null) => void;
}

export interface FormInputProps {
  title: string;
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
}

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  bgColor?: string;
  disabled?: boolean;
}
