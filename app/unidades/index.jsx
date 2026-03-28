import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SidebarLayout from '../../src/components/SidebarLayout';
import { unidadesService } from '../../src/services/unidades';

export default function UnidadesScreen() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  // create
  const [createVisible, setCreateVisible] = useState(false);
  const [createForm, setCreateForm] = useState({ nome: '', endereco: '', capacidade_maxima: '' });
  const [creating, setCreating] = useState(false);

  // edit/remove
  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', endereco: '', capacidade_maxima: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchUnidades() {
    try {
      setLoading(true);
      const { data } = await unidadesService.listar();
      setUnidades(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as unidades');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUnidades(); }, []);

  // create
  async function handleCreate() {
    if (!createForm.nome.trim()) {
      Alert.alert('Atenção', 'O nome da unidade é obrigatório');
      return;
    }
    try {
      setCreating(true);
      await unidadesService.criar({
        nome: createForm.nome.trim(),
        endereco: createForm.endereco.trim() || null,
        capacidade_maxima: parseInt(createForm.capacidade_maxima) || 0,
      });
      setCreateVisible(false);
      fetchUnidades();
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível criar a unidade');
    } finally {
      setCreating(false);
    }
  }

  // edit
  function openEdit(unidade) {
    setSelected(unidade);
    setEditForm({
      nome: unidade.nome,
      endereco: unidade.endereco ?? '',
      capacidade_maxima: String(unidade.capacidade_maxima),
    });
    setEditVisible(true);
  }

  async function handleSave() {
    if (!editForm.nome.trim()) {
      Alert.alert('Atenção', 'O nome da unidade é obrigatório');
      return;
    }
    try {
      setSaving(true);
      await unidadesService.atualizar(selected.id, {
        nome: editForm.nome.trim(),
        endereco: editForm.endereco.trim() || null,
        capacidade_maxima: parseInt(editForm.capacidade_maxima) || 0,
      });
      setEditVisible(false);
      fetchUnidades();
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  }

  // delete
  function handleDelete() {
    Alert.alert(
      'Excluir unidade',
      `Tem certeza que deseja excluir "${selected?.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await unidadesService.deletar(selected.id);
              setEditVisible(false);
              fetchUnidades();
            } catch (err) {
              Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível excluir');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  function renderUnidade({ item }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.7}>
        <View style={styles.cardLeft}>
          <View style={styles.cardIcon}>
            <Feather name="map-pin" size={16} color="#FACC15" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardNome}>{item.nome}</Text>
            {item.endereco ? <Text style={styles.cardEndereco}>{item.endereco}</Text> : null}
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.capacidadeBadge}>
            <Feather name="users" size={11} color="#6B7280" />
            <Text style={styles.capacidadeText}>{item.capacidade_maxima}</Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'ativo' ? styles.statusAtivo : styles.statusInativo]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SidebarLayout title="Gerenciar Unidades">
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FACC15" />
          </View>
        ) : (
          <FlatList
            data={unidades}
            keyExtractor={(item) => item.id}
            renderItem={renderUnidade}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="map-pin" size={48} color="#1F2937" />
                <Text style={styles.emptyTitle}>Nenhuma unidade cadastrada</Text>
                <Text style={styles.emptySubtitle}>Adicione a primeira unidade clicando no botão abaixo</Text>
              </View>
            }
            contentContainerStyle={unidades.length === 0 ? styles.flatListEmpty : styles.flatList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity style={styles.fab} onPress={() => { setCreateForm({ nome: '', endereco: '', capacidade_maxima: '' }); setCreateVisible(true); }}>
          <Feather name="plus" size={22} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Modal — create */}
      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Unidade</Text>
              <TouchableOpacity onPress={() => setCreateVisible(false)}>
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FormFields form={createForm} setForm={setCreateForm} />
            <TouchableOpacity style={[styles.saveButton, creating && styles.buttonDisabled]} onPress={handleCreate} disabled={creating}>
              {creating ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveButtonText}>Criar unidade</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* modal - edit/remove */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Unidade</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FormFields form={editForm} setForm={setEditForm} />
            <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveButtonText}>Salvar alterações</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.deleteButton, deleting && styles.buttonDisabled]} onPress={handleDelete} disabled={deleting}>
              {deleting ? <ActivityIndicator size="small" color="#EF4444" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="trash-2" size={15} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Excluir unidade</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SidebarLayout>
  );
}

function FormFields({ form, setForm }) {
  return (
    <>
      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Unidade Centro"
        placeholderTextColor="#374151"
        value={form.nome}
        onChangeText={(v) => setForm((p) => ({ ...p, nome: v }))}
      />
      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Rua das Flores, 123"
        placeholderTextColor="#374151"
        value={form.endereco}
        onChangeText={(v) => setForm((p) => ({ ...p, endereco: v }))}
      />
      <Text style={styles.label}>Capacidade máxima</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 30"
        placeholderTextColor="#374151"
        value={form.capacidade_maxima}
        onChangeText={(v) => setForm((p) => ({ ...p, capacidade_maxima: v }))}
        keyboardType="numeric"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flatList: { padding: 16 },
  flatListEmpty: { flex: 1 },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  cardNome: { color: '#F9FAFB', fontSize: 14, fontWeight: '600' },
  cardEndereco: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  capacidadeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacidadeText: { color: '#6B7280', fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusAtivo: { backgroundColor: '#052e16' },
  statusInativo: { backgroundColor: '#1c1917' },
  statusText: { color: '#6B7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { color: '#374151', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { color: '#1F2937', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FACC15', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FACC15', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '700' },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#111827', borderRadius: 8, padding: 12, color: '#F9FAFB', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  saveButton: { backgroundColor: '#FACC15', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#000000', fontWeight: '700', fontSize: 15 },
  deleteButton: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#374151' },
  deleteButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  buttonDisabled: { opacity: 0.6 },
});
