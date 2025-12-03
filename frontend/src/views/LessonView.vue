<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseService } from '@/composables/useCourseService';
import { useEnrollmentService } from '@/composables/useEnrollmentService';
import { useAuth } from '@/composables/useAuth';
import type { Course } from '@/model/Course';

const route = useRoute();
const router = useRouter();
const { getCourseById } = useCourseService();
const { getUserEnrollments, getCurrentBackendUser, updateEnrollmentStatus } = useEnrollmentService();
const auth = useAuth();

const course = ref<Course | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const authorizing = ref(true);
const currentEnrollmentId = ref<string | null>(null);

async function loadData() {
  loading.value = true;
  authorizing.value = true;
  error.value = null;
  const courseId = route.params.id as string;

  try {
    if (!course.value || course.value._id !== courseId) {
      course.value = await getCourseById(courseId);
    }

    if (auth.hasRole('admin') || auth.hasRole('instructor')) {
      authorizing.value = false;
      return;
    }

    if (auth.state.authenticated) {
      const user = await getCurrentBackendUser();
      if (user && user._id) {
        const enrollments = await getUserEnrollments(user._id);

        const activeEnrollment = enrollments.find((e: any) =>
            e.courseId === courseId && (e.status === 'active' || e.status === 'completed')
        );

        if (!activeEnrollment) {
          alert("Pro zobrazení lekce musíte být zapsáni v kurzu.");
          router.replace({ name: 'course-detail', params: { id: courseId } });
          return;
        } else {
          currentEnrollmentId.value = activeEnrollment._id;
        }
      } else {
        throw new Error("User data not found");
      }
    } else {
      router.replace({ name: 'home' });
      return;
    }

  } catch (e: any) {
    console.error("Failed to load course context or verify enrollment", e);
    error.value = "Nepodařilo se ověřit přístup k lekci.";
  } finally {
    loading.value = false;
    authorizing.value = false;
  }
}

onMounted(() => {
  loadData();
});

const currentLessonId = computed(() => route.params.lessonId as string);

const currentLessonIndex = computed(() => {
  if (!course.value || !course.value.lessons) return -1;
  return course.value.lessons.findIndex(l => l.lessonId === currentLessonId.value);
});

const currentLesson = computed(() => {
  if (currentLessonIndex.value === -1 || !course.value) return null;
  return course.value.lessons[currentLessonIndex.value];
});

const prevLesson = computed(() => {
  if (!course.value || currentLessonIndex.value <= 0) return null;
  return course.value.lessons[currentLessonIndex.value - 1];
});

const nextLesson = computed(() => {
  if (!course.value || currentLessonIndex.value === -1 || currentLessonIndex.value >= course.value.lessons.length - 1) return null;
  return course.value.lessons[currentLessonIndex.value + 1];
});

function navigateToLesson(lessonId: string) {
  if (!course.value) return;
  router.push({
    name: 'lesson-detail',
    params: { id: course.value._id, lessonId: lessonId }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToCourse() {
  if (!course.value) return;
  router.push({ name: 'course-detail', params: { id: course.value._id } });
}

async function handleFinishCourse() {
  if (!currentEnrollmentId.value) return;

  if (!confirm("Gratulujeme k dokončení všech lekcí! Chcete kurz označit jako dokončený?")) {
    return;
  }

  try {
    await updateEnrollmentStatus(currentEnrollmentId.value, 'completed');
    alert("Kurz byl úspěšně dokončen! 🎓");
    router.push({ name: 'course-detail', params: { id: course.value?._id } });
  } catch (e) {
    console.error("Failed to complete course", e);
    alert("Nepodařilo se dokončit kurz.");
  }
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  return url;
}
</script>

<template>
  <div class="lesson-view-container">

    <div v-if="loading || authorizing" class="state-msg">
      Ověřuji přístup a načítám lekci...
    </div>

    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <div v-else-if="course && currentLesson" class="lesson-layout">

      <header class="lesson-header">
        <button class="btn-back" @click="goBackToCourse">
          ← Zpět na osnovu
        </button>
        <div class="course-meta">
          <span class="course-title">{{ course.title }}</span>
          <span class="separator">/</span>
          <span class="lesson-counter">Lekce {{ currentLessonIndex + 1 }} z {{ course.lessons.length }}</span>
        </div>
      </header>

      <main class="content-area">
        <h1 class="lesson-main-title">{{ currentLesson.title }}</h1>

        <div class="blocks-container">
          <div
              v-for="(block, index) in currentLesson.content"
              :key="index"
              class="content-block"
          >
            <div v-if="block.type === 'text'" class="text-block">
              <p>{{ block.text }}</p>
            </div>

            <div v-else-if="block.type === 'code'" class="code-block-wrapper">
              <div class="code-header">
                <span class="lang-badge">{{ block.language || 'text' }}</span>
                <span v-if="block.filename" class="filename">{{ block.filename }}</span>
              </div>
              <pre class="code-content"><code>{{ block.code }}</code></pre>
            </div>

            <div v-else-if="block.type === 'video'" class="video-block">
              <div class="video-container">
                <iframe
                    v-if="block.url && (block.url.includes('youtube') || block.url.includes('youtu.be'))"
                    :src="getEmbedUrl(block.url)"
                    title="Video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
                <div v-else class="video-placeholder">
                  <a :href="block.url" target="_blank" class="btn btn-primary">Otevřít video v novém okně</a>
                  <p class="url-text">{{ block.url }}</p>
                </div>
              </div>
              <p v-if="block.caption" class="video-caption">{{ block.caption }}</p>
            </div>

          </div>
        </div>
      </main>

      <footer class="lesson-footer">
        <button
            class="nav-btn prev"
            :disabled="!prevLesson"
            @click="prevLesson && navigateToLesson(prevLesson.lessonId)"
        >
          <span class="arrow">←</span>
          <div class="btn-text">
            <span class="label">Předchozí</span>
            <span class="title" v-if="prevLesson">{{ prevLesson.title }}</span>
          </div>
        </button>

        <button
            class="nav-btn next"
            :class="{ 'finish-btn': !nextLesson }"
            @click="nextLesson ? navigateToLesson(nextLesson.lessonId) : handleFinishCourse()"
        >
          <div class="btn-text">
            <span class="label">{{ nextLesson ? 'Další lekce' : 'Konec kurzu' }}</span>
            <span class="title" v-if="nextLesson">{{ nextLesson.title }}</span>
            <span class="title" v-else>Dokončit kurz</span>
          </div>
          <span class="arrow" v-if="nextLesson">→</span>
          <span class="arrow" v-else>🏁</span>
        </button>
      </footer>

    </div>
  </div>
</template>

<style scoped>
.lesson-view-container {
  min-height: 100vh;
  background-color: #f8fafc;
}

.lesson-layout {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 40px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
}

.lesson-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.btn-back {
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  background: none;
  border: none;
}
.btn-back:hover { color: #0f172a; text-decoration: underline; }

.course-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #94a3b8;
}

.course-title { font-weight: 500; color: #475569; }
.lesson-counter { color: #94a3b8; }

.content-area {
  padding: 3rem 2rem;
  flex: 1;
}

.lesson-main-title {
  font-size: 2.25rem;
  margin-top: 0;
  margin-bottom: 2.5rem;
  color: #0f172a;
  line-height: 1.2;
}

.blocks-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.text-block p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #334155;
  margin: 0;
  white-space: pre-wrap;
}

.code-block-wrapper {
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.code-header {
  background-color: #252526;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lang-badge {
  color: #9cdcfe;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
}

.filename {
  color: #858585;
  font-size: 0.8rem;
  font-style: italic;
}

.code-content {
  margin: 0;
  padding: 1.25rem;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #d4d4d4;
}

.video-block {
  width: 100%;
}

.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-placeholder {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  color: #64748b;
}
.url-text { margin-top: 1rem; font-size: 0.85rem; opacity: 0.7; }
.video-caption { text-align: center; color: #64748b; margin-top: 0.5rem; font-size: 0.9rem; font-style: italic; }

.lesson-footer {
  padding: 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  background: #f8fafc;
  margin-top: 3rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 45%;
}

.nav-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
}

.nav-btn.next {
  margin-left: auto;
  text-align: right;
  background: #0f172a;
  color: white;
  border: none;
}
.nav-btn.next:hover:not(:disabled) {
  background: #1e293b;
}

.nav-btn .arrow { font-size: 1.2rem; font-weight: bold; }
.btn-text { display: flex; flex-direction: column; }
.btn-text .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; margin-bottom: 0.2rem; }
.btn-text .title { font-weight: 600; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

.btn-primary { background-color: #0f172a; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none;}

/* Finish button style */
.nav-btn.finish-btn {
  background: #166534;
  color: white;
  border-color: #166534;
}
.nav-btn.finish-btn:hover {
  background: #15803d;
}

@media (max-width: 600px) {
  .lesson-header { padding: 1rem; }
  .content-area { padding: 2rem 1rem; }
  .lesson-footer { padding: 1.5rem 1rem; }
  .nav-btn .title { display: none; }
}

.state-msg { text-align: center; padding: 4rem; color: #64748b; }
.error { color: #ef4444; }
</style>