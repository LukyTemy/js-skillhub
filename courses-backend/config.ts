export const Config = {
    port: process.env.PORT || 3000,
    mongo: {
        url: process.env.MONGO_URL || 'mongodb://localhost:27018',
        dbName: process.env.MONGO_DB_NAME || 'courses-backend'
    },
    keycloak: {
        baseUrl: process.env.KEYCLOAK_BASE_URL || "http://localhost:8091",
        realm: process.env.KEYCLOAK_REALM || "COURSES-APP",
        clientId: process.env.KEYCLOAK_CLIENT_ID || "web-app"
    }
}

export default Config;
