<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Course } from '@/model/Course'
import { useAuth } from "@/composables/useAuth";
import { useCourseService } from '@/composables/useCourseService';
import { useEnrollmentService } from '@/composables/useEnrollmentService';

const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const auth = useAuth()
const router = useRouter()
const { listCourses } = useCourseService();
const { getUserEnrollments, getCurrentBackendUser } = useEnrollmentService();

const userEnrollments = ref<any[]>([]);

const isInstructor = computed(() => auth.isInstructor ? auth.isInstructor() : false)

async function fetchCourses() {
  loading.value = true;
  error.value = null;
  try {
    courses.value = await listCourses();

    if (auth.state.authenticated) {
      const user = await getCurrentBackendUser();
      if (user && user._id) {
        userEnrollments.value = await getUserEnrollments(user._id);
      }
    }
  } catch (e: any) {
    console.error("Failed to fetch courses:", e);
    error.value = e.message || "Failed to load courses";
  } finally {
    loading.value = false;
  }
}

function getCourseStatus(courseId: string) {
  const enrollment = userEnrollments.value.find((e: any) => e.courseId === courseId);
  if (!enrollment) return null;
  return enrollment.status;
}

function goToCreateCourse() {
  router.push({ name: 'course-create' })
}

onMounted(async () => {
  await auth.init();
  if (auth.state.authenticated) await fetchCourses();
})
</script>

<template>
  <main class="courses-view">

    <header class="page-header">
      <div class="header-text">
        <h1>Available Courses</h1>
        <p class="subtitle">Explore and learn from our wide range of topics.</p>
      </div>

      <button v-if="auth.state.authenticated && isInstructor" class="btn btn-primary btn-create" @click="goToCreateCourse">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Course
      </button>
    </header>

    <div v-if="loading" class="state-msg">Loading courses...</div>
    <div v-if="error" class="state-msg error">⚠️ {{ error }} <button @click="fetchCourses">Retry</button></div>

    <div v-if="!loading && !error && courses.length === 0" class="state-msg empty">
      <div v-if="auth.state.authenticated">
        <h3>No courses found</h3>
        <p>It looks like there are no courses yet.</p>
      </div>
      <div v-else>
        <h3>Welcome to our Platform</h3>
        <p>Please <a href="#" @click.prevent="auth.login()">log in</a> to view the available courses.</p>
      </div>
    </div>

    <div v-if="!loading && !error && courses.length > 0" class="courses-grid">
      <article v-for="c in courses" :key="c._id" class="course-card">
        <div class="card-content">
          <div class="badges-row">
            <span class="badge">{{ c.category ?? 'General' }}</span>
            <span v-if="getCourseStatus(c._id) === 'active'" class="badge enrolled">Zapsáno ✅</span>
            <span v-else-if="getCourseStatus(c._id) === 'completed'" class="badge completed">Dokončeno 🏆</span>
          </div>
          <h3>{{ c.title }}</h3>
          <p class="description">{{ c.description }}</p>
        </div>

        <div class="card-footer">
          <router-link
              :to="{ name: 'course-detail', params: { id: c._id } }"
              class="btn-link"
          >
            View Details →
          </router-link>
        </div>

      </article>
    </div>

  </main>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.course-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.card-content { padding: 1.5rem; flex: 1; }

.badges-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  background-color: #eff6ff;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.enrolled { background: #dcfce7; color: #166534; }
.badge.completed { background: #fef08a; color: #854d0e; }

.course-card h3 { margin: 0 0 0.75rem 0; font-size: 1.25rem; font-weight: 600; line-height: 1.3; }
.description { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-bg-secondary);
  background-color: #fcfcfc;
}

.btn-link {
  display: inline-block;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  background: none; border: none; padding: 0; cursor: pointer;
}
.btn-link:hover { text-decoration: underline; }

.state-msg { text-align: center; padding: 3rem 0; color: var(--color-text-muted); }
.state-msg.error { color: #ef4444; }
.state-msg a { color: var(--color-primary); text-decoration: none; font-weight: 600; }

@media (max-width: 900px) {
  .courses-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .courses-grid { grid-template-columns: 1fr; }
}
</style>