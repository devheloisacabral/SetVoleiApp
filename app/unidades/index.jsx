import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SidebarLayout from '../../src/components/SidebarLayout';
import FeedbackModal from '../../src/components/FeedbackModal';
import { unidadesService } from '../../src/services/unidades';

const EMPTY_FORM = { nome: '', endereco: '', capacidade_maxima: '' };
const EMPTY_ERRORS = { nome: '', endereco: '', capacidade_maxima: '' };

function validate(form) {
  const errors = { ...EMPTY_ERRORS };
  if (!form.nome.trim()) errors.nome = 'O nome é obrigatório';
  if (!form.endereco.trim()) errors.endereco = 'O endereço é obrigatório';
  if (!form.capacidade_maxima.trim()) {
    errors.capacidade_maxima = 'A capacidade é obrigatória';
  } else if (isNaN(parseInt(form.capacidade_maxima)) || parseInt(form.capacidade_maxima) <= 0) {
    errors.capacidade_maxima = 'Deve ser um número maior que zero';
  }
  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export default function UnidadesScreen() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createVisible, setCreateVisible] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createErrors, setCreateErrors] = useState(EMPTY_ERRORS);
  const [creating, setCreating] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState(EMPTY_ERRORS);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [feedback, setFeedback] = useState({ visible: false, type: 'success', message: '' });

  function showFeedback(type, message) {
    setFeedback({ visible: true, type, message });
  }

  async function fetchUnidades() {
    try {
      setLoading(true);
      const { data } = await unidadesService.listar();
      setUnidades(data);
    } catch {
      showFeedback('error', 'Não foi possível carregar as unidades.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUnidades(); }, []);

  async function handleCreate() {
    const errors = validate(createForm);
    setCreateErrors(errors);
    if (hasErrors(errors)) return;

    try {
      setCreating(true);
      await unidadesService.criar({
        nome: createForm.nome.trim(),
        endereco: createForm.endereco.trim() || null,
        capacidade_maxima: parseInt(createForm.capacidade_maxima) || 0,
      });
      setCreateVisible(false);
      fetchUnidades();
      showFeedback('success', `Unidade "${createForm.nome.trim()}" criada com sucesso.`);
    } catch (err) {
      showFeedback('error', err?.response?.data?.message ?? 'Não foi possível criar a unidade.');
    } finally {
      setCreating(false);
    }
  }

  function openEdit(unidade) {
    setSelected(unidade);
    setEditForm({
      nome: unidade.nome,
      endereco: unidade.endereco ?? '',
      capacidade_maxima: String(unidade.capacidade_maxima),
    });
    setEditErrors(EMPTY_ERRORS);
    setEditVisible(true);
  }

  async function handleSave() {
    const errors = validate(editForm);
    setEditErrors(errors);
    if (hasErrors(errors)) return;

    try {
      setSaving(true);
      await unidadesService.atualizar(selected.id, {
        nome: editForm.nome.trim(),
        endereco: editForm.endereco.trim() || null,
        capacidade_maxima: parseInt(editForm.capacidade_maxima) || 0,
      });
      setEditVisible(false);
      fetchUnidades();
      showFeedback('success', `Unidade "${editForm.nome.trim()}" atualizada com sucesso.`);
    } catch (err) {
      showFeedback('error', err?.response?.data?.message ?? 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await unidadesService.deletar(selected.id);
      setEditVisible(false);
      fetchUnidades();
      showFeedback('success', `Unidade "${selected.nome}" excluída com sucesso.`);
    } catch (err) {
      showFeedback('error', err?.response?.data?.message ?? 'Não foi possível excluir a unidade.');
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    setEditVisible(false);
    setTimeout(() => {
      handleDelete();
    }, 300);
  }

  function renderUnidade({ item, index }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.75}>
        <View style={styles.cardAccent} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardIndex}>#{String(index + 1).padStart(2, '0')}</Text>
            <View style={[styles.statusPill, item.status === 'ativo' ? styles.pillAtivo : styles.pillInativo]}>
              <View style={[styles.statusDot, item.status === 'ativo' ? styles.dotAtivo : styles.dotInativo]} />
              <Text style={styles.statusPillText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <View style={styles.cardMeta}>
            {item.endereco ? (
              <View style={styles.metaItem}>
                <Feather name="map-pin" size={11} color="#4B5563" />
                <Text style={styles.metaText}>{item.endereco}</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Feather name="users" size={11} color="#4B5563" />
              <Text style={styles.metaText}>{item.capacidade_maxima} vagas</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color="#374151" style={styles.cardChevron} />
      </TouchableOpacity>
    );
  }

  return (
    <SidebarLayout title="Unidades">
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Gerenciar Unidades</Text>
          <Text style={styles.screenSubtitle}>
            {unidades.length} unidade{unidades.length !== 1 ? 's' : ''} cadastrada{unidades.length !== 1 ? 's' : ''}
          </Text>
        </View>

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
                <View style={styles.emptyIcon}>
                  <Feather name="map-pin" size={28} color="#374151" />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma unidade</Text>
                <Text style={styles.emptySubtitle}>Adicione a primeira unidade clicando no botão abaixo</Text>
              </View>
            }
            contentContainerStyle={unidades.length === 0 ? styles.flatListEmpty : styles.flatList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => { setCreateForm(EMPTY_FORM); setCreateErrors(EMPTY_ERRORS); setCreateVisible(true); }}
        >
          <Feather name="plus" size={22} color="#000000" />
        </TouchableOpacity>
      </View>

      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Unidade</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setCreateVisible(false)}>
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <FormFields form={createForm} setForm={setCreateForm} errors={createErrors} setErrors={setCreateErrors} />
            <TouchableOpacity
              style={[styles.primaryButton, creating && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={styles.primaryButtonText}>Criar unidade</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Unidade</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setEditVisible(false)}>
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <FormFields form={editForm} setForm={setEditForm} errors={editErrors} setErrors={setEditErrors} />
            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={styles.primaryButtonText}>Salvar alterações</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dangerButton, deleting && styles.buttonDisabled]}
              onPress={confirmDelete}
              disabled={deleting}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#EF4444" />
                : (
                  <View style={styles.dangerButtonInner}>
                    <Feather name="trash-2" size={14} color="#EF4444" />
                    <Text style={styles.dangerButtonText}>Excluir unidade</Text>
                  </View>
                )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <FeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback((p) => ({ ...p, visible: false }))}
      />
    </SidebarLayout>
  );
}

function FormFields({ form, setForm, errors, setErrors }) {
  function clearError(field) {
    setErrors((p) => ({ ...p, [field]: '' }));
  }

  return (
    <>
      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={[styles.input, errors.nome ? styles.inputError : null]}
        placeholder="Ex: Unidade Centro"
        placeholderTextColor="#374151"
        value={form.nome}
        onChangeText={(v) => { setForm((p) => ({ ...p, nome: v })); clearError('nome'); }}
      />
      {errors.nome ? <Text style={styles.errorText}>{errors.nome}</Text> : null}

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={[styles.input, errors.endereco ? styles.inputError : null]}
        placeholder="Ex: Rua das Flores, 123"
        placeholderTextColor="#374151"
        value={form.endereco}
        onChangeText={(v) => { setForm((p) => ({ ...p, endereco: v })); clearError('endereco'); }}
      />
      {errors.endereco ? <Text style={styles.errorText}>{errors.endereco}</Text> : null}

      <Text style={styles.label}>Capacidade máxima</Text>
      <TextInput
        style={[styles.input, errors.capacidade_maxima ? styles.inputError : null]}
        placeholder="Ex: 30"
        placeholderTextColor="#374151"
        value={form.capacidade_maxima}
        onChangeText={(v) => { setForm((p) => ({ ...p, capacidade_maxima: v })); clearError('capacidade_maxima'); }}
        keyboardType="numeric"
      />
      {errors.capacidade_maxima ? <Text style={styles.errorText}>{errors.capacidade_maxima}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#111111' },
  screenTitle: { color: '#F9FAFB', fontSize: 20, fontWeight: '700' },
  screenSubtitle: { color: '#4B5563', fontSize: 13, marginTop: 2 },
  flatList: { padding: 16, paddingBottom: 100 },
  flatListEmpty: { flex: 1 },
  card: { backgroundColor: '#0D0D0D', borderRadius: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#1a1a1a' },
  cardAccent: { width: 3, alignSelf: 'stretch', backgroundColor: '#FACC15' },
  cardBody: { flex: 1, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardIndex: { color: '#374151', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  cardNome: { color: '#F9FAFB', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#4B5563', fontSize: 12 },
  cardChevron: { marginRight: 14 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillAtivo: { backgroundColor: '#052e16' },
  pillInativo: { backgroundColor: '#1c1917' },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  dotAtivo: { backgroundColor: '#22c55e' },
  dotInativo: { backgroundColor: '#6B7280' },
  statusPillText: { color: '#6B7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  emptyTitle: { color: '#374151', fontSize: 16, fontWeight: '600' },
  emptySubtitle: { color: '#1F2937', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: '#FACC15', alignItems: 'center', justifyContent: 'center', shadowColor: '#FACC15', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContainer: { backgroundColor: '#0D0D0D', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44, borderTopWidth: 1, borderColor: '#1a1a1a' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#1F2937', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '700' },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#4B5563', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { backgroundColor: '#111111', borderRadius: 10, padding: 13, color: '#F9FAFB', fontSize: 14, marginBottom: 4, borderWidth: 1, borderColor: '#1F2937' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 12, marginTop: 2 },
  primaryButton: { backgroundColor: '#FACC15', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#000000', fontWeight: '700', fontSize: 15 },
  dangerButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#1F2937' },
  dangerButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dangerButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  buttonDisabled: { opacity: 0.5 },
});
