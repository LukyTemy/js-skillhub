import { useAuth } from '@/composables/useAuth';
import config from '@/config';

export interface Enrollment {
    _id: string;
    userId: string;
    courseId: string;
    status: 'active' | 'cancelled' | 'completed';
}

export function useEnrollmentService() {
    const auth = useAuth();

    const getCurrentBackendUser = async () => {
        return await auth.authorizedRequest(`${config.backendUrl}/auth/keycloak`, { method: 'POST' });
    };

    const createEnrollment = async (courseId: string, userId: string): Promise<Enrollment> => {
        const payload = {
            userId: userId,
            courseId: courseId,
            status: 'active'
        };

        return await auth.authorizedRequest(`${config.backendUrl}/enrollments`, {
            method: 'POST',
            data: payload
        });
    };

    const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
        return await auth.authorizedRequest(`${config.backendUrl}/enrollments/${userId}`);
    };

    const updateEnrollmentStatus = async (enrollmentId: string, status: 'active' | 'cancelled' | 'completed'): Promise<Enrollment> => {
        return await auth.authorizedRequest(`${config.backendUrl}/enrollments/${enrollmentId}/status`, {
            method: 'PATCH',
            data: { status }
        });
    };

    return {
        createEnrollment,
        getUserEnrollments,
        getCurrentBackendUser,
        updateEnrollmentStatus
    };
}