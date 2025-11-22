export const Config = {
    port: process.env.PORT || 3000,
    mongo: {
        url: process.env.MONGO_URL || 'mongodb://localhost:27018',
        dbName: process.env.MONGO_DB_NAME || 'courses-backend'
    }
}