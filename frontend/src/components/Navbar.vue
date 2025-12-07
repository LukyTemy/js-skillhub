<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from "@/composables/useAuth";
import { ref, onMounted, onUnmounted } from "vue";

const auth = useAuth()
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-container')) {
    isDropdownOpen.value = false
  }
}

function handleLogout() {
  isDropdownOpen.value = false
  auth.logout()
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-content">

      <div class="nav-left">
        <RouterLink to="/" class="brand-logo">SkillHub</RouterLink>
        <div class="nav-links">
          <RouterLink to="/courses" class="nav-link">Courses</RouterLink>
        </div>
      </div>

      <div class="nav-right">
        <div v-if="!auth.state.isReady" class="auth-loading">
          <div class="spinner-small"></div>
        </div>

        <div v-else-if="auth.state.authenticated" class="user-menu-container">
          <button @click.stop="toggleDropdown" class="user-btn">
            {{ auth.getUsername() }}
            <svg class="chevron" :class="{ 'rotate': isDropdownOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <transition name="fade">
            <div v-if="isDropdownOpen" class="dropdown-menu">
              <button @click="handleLogout" class="dropdown-item danger">Log Out</button>
            </div>
          </transition>
        </div>

        <div v-else class="guest-menu">
          <button @click="auth.login()" class="nav-link btn-text">Log In</button>
          <button @click="auth.register()" class="btn btn-primary">Register</button>
        </div>
      </div>

    </div>
  </nav>
</template>

<style scoped>
/* --- Navbar Styles --- */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; height: 64px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}
.navbar-content {
  display: flex; justify-content: space-between; align-items: center; height: 100%;
}
.nav-left, .nav-right { display: flex; align-items: center; gap: 2rem; }
.nav-right { gap: 1rem; }

.brand-logo { font-weight: 800; font-size: 1.25rem; color: var(--color-primary); text-decoration: none; }
.nav-link { text-decoration: none; color: var(--color-text-main); font-weight: 500; transition: color 0.2s; }
.nav-link:hover, .router-link-active { color: var(--color-primary); }

/* --- Buttons (Scoped versions if needed specific adjustments) --- */
.btn-text { color: var(--color-text-muted); padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; }
.btn-text:hover { color: var(--color-primary); }

.btn-primary {
  background-color: var(--color-primary); color: white;
  padding: 0.5rem 1rem; border-radius: var(--radius); font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background-color: var(--color-primary-hover); transform: translateY(-1px); }

/* --- User Menu --- */
.user-menu-container { position: relative; }
.user-btn { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.5rem; border-radius: var(--radius); cursor: pointer; color: var(--color-text-main); }
.user-btn:hover { background-color: var(--color-bg-secondary); }

.dropdown-menu {
  position: absolute; top: 120%; right: 0; width: 150px;
  background: white; border: 1px solid var(--color-border); border-radius: var(--radius);
  box-shadow: var(--shadow-md); padding: 0.5rem; display: flex; flex-direction: column;
}
.dropdown-item { padding: 0.6rem; text-align: left; border-radius: 4px; color: var(--color-text-main); font-weight: 500; cursor: pointer; }
.dropdown-item:hover { background-color: var(--color-bg-secondary); }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.danger:hover { background-color: #fef2f2; }

/* --- Utils --- */
.spinner-small { width: 20px; height: 20px; border: 2px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>