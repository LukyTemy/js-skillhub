<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
</script>

<template>
  <main class="home-page">
    <div class="hero-container">

      <div class="hero-content">
        <h1 class="title">
          Master New Skills,<br />
          <span class="highlight">Build Your Future.</span>
        </h1>

        <p class="subtitle">
          Welcome to <strong>MyApp</strong>. The best place to learn programming, design, and more from industry experts. Start your journey today.
        </p>

        <div class="actions">
          <router-link to="/courses" class="btn btn-primary btn-lg">
            Explore Courses
          </router-link>

          <button
              v-if="!auth.state.authenticated"
              @click="auth.register()"
              class="btn btn-secondary btn-lg"
          >
            Get Started
          </button>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="card-icon">🎓</div>
          <h3>Expert Instructors</h3>
          <p>Learn from the best in the industry.</p>
        </div>
        <div class="feature-card">
          <div class="card-icon">🚀</div>
          <h3>Career Growth</h3>
          <p>Level up your professional skills.</p>
        </div>
        <div class="feature-card">
          <div class="card-icon">💻</div>
          <h3>Hands-on Practice</h3>
          <p>Build real projects as you learn.</p>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem 5rem;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
}

/* --- Textová část --- */
.hero-content {
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--color-text-main);
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.highlight {
  color: var(--color-primary);
  background: linear-gradient(120deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0) 100%);
  padding: 0 0.5rem;
  border-radius: 4px;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* --- Tlačítka (Přidány chybějící styly) --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px; /* natvrdo nebo var(--radius) */
  cursor: pointer;
  font-weight: 600;
  text-decoration: none; /* Důležité pro router-link */
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background-color: var(--color-primary); /* Modrá z App.vue */
  color: white; /* Bílý text */
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
}

.btn-lg {
  padding: 0.8rem 2rem;
  font-size: 1.05rem;
}

.btn-secondary {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
}
.btn-secondary:hover {
  background: var(--color-bg-secondary);
}

/* --- Features Grid --- */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
  margin-top: 1rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: var(--color-bg-secondary);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.feature-card h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: var(--color-text-main);
}

.feature-card p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

/* Responsivita */
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>