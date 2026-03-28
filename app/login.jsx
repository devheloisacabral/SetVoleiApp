import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      console.log('Tentando login em:', process.env.EXPO_PUBLIC_API_URL);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      console.log('Erro login:', JSON.stringify(err?.response?.data ?? err?.message ?? err));
      Alert.alert('Erro', err?.response?.data?.message ?? err?.message ?? 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SetVôlei</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        {/* todo: colocar um loading de verdade aqui dps */}
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>Não tem conta? Solicitar cadastro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#1565C0', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#1565C0', fontSize: 15 },
});
