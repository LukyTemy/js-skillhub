<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseService } from '@/composables/useCourseService';
import { useEnrollmentService } from '@/composables/useEnrollmentService';
import { useAuth } from '@/composables/useAuth';
import type { Course, Lesson } from '@/model/Course';

const route = useRoute();
const router = useRouter();
const { getCourseById } = useCourseService();
const { createEnrollment, getUserEnrollments, getCurrentBackendUser, updateEnrollmentStatus } = useEnrollmentService();
const auth = useAuth();

const course = ref<Course | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const currentUserBackend = ref<any>(null);
const enrollmentStatus = ref<'active' | 'completed' | 'cancelled' | null>(null);
const currentEnrollmentId = ref<string | null>(null);
const enrollmentLoading = ref(false);

const isStudent = computed(() => auth.hasRole('student'));

const canAccessContent = computed(() => {
  return (enrollmentStatus.value === 'active' || enrollmentStatus.value === 'completed') ||
      auth.hasRole('admin') ||
      auth.hasRole('instructor');
});

onMounted(async () => {
  const courseId = route.params.id as string;
  loading.value = true;

  try {
    course.value = await getCourseById(courseId);

    if (auth.state.authenticated) {
      currentUserBackend.value = await getCurrentBackendUser();

      if (currentUserBackend.value && currentUserBackend.value._id) {
        const enrollments = await getUserEnrollments(currentUserBackend.value._id);

        const existingEnrollment = enrollments.find((e: any) => e.courseId === courseId);

        if (existingEnrollment) {
          currentEnrollmentId.value = existingEnrollment._id;
          enrollmentStatus.value = existingEnrollment.status;
        }
      }
    }

  } catch (e: any) {
    console.error("Failed to load data", e);
    error.value = "Nepodařilo se načíst data kurzu.";
  } finally {
    loading.value = false;
  }
});

async function handleEnroll() {
  if (!currentUserBackend.value || !course.value) return;

  enrollmentLoading.value = true;
  try {
    const enrollment = await createEnrollment(course.value._id, currentUserBackend.value._id);
    currentEnrollmentId.value = enrollment._id;
    enrollmentStatus.value = 'active';
  } catch (e) {
    console.error("Enrollment failed", e);
    alert("Nepodařilo se zapsat do kurzu.");
  } finally {
    enrollmentLoading.value = false;
  }
}

async function handleUnenroll() {
  if (!currentEnrollmentId.value) return;

  if (!confirm("Opravdu se chcete odhlásit z kurzu?")) {
    return;
  }

  enrollmentLoading.value = true;
  try {
    await updateEnrollmentStatus(currentEnrollmentId.value, 'cancelled');
    enrollmentStatus.value = 'cancelled';
    alert("Byli jste úspěšně odhlášeni.");
  } catch (e) {
    console.error("Unenrollment failed", e);
    alert("Nepodařilo se odhlásit z kurzu.");
  } finally {
    enrollmentLoading.value = false;
  }
}

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
            <span v-if="enrollmentStatus === 'completed'" class="badge completed">Dokončeno 🏆</span>
            <span v-else-if="enrollmentStatus === 'active'" class="badge enrolled">Zapsáno ✅</span>
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

          <div v-if="isStudent" class="enrollment-cta">
            <hr>

            <div v-if="enrollmentStatus !== 'active' && enrollmentStatus !== 'completed'">
              <p>Pro přístup k lekcím se musíte zapsat do kurzu.</p>
              <button
                  class="btn btn-primary btn-large"
                  @click="handleEnroll"
                  :disabled="enrollmentLoading"
              >
                {{ enrollmentLoading ? 'Zapisuji...' : 'Zapsat se do kurzu' }}
              </button>
            </div>

            <div v-else-if="enrollmentStatus === 'completed'">
              <p class="enrolled-msg completed-text">Gratulujeme! Tento kurz jste úspěšně dokončili.</p>
            </div>

            <div v-else>
              <p class="enrolled-msg">Jste zapsáni v tomto kurzu.</p>
              <button
                  class="btn btn-danger btn-outline"
                  @click="handleUnenroll"
                  :disabled="enrollmentLoading"
              >
                {{ enrollmentLoading ? 'Odhlašuji...' : 'Odhlásit se z kurzu' }}
              </button>
            </div>
          </div>
        </section>

        <section class="card syllabus-card">
          <h2>Osnova kurzu</h2>

          <div v-if="!course.lessons || course.lessons.length === 0" class="empty-lessons">
            Tento kurz zatím nemá žádné lekce.
          </div>

          <div v-else class="lessons-list">
            <div v-for="(lesson, index) in course.lessons" :key="index" class="lesson-wrapper">

              <router-link
                  v-if="lesson.lessonId && canAccessContent"
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

              <div v-else class="lesson-item locked">
                <div class="lesson-info">
                  <span class="lesson-number">{{ index + 1 }}</span>
                  <div class="title-wrapper">
                    <span class="lesson-title">{{ lesson.title }}</span>
                  </div>
                </div>
                <div class="lesson-meta">
                  <span class="lock-icon">🔒</span>
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
  max-width: 900px;
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
.badges { margin-bottom: 0.5rem; display: flex; gap: 0.5rem; }
.badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.badge.category { background: #e0e7ff; color: #4338ca; }
.badge.enrolled { background: #dcfce7; color: #166534; }
.badge.completed { background: #fef08a; color: #854d0e; }
.meta { color: #64748b; font-size: 0.95rem; }

.course-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
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
  font-size: 1.05rem;
}

.enrollment-cta {
  margin-top: 2rem;
  text-align: center;
}
.enrollment-cta hr { border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
.enrollment-cta p { color: #64748b; margin-bottom: 1rem; }
.enrolled-msg { color: #166534; font-weight: 500; margin-bottom: 0.5rem; }
.completed-text { color: #854d0e; font-weight: 600; }

.btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.btn-secondary { background: white; border-color: #d1d5db; color: #374151; }
.btn-secondary:hover { background: #f3f4f6; }
.btn-primary { background-color: #0f172a; color: white; }
.btn-primary:hover { background-color: #1e293b; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-large { padding: 0.75rem 2rem; font-size: 1.1rem; }
.btn-danger { color: #dc2626; border-color: #dc2626; background: transparent; margin-top: 1rem; }
.btn-danger:hover { background: #fef2f2; }

.lessons-list { display: flex; flex-direction: column; }

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border-radius: 8px;
}

.lesson-item:last-child { border-bottom: none; }
a.lesson-item:hover { background-color: #f8fafc; transform: translateX(5px); }
a.lesson-item:hover .lesson-title { color: #4f46e5; }

.lesson-item.locked {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
.lesson-item.locked .lesson-title { color: #94a3b8; }
.lock-icon { font-size: 1.2rem; }

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

.lesson-meta { display: flex; align-items: center; gap: 1.5rem; }
.content-icons { display: flex; gap: 0.5rem; opacity: 0.6; }
.arrow { color: #cbd5e1; font-weight: bold; }
.alert-error { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
</style>