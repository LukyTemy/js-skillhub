<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useCourseService, type NewCoursePayload } from '@/composables/useCourseService';

const router = useRouter();
const auth = useAuth();
const { createCourse } = useCourseService();

const title = ref('');
const description = ref('');
const category = ref('');

const submitting = ref(false);
const submitError = ref<string | null>(null);

const fieldErrors = ref<Record<string, string | null>>({
  title: null,
  description: null,
  category: null,
});

const isInstructor = computed(() => auth.isInstructor ? auth.isInstructor() : false);

const isValid = computed(() => {
  return !!title.value && title.value.length >= 2 &&
         !!description.value && description.value.length >= 10 &&
         !!category.value && category.value.length >= 2;
});

onMounted(async () => {
  await auth.init();
  if (!auth.state.authenticated || !isInstructor.value) {
    router.replace({ name: 'courses' });
  }
});

function validateFields() {
  fieldErrors.value.title = !title.value
    ? 'Název je povinný'
    : title.value.length < 2
      ? 'Název musí mít alespoň 2 znaky'
      : null;

  fieldErrors.value.description = !description.value
    ? 'Popis je povinný'
    : description.value.length < 10
      ? 'Popis musí mít alespoň 10 znaků'
      : null;

  fieldErrors.value.category = !category.value
    ? 'Kategorie je povinná'
    : category.value.length < 2
      ? 'Kategorie musí mít alespoň 2 znaky'
      : null;

  return !fieldErrors.value.title && !fieldErrors.value.description && !fieldErrors.value.category;
}

async function submit() {
  submitError.value = null;
  if (!validateFields()) {
    return;
  }

  submitting.value = true;
  try {
    const payload: NewCoursePayload = {
      title: title.value,
      description: description.value,
      category: category.value,
      lessons: [],
    };

    await createCourse(payload);
    router.push({ name: 'courses', query: { created: '1' } });
  } catch (e: any) {
    console.error('Failed to create course', e);
    submitError.value = e?.response?.data?.message || e.message || 'Nepodařilo se vytvořit kurz';
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push({ name: 'courses' });
}
</script>

<template>
  <main class="course-create">
    <header class="course-create__header">
      <div>
        <h1>Vytvořit nový kurz</h1>
        <p class="subtitle">Vyplňte základní informace o kurzu. Lekce můžete doplnit později.</p>
      </div>
      <button type="button" class="btn btn-secondary" @click="goBack">Zpět na kurzy</button>
    </header>

    <section v-if="submitError" class="alert alert-error">
      {{ submitError }}
    </section>

    <form class="card form" @submit.prevent="submit">
      <div class="form-group">
        <label for="title">Název kurzu</label>
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="Např. Úvod do TypeScriptu"
          :class="{ 'has-error': fieldErrors.title }"
        />
        <p v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</p>
      </div>

      <div class="form-group">
        <label for="description">Popis</label>
        <textarea
          id="description"
          v-model="description"
          rows="5"
          placeholder="Stručně popište, o čem kurz je a co se studenti naučí."
          :class="{ 'has-error': fieldErrors.description }"
        />
        <p v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</p>
      </div>

      <div class="form-group">
        <label for="category">Kategorie</label>
        <input
          id="category"
          v-model="category"
          type="text"
          placeholder="Např. Programování, Databáze, Frontend..."
          :class="{ 'has-error': fieldErrors.category }"
        />
        <p v-if="fieldErrors.category" class="field-error">{{ fieldErrors.category }}</p>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">Zrušit</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting || !isValid">
          <span v-if="submitting">Vytvářím kurz…</span>
          <span v-else>Vytvořit kurz</span>
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.course-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.course-create__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.25rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

input,
textarea {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.has-error {
  border-color: #dc2626;
}

.field-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  border-radius: 9999px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;
}

.btn-primary {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.5);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background: white;
  color: #111827;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
</style>

