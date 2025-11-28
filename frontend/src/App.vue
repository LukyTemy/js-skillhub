<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useAuth } from "@/composables/useAuth";
import { onMounted } from "vue";

const auth = useAuth()

onMounted(async () => {
  await auth.init()
})
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <div class="auth" v-if="auth.state.isReady">
        <p v-if="auth.state.authenticated">Welcome, {{ auth.getUsername() }}!</p>
        <button v-if="auth.state.authenticated" @click="auth.logout()">Log out</button>
        <div v-else>
          <button @click="auth.login()">Log in</button>
          <button @click="auth.register()">Register</button>
        </div>
      </div>

      <div class="auth" v-else>
        <p>Loading session...</p>
      </div>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/courses">Courses</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
/* ... tvůj původní styl ... */
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.auth {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>