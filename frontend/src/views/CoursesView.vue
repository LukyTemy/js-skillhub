<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import config from '@/config'
import type { Course } from '@/model/Course'
import { useAuth } from "@/composables/useAuth";

const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const auth = useAuth()
const router = useRouter()

const isInstructor = computed(() => auth.isInstructor ? auth.isInstructor() : false)

async function fetchCourses() {
  loading.value = true;
  error.value = null;

  try {
    const response = await auth.authorizedRequest(config.backendUrl + "/courses")
    courses.value = response
  } catch (e: any) {
    console.error("Failed to fetch courses:", e);
    error.value = e.message || "Failed to load courses";
  } finally {
    loading.value = false;
  }
}

function goToCreateCourse() {
  router.push({ name: 'course-create' })
}

onMounted(async () => {
  await auth.init();

  if (auth.state.authenticated) {
    await fetchCourses();
  }
})
</script>

<template>
  <main>
    <header class="courses-header">
      <h1>Courses</h1>
      <button
        v-if="auth.state.authenticated && isInstructor"
        type="button"
        class="btn btn-primary"
        @click="goToCreateCourse"
      >
        Přidat kurz
      </button>
    </header>

    <button v-if="error" @click="fetchCourses">Try Again</button>

    <div v-if="loading">Loading courses...</div>

    <div v-if="error" class="error">
      Error: {{ error }}
    </div>

    <ul v-if="!loading && !error && courses.length > 0">
      <li v-for="c in courses" :key="c._id">
        <h3>{{ c.title }}</h3>
        <p v-if="c.description">{{ c.description }}</p>
        <small>Category: {{ c.category ?? '—' }}</small>
      </li>
    </ul>

    <div v-if="!loading && !error && courses.length === 0">
      <p v-if="auth.state.authenticated">No courses found.</p>
      <p v-else>Please <a href="#" @click.prevent="auth.login()">log in</a> to see the courses.</p>
    </div>
  </main>
</template>

<style scoped>
.courses-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.btn {
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
}

.error {
  color: red;
  margin: 1rem 0;
  font-weight: bold;
}
</style>