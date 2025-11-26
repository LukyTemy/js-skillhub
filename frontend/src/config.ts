export default {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001',

    keycloak: {
        baseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL || 'http://localhost:8091',  // Keycloak server URL
        realm: import.meta.env.VITE_KEYCLOAK_REALM || 'COURSES-APP',       // Realm name
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web-app', // Client ID for this app
        redirectUri: location.origin + '/login-callback', // Must match Keycloak "Valid Redirect URIs"
    },

    statusBackendUrl: import.meta.env.VITE_STATUS_BACKEND_URL || 'http://localhost:5003'
}