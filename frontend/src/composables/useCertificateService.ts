import { useAuth } from '@/composables/useAuth';
import config from '@/config';

export interface Certificate {
    _id: string;
    userId: string;
    courseId: string;
    issuedAt: string;
    fileUrl: string;
}

export function useCertificateService() {
    const auth = useAuth();

    const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
        return await auth.authorizedRequest(`${config.backendUrl}/users/${userId}/certificates`);
    };

    return {
        getUserCertificates
    };
}