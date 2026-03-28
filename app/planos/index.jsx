import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SidebarLayout from '../../src/components/SidebarLayout';
import FeedbackModal from '../../src/components/FeedbackModal';
import { planosService } from '../../src/services/planos';

const EMPTY_FORM = { nome: '', valor: '', numero_checkins_mensais: '' };
const EMPTY_ERRORS = { nome: '', valor: '', numero_checkins_mensais: '' };

function validate(form) {
  const errors = { ...EMPTY_ERRORS };
  if (!form.nome.trim()) errors.nome = 'O nome é obrigatório';
  if (!form.valor.trim()) {
    errors.valor = 'O valor é obrigatório';
  } else if (isNaN(parseFloat(form.valor.replace(',', '.'))) || parseFloat(form.valor.replace(',', '.')) <= 0) {
    errors.valor = 'Deve ser um valor maior que zero';
  }
  if (!form.numero_checkins_mensais.trim()) {
    errors.numero_checkins_mensais = 'A quantidade de check-ins é obrigatória';
  } else if (isNaN(parseInt(form.numero_checkins_mensais)) || parseInt(form.numero_checkins_mensais) <= 0) {
    errors.numero_checkins_mensais = 'Deve ser um número maior que zero';
  }
  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export default function PlanosScreen() {
  const [planos, setPlanos] = useState([]);
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

  async function fetchPlanos() {
    try {
      setLoading(true);
      const { data } = await planosService.listar();
      setPlanos(data);
    } catch {
      showFeedback('error', 'Não foi possível carregar os planos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPlanos(); }, []);

  async function handleCreate() {
    const errors = validate(createForm);
    setCreateErrors(errors);
    if (hasErrors(errors)) return;

    try {
      setCreating(true);
      await planosService.criar({
        nome: createForm.nome.trim(),
        valor: parseFloat(createForm.valor.replace(',', '.')),
        numero_checkins_mensais: parseInt(createForm.numero_checkins_mensais),
      });
      setCreateVisible(false);
      fetchPlanos();
    } catch (err) {
      showFeedback('error', err?.response?.data?.message ?? 'Não foi possível criar o plano.');
    } finally {
      setCreating(false);
    }
  }

  function openEdit(plano) {
    setSelected(plano);
    setEditForm({
      nome: plano.nome,
      valor: String(plano.valor).replace('.', ','),
      numero_checkins_mensais: String(plano.numero_checkins_mensais),
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
      await planosService.atualizar(selected.id, {
        nome: editForm.nome.trim(),
        valor: parseFloat(editForm.valor.replace(',', '.')),
        numero_checkins_mensais: parseInt(editForm.numero_checkins_mensais),
      });
      setEditVisible(false);
      fetchPlanos();
    } catch (err) {
      showFeedback('error', err?.response?.data?.message ?? 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await planosService.inativar(selected.id);
      setEditVisible(false);
      fetchPlanos();
      showFeedback('success', `Plano "${selected.nome}" excluído com sucesso.`);
    } catch (err) {
      showFeedback('error', err?.response?.data?.message ?? 'Não foi possível inativar o plano.');
    } finally {
      setDeleting(false);
    }
  }

  function renderPlano({ item, index }) {
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
          <View style={styles.cardValor}>
            <Text style={styles.cardValorText}>R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Feather name="check-circle" size={11} color="#4B5563" />
              <Text style={styles.metaText}>{item.numero_checkins_mensais} check-ins/mês</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color="#374151" style={styles.cardChevron} />
      </TouchableOpacity>
    );
  }

  return (
    <SidebarLayout title="Planos">
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Gerenciar Planos</Text>
          <Text style={styles.screenSubtitle}>
            {planos.length} plano{planos.length !== 1 ? 's' : ''} cadastrado{planos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FACC15" />
          </View>
        ) : (
          <FlatList
            data={planos}
            keyExtractor={(item) => item.id}
            renderItem={renderPlano}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Feather name="clipboard" size={28} color="#374151" />
                </View>
                <Text style={styles.emptyTitle}>Nenhum plano cadastrado</Text>
                <Text style={styles.emptySubtitle}>Adicione o primeiro plano clicando no botão abaixo</Text>
              </View>
            }
            contentContainerStyle={planos.length === 0 ? styles.flatListEmpty : styles.flatList}
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
              <Text style={styles.modalTitle}>Novo Plano</Text>
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
                : <Text style={styles.primaryButtonText}>Criar plano</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Plano</Text>
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
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#EF4444" />
                : (
                  <View style={styles.dangerButtonInner}>
                    <Feather name="slash" size={14} color="#EF4444" />
                    <Text style={styles.dangerButtonText}>Excluir plano</Text>
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
        placeholder="Ex: Plano Mensal"
        placeholderTextColor="#374151"
        value={form.nome}
        onChangeText={(v) => { setForm((p) => ({ ...p, nome: v })); clearError('nome'); }}
      />
      {errors.nome ? <Text style={styles.errorText}>{errors.nome}</Text> : null}

      <Text style={styles.label}>Valor (R$) *</Text>
      <TextInput
        style={[styles.input, errors.valor ? styles.inputError : null]}
        placeholder="Ex: 150,00"
        placeholderTextColor="#374151"
        value={form.valor}
        onChangeText={(v) => { setForm((p) => ({ ...p, valor: v })); clearError('valor'); }}
        keyboardType="decimal-pad"
      />
      {errors.valor ? <Text style={styles.errorText}>{errors.valor}</Text> : null}

      <Text style={styles.label}>Check-ins mensais *</Text>
      <TextInput
        style={[styles.input, errors.numero_checkins_mensais ? styles.inputError : null]}
        placeholder="Ex: 12"
        placeholderTextColor="#374151"
        value={form.numero_checkins_mensais}
        onChangeText={(v) => { setForm((p) => ({ ...p, numero_checkins_mensais: v })); clearError('numero_checkins_mensais'); }}
        keyboardType="numeric"
      />
      {errors.numero_checkins_mensais ? <Text style={styles.errorText}>{errors.numero_checkins_mensais}</Text> : null}
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
  cardNome: { color: '#F9FAFB', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  cardValor: { marginBottom: 10 },
  cardValorText: { color: '#FACC15', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
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
