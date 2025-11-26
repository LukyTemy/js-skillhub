<script setup lang="ts">
import { ref, onMounted } from 'vue'
import config from '@/config'
import type { Course } from '@/model/Course'
import {useAuth} from "@/composables/useAuth";

const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const auth = useAuth()

async function fetchCourses() {
  const response = await auth.authorizedRequest(config.backendUrl + "/courses")
  courses.value = response
}

onMounted(async () => {
  await fetchCourses()
})
</script>

<template>
  <main>
    <h1>Courses</h1>

    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>

    <ul v-if="!loading && !error">
      <li v-for="c in courses" :key="c._id">
        <h3>{{ c.title }}</h3>
        <p v-if="c.description">{{ c.description }}</p>
        <small>Category: {{ c.category ?? '—' }}</small>
      </li>
    </ul>

    <div v-if="!loading && courses.length === 0">No courses found.</div>
  </main>
</template>

