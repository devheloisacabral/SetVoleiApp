import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import api from '../src/services/api';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    data_nascimento: '',
  });
  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function formatCpf(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }

  function formatDate(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 10);
  }

  function toIsoDate(ddmmaaaa) {
    const [day, month, year] = ddmmaaaa.split('/');
    return `${year}-${month}-${day}`;
  }

  async function handleRegister() {
    if (!form.nome || !form.email || !form.cpf || !form.data_nascimento) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    if (form.data_nascimento.length < 10) {
      Alert.alert('Atenção', 'Data de nascimento inválida');
      return;
    }

    try {
      setLoading(true);
      await api.post('/atletas/pre-cadastro', {
        nome: form.nome,
        email: form.email,
        cpf: form.cpf.replace(/\D/g, ''),
        data_nascimento: toIsoDate(form.data_nascimento),
      });

      Alert.alert(
        'Solicitação enviada',
        'Seu cadastro foi recebido e está aguardando aprovação.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err) {
      console.log('Register error:', JSON.stringify(err?.response?.data ?? err?.message));
      Alert.alert(
        'Erro',
        err?.response?.data?.message ?? 'Não foi possível realizar o cadastro'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Criar conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={form.nome}
        onChangeText={(v) => handleChange('nome', v)}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(v) => handleChange('email', v)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={form.cpf}
        onChangeText={(v) => handleChange('cpf', formatCpf(v))}
        keyboardType="numeric"
        maxLength={14}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de nascimento (DD/MM/AAAA)"
        value={form.data_nascimento}
        onChangeText={(v) => handleChange('data_nascimento', formatDate(v))}
        keyboardType="numeric"
        maxLength={10}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Solicitar cadastro'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.replace('/login')}>
        <Text style={styles.linkText}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1565C0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#1565C0',
    fontSize: 15,
  },
});
