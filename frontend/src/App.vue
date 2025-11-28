<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue' // Importujeme komponentu
import { useAuth } from "@/composables/useAuth";
import { onMounted } from "vue";

const auth = useAuth()

onMounted(async () => {
  // Inicializace auth je stále zde, protože je to vstupní bod aplikace
  await auth.init()
})
</script>

<template>
  <Navbar />

  <div class="main-layout">
    <div class="container">
      <RouterView />
    </div>
  </div>
</template>

<style>
/* --- Global Variables (Tyto musí být zde, aby je viděla celá apka) --- */
:root {
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-main: #0f172a;
  --color-text-muted: #64748b;
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-border: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --radius: 8px;
}

/* --- Layout --- */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text-main);
}

/* Globální kontejner (použitý v Navbaru i v Main Layoutu) */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.main-layout {
  padding-top: 80px; /* Kompenzace za Navbar */
  padding-bottom: 4rem;
  min-height: 100vh;
}

/* Reset tlačítek globálně */
button { font-family: inherit; border: none; background: none; cursor: pointer; padding: 0; }
</style>