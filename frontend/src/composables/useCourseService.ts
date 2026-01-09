import { useAuth } from '@/composables/useAuth';
import config from '@/config';
import type { Course } from '@/model/Course';

export interface NewCoursePayload {
  title: string;
  description: string;
  category: string;
  lessons: any[];
}

export function useCourseService() {
  const auth = useAuth();

  const listCourses = async (): Promise<Course[]> => {
    const data = await auth.authorizedRequest(`${config.backendUrl}/courses`);
    return data as Course[];
  };

  const getCourseById = async (id: string): Promise<Course> => {
    const data = await auth.authorizedRequest(`${config.backendUrl}/courses/${id}`);
    return data as Course;
  };

  const createCourse = async (payload: NewCoursePayload): Promise<Course> => {
    const data = await auth.authorizedRequest(`${config.backendUrl}/courses`, {
      method: 'POST',
      data: payload,
    });
    return data as Course;
  };

  return {
    listCourses,
    createCourse,
    getCourseById
  };
}

