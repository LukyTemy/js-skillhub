export default {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001',

    keycloak: {
        baseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL || 'http://localhost:8091',
        realm: import.meta.env.VITE_KEYCLOAK_REALM || 'COURSES-APP',
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web-app',
        redirectUri: location.origin + '/login-callback',
        postLogoutRedirectUri: location.origin + '/',
    },

    statusBackendUrl: import.meta.env.VITE_STATUS_BACKEND_URL || 'http://localhost:5003'
}