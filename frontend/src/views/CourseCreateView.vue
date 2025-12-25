<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useCourseService, type NewCoursePayload } from '@/composables/useCourseService';

interface QuestionDraft {
  text: string;
  options: string[];
  correctOptionIndex: number;
}

interface ContentDraft {
  type: 'text' | 'code' | 'video' | 'quiz';
  text?: string;
  code?: string;
  language?: string;
  url?: string;
  questions?: QuestionDraft[];
  minPassPercent?: number;
}

interface LessonDraft {
  title: string;
  content: ContentDraft[];
}

const router = useRouter();
const auth = useAuth();
const { createCourse } = useCourseService();

const title = ref('');
const description = ref('');
const category = ref('');
const lessons = ref<LessonDraft[]>([]);

const submitting = ref(false);
const submitError = ref<string | null>(null);

const fieldErrors = ref<Record<string, string | null>>({
  title: null,
  description: null,
  category: null,
});

const isInstructor = computed(() => auth.isInstructor ? auth.isInstructor() : false);

const isValid = computed(() => {
  const basicInfoValid = !!title.value && title.value.length >= 2 &&
      !!description.value && description.value.length >= 10 &&
      !!category.value && category.value.length >= 2;

  const lessonsValid = lessons.value.every(l => {
    const titleValid = l.title.length >= 2;
    const contentValid = l.content.every(c => {
      if (c.type === 'quiz') {
        return c.questions && c.questions.length > 0 && c.questions.every(q =>
            q.text.length > 0 && q.options.every(o => o.length > 0)
        );
      }
      return true;
    });
    return titleValid && contentValid;
  });

  return basicInfoValid && lessonsValid;
});

onMounted(async () => {
  await auth.init();
  if (!auth.state.authenticated || !isInstructor.value) {
    router.replace({ name: 'courses' });
  }
});

function addLesson() {
  lessons.value.push({
    title: '',
    content: []
  });
}

function removeLesson(index: number) {
  lessons.value.splice(index, 1);
}

function addContent(lessonIndex: number, type: 'text' | 'code' | 'video' | 'quiz') {
  const contentItem: ContentDraft = { type };
  if (type === 'text') contentItem.text = '';
  if (type === 'code') {
    contentItem.code = '';
    contentItem.language = 'javascript';
  }
  if (type === 'video') contentItem.url = '';
  if (type === 'quiz') {
    contentItem.questions = [];
    contentItem.minPassPercent = 50;
    addQuestionToDraft(contentItem);
  }

  lessons.value[lessonIndex].content.push(contentItem);
}

function removeContent(lessonIndex: number, contentIndex: number) {
  lessons.value[lessonIndex].content.splice(contentIndex, 1);
}

function moveLesson(index: number, direction: -1 | 1) {
  if ((direction === -1 && index === 0) || (direction === 1 && index === lessons.value.length - 1)) return;
  const temp = lessons.value[index];
  lessons.value[index] = lessons.value[index + direction];
  lessons.value[index + direction] = temp;
}

function addQuestionToDraft(content: ContentDraft) {
  if (!content.questions) content.questions = [];
  content.questions.push({
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  });
}

function removeQuestionFromDraft(content: ContentDraft, qIndex: number) {
  if (content.questions) {
    content.questions.splice(qIndex, 1);
  }
}

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
    const formattedLessons = lessons.value.map((l, index) => ({
      title: l.title,
      order: index,
      content: l.content.map(c => {
        if (c.type === 'text') return { type: 'text', text: c.text || '' };
        if (c.type === 'code') return { type: 'code', code: c.code || '', language: c.language || 'javascript' };
        if (c.type === 'video') return { type: 'video', url: c.url || '' };
        if (c.type === 'quiz') {
          return {
            type: 'quiz',
            minPassPercent: c.minPassPercent || 50,
            questions: c.questions?.map(q => ({
              text: q.text,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex
            })) || []
          };
        }
        return { type: 'text', text: '' };
      })
    }));

    const payload: NewCoursePayload = {
      title: title.value,
      description: description.value,
      category: category.value,
      lessons: formattedLessons,
    };

    await createCourse(payload);
    router.push({ name: 'courses' });
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
        <p class="subtitle">Vyplňte informace o kurzu a přidejte lekce.</p>
      </div>
      <button type="button" class="btn btn-secondary" @click="goBack">Zpět na kurzy</button>
    </header>

    <section v-if="submitError" class="alert alert-error">
      {{ submitError }}
    </section>

    <form class="form-layout" @submit.prevent="submit">
      <div class="card basic-info">
        <h2>Základní informace</h2>
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
              rows="4"
              placeholder="Stručně popište, o čem kurz je..."
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
              placeholder="Např. Frontend"
              :class="{ 'has-error': fieldErrors.category }"
          />
          <p v-if="fieldErrors.category" class="field-error">{{ fieldErrors.category }}</p>
        </div>
      </div>

      <div class="lessons-section">
        <div class="lessons-header">
          <h2>Obsah kurzu</h2>
          <button type="button" class="btn btn-outline" @click="addLesson">+ Přidat lekci</button>
        </div>

        <div v-if="lessons.length === 0" class="empty-state">
          Zatím jste nepřidali žádné lekce.
        </div>

        <div v-else class="lessons-list">
          <div v-for="(lesson, lIndex) in lessons" :key="lIndex" class="card lesson-card">
            <div class="lesson-header">
              <div class="lesson-title-input">
                <span class="lesson-number">{{ lIndex + 1 }}.</span>
                <input
                    v-model="lesson.title"
                    type="text"
                    placeholder="Název lekce (např. Instalace prostředí)"
                />
              </div>
              <div class="lesson-actions">
                <button type="button" class="icon-btn" @click="moveLesson(lIndex, -1)" :disabled="lIndex === 0">↑</button>
                <button type="button" class="icon-btn" @click="moveLesson(lIndex, 1)" :disabled="lIndex === lessons.length - 1">↓</button>
                <button type="button" class="icon-btn danger" @click="removeLesson(lIndex)">✕</button>
              </div>
            </div>

            <div class="lesson-content-list">
              <div v-for="(content, cIndex) in lesson.content" :key="cIndex" class="content-block">
                <div class="content-header">
                  <span class="badge" :class="content.type">{{ content.type.toUpperCase() }}</span>
                  <button type="button" class="text-btn danger" @click="removeContent(lIndex, cIndex)">Odstranit</button>
                </div>

                <div v-if="content.type === 'text'" class="content-body">
                  <textarea v-model="content.text" rows="3" placeholder="Sem napište text lekce..."></textarea>
                </div>

                <div v-if="content.type === 'code'" class="content-body code-inputs">
                  <input v-model="content.language" type="text" placeholder="Jazyk (js, python...)" class="lang-input" />
                  <textarea v-model="content.code" rows="3" placeholder="vložte kód..." class="code-area"></textarea>
                </div>

                <div v-if="content.type === 'video'" class="content-body">
                  <input v-model="content.url" type="text" placeholder="URL adresa videa (Vimeo, YouTube...)" />
                </div>

                <div v-if="content.type === 'quiz'" class="content-body quiz-editor">
                  <div class="form-group">
                    <label>Minimální úspěšnost pro splnění (%)</label>
                    <input type="number" v-model="content.minPassPercent" min="0" max="100" style="width: 100px;">
                  </div>

                  <div v-for="(question, qIndex) in content.questions" :key="qIndex" class="question-item">
                    <div class="question-header">
                      <span class="q-label">Otázka {{ qIndex + 1 }}</span>
                      <button type="button" class="text-btn danger" @click="removeQuestionFromDraft(content, qIndex)">Smazat otázku</button>
                    </div>

                    <input v-model="question.text" type="text" placeholder="Znění otázky..." class="question-input">

                    <div class="options-grid">
                      <div v-for="(opt, oIndex) in question.options" :key="oIndex" class="option-row">
                        <input
                            type="radio"
                            :name="'correct-' + lIndex + '-' + cIndex + '-' + qIndex"
                            :value="oIndex"
                            v-model="question.correctOptionIndex"
                            title="Označit jako správnou odpověď"
                        >
                        <input v-model="question.options[oIndex]" type="text" :placeholder="'Možnost ' + (oIndex + 1)">
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn-xs add-q-btn" @click="addQuestionToDraft(content)">+ Přidat další otázku</button>
                </div>
              </div>
            </div>

            <div class="add-content-actions">
              <span>Přidat obsah:</span>
              <button type="button" class="btn-xs" @click="addContent(lIndex, 'text')">Text</button>
              <button type="button" class="btn-xs" @click="addContent(lIndex, 'code')">Kód</button>
              <button type="button" class="btn-xs" @click="addContent(lIndex, 'video')">Video</button>
              <button type="button" class="btn-xs" @click="addContent(lIndex, 'quiz')">Test</button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions sticky-footer">
        <button type="button" class="btn btn-secondary" @click="goBack">Zrušit</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting || !isValid">
          <span v-if="submitting">Vytvářím kurz…</span>
          <span v-else>Vytvořit kompletní kurz</span>
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.course-create {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem 6rem 1rem;
}

.course-create__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.25rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.basic-info {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  margin-top: 0;
  color: #1f2937;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}

input,
textarea {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.15s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.has-error {
  border-color: #dc2626;
}

.field-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.lessons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  border: 2px dashed #e5e7eb;
  border-radius: 0.75rem;
  color: #9ca3af;
  background: #f9fafb;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lesson-card {
  padding: 0;
  overflow: hidden;
}

.lesson-header {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.lesson-title-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.lesson-number {
  font-weight: 700;
  color: #6b7280;
}

.lesson-actions {
  display: flex;
  gap: 0.25rem;
}

.lesson-content-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #fff;
}

.content-block {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fff;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.text { background: #e0f2fe; color: #0369a1; }
.badge.code { background: #f3e8ff; color: #7e22ce; }
.badge.video { background: #fce7f3; color: #be185d; }
.badge.quiz { background: #fef3c7; color: #b45309; }

.content-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.code-inputs .lang-input {
  max-width: 150px;
  margin-bottom: 0.5rem;
}

.code-area {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  background: #f8fafc;
}

.quiz-editor {
  background: #fffbeb;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fcd34d;
}

.question-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
}

.question-input {
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-row input[type="radio"] {
  width: auto;
  cursor: pointer;
}

.add-q-btn {
  width: 100%;
  margin-top: 0.5rem;
  background: white;
  border-style: dashed;
}

.add-content-actions {
  background: #f9fafb;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
}

.btn-xs {
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-xs:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #6b7280;
}

.icon-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #1f2937;
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.icon-btn.danger { color: #ef4444; }
.icon-btn.danger:hover { background: #fee2e2; }

.text-btn {
  font-size: 0.85rem;
  text-decoration: underline;
  color: #6b7280;
}
.text-btn.danger { color: #ef4444; }
.text-btn:hover { opacity: 0.8; }

.btn {
  border-radius: 9999px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);
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
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline {
  background: transparent;
  border: 1px dashed #6366f1;
  color: #4f46e5;
  width: 100%;
}

.btn-outline:hover {
  background: #eef2ff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-top: 1px solid #e5e7eb;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
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