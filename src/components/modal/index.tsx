import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CompletionModal = ({ completedTimer, setCompletedTimer }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={completedTimer !== null}
    onRequestClose={() => setCompletedTimer(null)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.modalMessage}>You've completed your timer:</Text>
          <Text style={styles.timerNameText}>{completedTimer?.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => setCompletedTimer(null)}
        >
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  timerNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
