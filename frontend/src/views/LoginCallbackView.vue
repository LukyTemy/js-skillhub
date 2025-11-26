<!--
  LoginCallbackView.vue - OAuth2 callback handler
  Keycloak redirects here after login with ?code=xxx&state=yyy
  This page exchanges the code for tokens
-->
<template>
  <div>
    <h1>Callback</h1>
    <p v-if="auth.error">{{ auth.error }}</p>
    <p v-if="auth.state.authenticated">Welcome, {{ auth.getUsername() }}!</p>
    <p v-else>Processing login...</p>
    <p>
      <router-link to="/">Go to aircrafts</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuth();
const router = useRouter();

onMounted(async () => {
  try {
    // Ensure client discovery is done
    await auth.init();

    // Current URL has the authorization code from Keycloak
    const currentUrl = window.location.href;
    // Exchange code for tokens
    await auth.handleCallback(currentUrl);

    // If authenticated, redirect to home so App.vue shows the welcome text
    if (auth.state.authenticated) {
      router.replace({ path: '/' });
    }
  } catch (err: any) {
    auth.error.value = err?.message || String(err);
  }
});
</script>
