<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCertificateService, type Certificate } from '@/composables/useCertificateService';
import { useEnrollmentService } from '@/composables/useEnrollmentService';
import { useCourseService } from '@/composables/useCourseService';

const { getUserCertificates } = useCertificateService();
const { getCurrentBackendUser } = useEnrollmentService();
const { getCourseById } = useCourseService();

const certificates = ref<Certificate[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const courseNames = ref<Record<string, string>>({});

onMounted(async () => {
  loading.value = true;
  try {
    const user = await getCurrentBackendUser();
    if (!user || !user._id) {
      error.value = "Nepodařilo se identifikovat uživatele.";
      return;
    }

    const data = await getUserCertificates(user._id);
    certificates.value = data;

    for (const cert of data) {
      if (!courseNames.value[cert.courseId]) {
        try {
          const course = await getCourseById(cert.courseId);
          courseNames.value[cert.courseId] = course.title;
        } catch (e) {
          console.error(`Failed to load course info for ${cert.courseId}`);
          courseNames.value[cert.courseId] = "Neznámý kurz";
        }
      }
    }

  } catch (e) {
    console.error("Failed to load certificates", e);
    error.value = "Nepodařilo se načíst certifikáty.";
  } finally {
    loading.value = false;
  }
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}
</script>

<template>
  <main class="certificates-page">
    <h1>Moje certifikáty</h1>

    <div v-if="loading" class="loading-state">
      Načítám certifikáty...
    </div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else-if="certificates.length === 0" class="empty-state">
      <p>Zatím jste nezískali žádné certifikáty.</p>
      <router-link :to="{ name: 'courses' }" class="btn btn-primary">Přejít na kurzy</router-link>
    </div>

    <div v-else class="certificates-grid">
      <div v-for="cert in certificates" :key="cert._id" class="cert-card">
        <div class="cert-icon">🏆</div>
        <div class="cert-content">
          <h3>{{ courseNames[cert.courseId] || 'Načítám název kurzu...' }}</h3>
          <p class="cert-date">Získáno: {{ formatDate(cert.issuedAt) }}</p>
          <a :href="cert.fileUrl" target="_blank" class="btn btn-outline">
            Stáhnout PDF
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.certificates-page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
h1 { margin-bottom: 2rem; color: #0f172a; }

.loading-state, .empty-state { text-align: center; padding: 4rem; color: #64748b; font-size: 1.1rem; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.alert-error { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 8px; }

.certificates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

.cert-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cert-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

.cert-icon { font-size: 3rem; margin-bottom: 1rem; background: #fef9c3; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.cert-content h3 { margin: 0 0 0.5rem 0; font-size: 1.25rem; color: #1e293b; }
.cert-date { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }

.btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; text-decoration: none; cursor: pointer; }
.btn-primary { background: #4f46e5; color: white; }
.btn-primary:hover { background: #4338ca; }
.btn-outline { border: 1px solid #cbd5e1; color: #334155; background: white; width: 100%; box-sizing: border-box; }
.btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }
</style>