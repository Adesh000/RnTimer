import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS, Timer } from '../utils';
import { FormInput } from '../components';

const TimerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');

  const resetForm = () => {
    setName('');
    setDuration('');
    setCategory('');
  };

  const saveTimer = async () => {
    try {
      if (!name || !duration || !category) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const newTimer: Timer = {
        id: Date.now().toString(),
        name,
        duration: parseInt(duration, 10),
        category,
        createdAt: Date.now(),
      };

      const existingTimersJSON = await AsyncStorage.getItem(KEYS.STORAGE_KEY);
      const existingTimers: Timer[] = existingTimersJSON
        ? JSON.parse(existingTimersJSON)
        : [];

      const updatedTimers = [...existingTimers, newTimer];
      await AsyncStorage.setItem(
        KEYS.STORAGE_KEY,
        JSON.stringify(updatedTimers),
      );
      resetForm();
      Alert.alert('Success', 'Timer saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving timer:', error);
      Alert.alert('Error', 'Failed to save timer');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <FormInput
          title="Timer Name"
          value={name}
          setValue={setName}
          placeholder="Enter timer name"
        />
        <FormInput
          title="Timer Name"
          value={duration}
          setValue={setDuration}
          placeholder="Enter duration in seconds"
        />
        <FormInput
          title="Category"
          value={category}
          setValue={setCategory}
          placeholder="Enter category"
        />

        <TouchableOpacity style={styles.button} onPress={saveTimer}>
          <Text style={styles.buttonText}>Save Timer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimerScreen;
