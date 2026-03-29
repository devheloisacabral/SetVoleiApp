import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function FeedbackModal({ visible, type = 'success', message, onClose }) {
  const isSuccess = type === 'success';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, isSuccess ? styles.iconSuccess : styles.iconError]}>
            <Feather name={isSuccess ? 'check' : 'alert-circle'} size={28} color={isSuccess ? '#000' : '#fff'} />
          </View>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={[styles.button, isSuccess ? styles.buttonSuccess : styles.buttonError]} onPress={onClose}>
            <Text style={[styles.buttonText, isSuccess ? styles.buttonTextSuccess : styles.buttonTextError]}>
              {isSuccess ? 'Continuar' : 'Fechar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  container: {
    backgroundColor: '#0D0D0D',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconSuccess: { backgroundColor: '#FACC15' },
  iconError: { backgroundColor: '#EF4444' },
  title: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSuccess: { backgroundColor: '#FACC15' },
  buttonError: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#1F2937' },
  buttonText: { fontWeight: '700', fontSize: 15 },
  buttonTextSuccess: { color: '#000000' },
  buttonTextError: { color: '#EF4444' },
});
