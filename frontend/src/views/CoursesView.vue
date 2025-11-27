<script setup lang="ts">
import { ref, onMounted } from 'vue'
import config from '@/config'
import type { Course } from '@/model/Course'
import { useAuth } from "@/composables/useAuth";

const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const auth = useAuth()

async function fetchCourses() {
  loading.value = true;
  error.value = null; // Reset chyby před novým pokusem

  try {
    // Tady voláme authorizedRequest, který sám řeší refresh tokenu pokud je potřeba
    const response = await auth.authorizedRequest(config.backendUrl + "/courses")
    courses.value = response
  } catch (e: any) {
    console.error("Failed to fetch courses:", e);
    // Zobrazíme chybu uživateli
    error.value = e.message || "Failed to load courses";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Počkáme na inicializaci auth (načtení tokenů, refresh)
  await auth.init();

  if (auth.state.authenticated) {
    await fetchCourses();
  } else {
    // Volitelné: Pokud uživatel není přihlášen, můžeme ho vyzvat nebo přesměrovat
    // error.value = "Please log in to view courses.";
  }
})
</script>

<template>
  <main>
    <h1>Courses</h1>

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
.error {
  color: red;
  margin: 1rem 0;
  font-weight: bold;
}
</style>