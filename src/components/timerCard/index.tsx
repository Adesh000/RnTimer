import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, TimerCardProps } from '../../utils';
import { ProgressBar } from '../progressBar';
import { CustomButton } from '../button';

const TimerCard: FC<TimerCardProps> = ({
  timer,
  onStart,
  onPause,
  onReset,
}) => {
  const progress = timer.remainingTime / timer.duration;

  return (
    <View style={styles.timerCard}>
      <Text style={styles.timerName}>{timer.name}</Text>

      <View style={styles.timerDetails}>
        <Text style={styles.timerTime}>{formatTime(timer.remainingTime)}</Text>
        <Text
          style={[
            styles.timerStatus,
            {
              color:
                timer.status === 'Running'
                  ? '#4CAF50'
                  : timer.status === 'Paused'
                  ? '#FFC107'
                  : '#F44336',
            },
          ]}
        >
          {timer.status}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
        <Text style={styles.percentageText}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.controls}>
        {timer.status !== 'Completed' && (
          <>
            <CustomButton
              title="Start"
              onPress={onStart}
              bgColor={timer.status === 'Running' ? '#666' : '#4CAF50'}
              disabled={timer.status === 'Running'}
            />
            <CustomButton
              title="Pause"
              onPress={onPause}
              bgColor={timer.status === 'Paused' ? '#666' : '#FFC107'}
              disabled={timer.status === 'Paused'}
            />
          </>
        )}
        <CustomButton title="Reset" onPress={onReset} bgColor="#F44336" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timersContainer: {
    padding: 10,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default React.memo(TimerCard);
