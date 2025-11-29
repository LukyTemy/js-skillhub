<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseService } from '@/composables/useCourseService';
import type { Course, Lesson } from '@/model/Course';

const route = useRoute();
const router = useRouter();
const { getCourseById } = useCourseService();

const course = ref<Course | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const courseId = route.params.id as string;

  try {
    const data = await getCourseById(courseId);
    course.value = data;
  } catch (e: any) {
    console.error("Failed to load course", e);
    error.value = "Kurz se nepodařilo načíst.";
  } finally {
    loading.value = false;
  }
});

function getLessonContentTypes(lesson: Lesson) {
  if (!lesson.content || !Array.isArray(lesson.content)) {
    return [];
  }
  const types = new Set(
      lesson.content
          .filter(c => c && c.type)
          .map(c => c.type)
  );
  return Array.from(types).sort();
}

function goBack() {
  router.push({ name: 'courses' });
}
</script>

<template>
  <main class="course-detail">
    <div v-if="loading" class="loading-state">
      Načítám kurz...
    </div>

    <div v-else-if="error" class="error-state">
      <div class="alert alert-error">
        {{ error }}
      </div>
      <button class="btn btn-secondary" @click="goBack">Zpět na seznam</button>
    </div>

    <div v-else-if="course" class="content-wrapper">

      <header class="course-header">
        <div class="header-content">
          <div class="badges">
            <span class="badge category">{{ course.category }}</span>
          </div>
          <h1>{{ course.title }}</h1>
          <div class="meta">
            <span>Počet lekcí: {{ course.lessons?.length || 0 }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="goBack">Zpět</button>
        </div>
      </header>

      <div class="course-content">

        <section class="card description-card">
          <h2>O kurzu</h2>
          <p class="description-text">{{ course.description }}</p>
        </section>

        <section class="card syllabus-card">
          <h2>Osnova kurzu</h2>

          <div v-if="!course.lessons || course.lessons.length === 0" class="empty-lessons">
            Tento kurz zatím nemá žádné lekce.
          </div>

          <div v-else class="lessons-list">
            <div v-for="(lesson, index) in course.lessons" :key="index" class="lesson-wrapper">

              <router-link
                  v-if="lesson.lessonId"
                  :to="{ name: 'lesson-detail', params: { id: course._id, lessonId: lesson.lessonId }}"
                  class="lesson-item"
              >
                <div class="lesson-info">
                  <span class="lesson-number">{{ index + 1 }}</span>
                  <div class="title-wrapper">
                    <span class="lesson-title">{{ lesson.title }}</span>
                  </div>
                </div>

                <div class="lesson-meta">
                  <div class="content-icons">
                    <span v-if="getLessonContentTypes(lesson).includes('text')" title="Text" class="icon">📄</span>
                    <span v-if="getLessonContentTypes(lesson).includes('code')" title="Kód" class="icon">💻</span>
                    <span v-if="getLessonContentTypes(lesson).includes('video')" title="Video" class="icon">▶️</span>
                  </div>
                  <span class="arrow">→</span>
                </div>
              </router-link>

              <div v-else class="lesson-item disabled">
                <div class="lesson-info">
                  <span class="lesson-number">{{ index + 1 }}</span>
                  <span class="lesson-title">{{ lesson.title }} (Chybná data)</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.course-detail {
  max-width: 900px; /* Zúžil jsem to z 1100px, aby text popisu nebyl příliš roztažený a lépe se četl */
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading-state, .error-state { text-align: center; padding: 4rem; color: #64748b; }

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.5rem;
}

.header-content h1 { margin: 0.5rem 0; font-size: 2rem; color: #0f172a; }
.badges { margin-bottom: 0.5rem; }
.badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.badge.category { background: #e0e7ff; color: #4338ca; }
.meta { color: #64748b; font-size: 0.95rem; }

/* --- ZMĚNA LAYOUTU --- */
.course-content {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* Mezera mezi popisem a osnovou */
}

/* Karty */
.card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem; /* Více paddingu vypadá lépe v single-column */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

h2 {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1f2937;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.75rem;
}

.description-text {
  line-height: 1.8;
  color: #334155;
  white-space: pre-line;
  font-size: 1.05rem; /* Trochu větší písmo pro lepší čitelnost */
}

/* Syllabus Styles - Upraveno pro širší zobrazení */
.lessons-list { display: flex; flex-direction: column; }

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1rem; /* Větší vertikální padding */
  border-bottom: 1px solid #f1f5f9;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border-radius: 8px; /* Jemné zaoblení při hoveru */
}

.lesson-item:last-child { border-bottom: none; }
.lesson-item:hover { background-color: #f8fafc; transform: translateX(5px); } /* Efekt posunu doprava */

.lesson-info { display: flex; align-items: center; gap: 1.5rem; flex: 1; }

.lesson-number {
  background: #f1f5f9;
  color: #64748b;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: 700;
}

.lesson-title { font-weight: 600; color: #334155; font-size: 1.05rem; }
.lesson-item:hover .lesson-title { color: #4f46e5; }

.lesson-meta { display: flex; align-items: center; gap: 1.5rem; }
.content-icons { display: flex; gap: 0.5rem; opacity: 0.6; }
.arrow { color: #cbd5e1; font-weight: bold; }

.btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.btn-secondary { background: white; border-color: #d1d5db; color: #374151; }
.btn-secondary:hover { background: #f3f4f6; }
.alert-error { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
.lesson-item.disabled { opacity: 0.5; cursor: not-allowed; background: #fef2f2; }
.lesson-item.disabled .lesson-title { color: #ef4444; }
</style>