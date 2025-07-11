import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const CustomButton = ({ title, onPress, bgColor, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.categoryControlButton, { backgroundColor: bgColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.categoryControlText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryControlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  categoryControlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
