import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CoursesView from '../views/CoursesView.vue'
import LoginCallbackView from '../views/LoginCallbackView.vue'
import CourseCreateView from '../views/CourseCreateView.vue'
import CourseDetailView from "@/views/CourseDetailView.vue";
import CertificatesView from "@/views/CertificatesView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/courses',
      name: 'courses',
      component: CoursesView,
    },
    {
      path: '/courses/new',
      name: 'course-create',
      component: CourseCreateView,
    },
    {
      path: '/courses/:id',
      name: 'course-detail',
      component: CourseDetailView
    },
    {
      path: '/courses/:id/lessons/:lessonId',
      name: 'lesson-detail',
      component: () => import('../views/LessonView.vue')
    },
    {
      path: '/my-certificates',
      name: 'my-certificates',
      component: CertificatesView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login-callback',
      name: 'login-callback',
      component: LoginCallbackView,
    },
  ],
})

export default router