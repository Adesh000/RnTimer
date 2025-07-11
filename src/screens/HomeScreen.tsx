import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry } from './HistoryScreen';
import { useFocusEffect } from '@react-navigation/native';
import {
  CompletionModal,
  CustomButton,
  ProgressBar,
  TimerCard,
} from '../components';
import { formatTime, GroupedTimers, Timer, TimerWithStatus } from '../utils';

const STORAGE_KEY = '@timers';
const HISTORY_STORAGE_KEY = '@timer_history';

const HomeScreen = ({ navigation }) => {
  const [groupedTimers, setGroupedTimers] = useState<GroupedTimers>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [activeTimers, setActiveTimers] = useState<{
    [key: string]: NodeJS.Timer;
  }>({});
  const [completedTimer, setCompletedTimer] = useState<TimerWithStatus | null>(
    null,
  );

  const loadTimers = async () => {
    try {
      const timersJSON = await AsyncStorage.getItem(STORAGE_KEY);
      if (timersJSON) {
        const timers: Timer[] = JSON.parse(timersJSON);
        const timersWithStatus: TimerWithStatus[] = timers.map(timer => ({
          ...timer,
          status: 'Paused',
          remainingTime: timer.duration,
        }));

        const grouped = timersWithStatus.reduce((acc, timer) => {
          if (!acc[timer.category]) {
            acc[timer.category] = [];
          }
          acc[timer.category].push(timer);
          return acc;
        }, {} as GroupedTimers);

        setGroupedTimers(grouped);
        setExpandedCategories(Object.keys(grouped));
      }
    } catch (error) {
      console.error('Error loading timers:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTimers();
    }, []),
  );

  const persistTimers = async (groupedTimers: GroupedTimers) => {
    try {
      const allTimers = Object.values(groupedTimers).flat();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTimers));
    } catch (error) {
      console.error('Error persisting timers to AsyncStorage:', error);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category],
    );
  };

  const updateTimer = useCallback(
    (timerId: string, updates: Partial<TimerWithStatus>) => {
      setGroupedTimers(prevGrouped => {
        const newGrouped = { ...prevGrouped };
        for (const category of Object.keys(newGrouped)) {
          const timerIndex = newGrouped[category].findIndex(
            t => t.id === timerId,
          );
          if (timerIndex !== -1) {
            newGrouped[category][timerIndex] = {
              ...newGrouped[category][timerIndex],
              ...updates,
            };
            break;
          }
        }
        return newGrouped;
      });
    },
    [],
  );

  const saveToHistory = async (timer: TimerWithStatus) => {
    try {
      const historyJSON = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      const history: HistoryEntry[] = historyJSON
        ? JSON.parse(historyJSON)
        : [];

      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        timerName: timer.name,
        category: timer.category,
        duration: timer.duration,
        completedAt: Date.now(),
      };

      const updatedHistory = [historyEntry, ...history];
      await AsyncStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(updatedHistory),
      );
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const startTimer = (timer: TimerWithStatus) => {
    if (timer.status === 'Running' || timer.remainingTime === 0) return;

    const intervalId = setInterval(async () => {
      setGroupedTimers(prevGrouped => {
        const newGrouped = { ...prevGrouped };
        for (const category of Object.keys(newGrouped)) {
          const timerIndex = newGrouped[category].findIndex(
            t => t.id === timer.id,
          );
          if (timerIndex !== -1) {
            const updatedTimer = { ...newGrouped[category][timerIndex] };
            if (updatedTimer.remainingTime <= 1) {
              clearInterval(intervalId);
              setCompletedTimer(updatedTimer);
              saveToHistory(updatedTimer);
              updatedTimer.status = 'Completed';
              updatedTimer.remainingTime = 0;

              // Remove the completed timer
              newGrouped[category].splice(timerIndex, 1);

              // Remove category if it becomes empty
              if (newGrouped[category].length === 0) {
                delete newGrouped[category];
              }

              // Update AsyncStorage
              persistTimers(newGrouped);

              break;
            } else {
              updatedTimer.remainingTime -= 1;
            }
            newGrouped[category][timerIndex] = updatedTimer;
          }
        }
        return newGrouped;
      });
    }, 1000);

    setActiveTimers(prev => ({ ...prev, [timer.id]: intervalId }));
    updateTimer(timer.id, { status: 'Running' });
  };

  const pauseTimer = (timer: TimerWithStatus) => {
    if (timer.status !== 'Running') return;

    if (activeTimers[timer.id]) {
      clearInterval(activeTimers[timer.id]);
      const newActiveTimers = { ...activeTimers };
      delete newActiveTimers[timer.id];
      setActiveTimers(newActiveTimers);
    }

    updateTimer(timer.id, { status: 'Paused' });
  };

  const resetTimer = (timer: TimerWithStatus) => {
    if (activeTimers[timer.id]) {
      clearInterval(activeTimers[timer.id]);
      const newActiveTimers = { ...activeTimers };
      delete newActiveTimers[timer.id];
      setActiveTimers(newActiveTimers);
    }

    updateTimer(timer.id, {
      status: 'Paused',
      remainingTime: timer.duration,
    });
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(activeTimers).forEach(intervalId =>
        clearInterval(intervalId),
      );
    };
  }, [activeTimers]);

  const startAllTimersInCategory = (category: string) => {
    const timers = groupedTimers[category];
    timers.forEach(timer => {
      if (timer.status !== 'Running' && timer.remainingTime > 0) {
        startTimer(timer);
      }
    });
  };

  const pauseAllTimersInCategory = (category: string) => {
    const timers = groupedTimers[category];
    timers.forEach(timer => {
      if (timer.status === 'Running') {
        pauseTimer(timer);
      }
    });
  };

  const resetAllTimersInCategory = (category: string) => {
    const timers = groupedTimers[category];
    timers.forEach(timer => {
      resetTimer(timer);
    });
  };

  console.log('Grouped Timers:', groupedTimers);

  const sections = Object.entries(groupedTimers).map(([category, data]) => ({
    title: category,
    data,
  }));

  return (
    <View style={styles.container}>
      <Button
        title="Create Timer"
        onPress={() => navigation.navigate('Create')}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No timers created yet</Text>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.categoryTitleContainer}
                onPress={() => toggleCategory(title)}
              >
                <Text style={styles.categoryTitle}>{title}</Text>
                <Text style={styles.expandIcon}>
                  {expandedCategories.includes(title) ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              <View style={styles.categoryControls}>
                <CustomButton
                  title="Start All"
                  onPress={() => startAllTimersInCategory(title)}
                  bgColor="#4CAF50"
                />
                <CustomButton
                  title="Pause All"
                  onPress={() => pauseAllTimersInCategory(title)}
                  bgColor="#FFC107"
                />
                <CustomButton
                  title="Reset All"
                  onPress={() => resetAllTimersInCategory(title)}
                  bgColor="#F44336"
                />
              </View>
            </View>
          </View>
        )}
        renderItem={({ item, section }) =>
          expandedCategories.includes(section.title) ? (
            <View style={styles.timersContainer}>
              <TimerCard
                timer={item}
                onStart={() => startTimer(item)}
                onPause={() => pauseTimer(item)}
                onReset={() => resetTimer(item)}
              />
            </View>
          ) : null
        }
      />

      <Button title="History" onPress={() => navigation.navigate('History')} />

      <CompletionModal
        completedTimer={completedTimer}
        setCompletedTimer={setCompletedTimer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  list: {
    marginTop: 20,
  },
  categoryContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryHeader: {
    padding: 15,
    backgroundColor: '#fff',
    elevation: 5,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 16,
  },
  timersContainer: {
    paddingHorizontal: 10,
  },
  timerCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 5,
  },
  timerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerTime: {
    fontSize: 14,
    color: '#666',
  },
  timerStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  controlButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default HomeScreen;
