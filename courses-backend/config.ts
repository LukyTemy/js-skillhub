export const Config = {
    port: process.env.PORT || 3000,
    mongo: {
        url: process.env.MONGO_URL || 'mongodb://localhost:27018',
        dbName: process.env.MONGO_DB_NAME || 'courses-backend'
    },
    keycloak: {
        baseUrl: process.env.KEYCLOAK_BASE_URL || "http://localhost:8080",
        realm: process.env.KEYCLOAK_REALM || "master",
        clientId: process.env.KEYCLOAK_CLIENT_ID || "courses-frontend"
    }
}

export default Config;
