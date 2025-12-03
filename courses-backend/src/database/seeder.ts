import 'reflect-metadata';
import { ObjectId } from 'mongodb';
import mongo from './mongo';
import { UserRole } from '../types/dto/user.dto';
import { ContentType } from '../types/dto/course.dto';

const KEYCLOAK_IDS = {
    STUDENT: "550e8400-e29b-41d4-a716-446655440001",
    INSTRUCTOR: "550e8400-e29b-41d4-a716-446655440002",
    ADMIN: "550e8400-e29b-41d4-a716-446655440003"
};

const MONGO_IDS = {
    INSTRUCTOR: new ObjectId("000000000000000000000001"),
    STUDENT: new ObjectId("000000000000000000000002"),
    COURSE_TS: new ObjectId("00000000000000000000000A"),
    COURSE_VUE: new ObjectId("00000000000000000000000B")
};

class CourseAppSeeder {
    async connect() {
        try {
            await mongo.connect();
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await mongo.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }

    async clearCollections(): Promise<void> {
        if (!mongo.db) throw new Error('Database connection not initialized');

        const collections = ['users', 'courses', 'enrollments', 'certificates', 'notifications'];

        for (const collectionName of collections) {
            try {
                const collection = mongo.db.collection(collectionName);
                const result = await collection.deleteMany({});
                console.log(`🗑️  Cleared ${result.deletedCount} documents from ${collectionName}`);
            } catch (e) {
                console.warn(`⚠️ Collection ${collectionName} might not exist yet, skipping clean.`);
            }
        }
    }

    async seedUsers(): Promise<void> {
        if (!mongo.db) throw new Error('Database not initialized');
        const usersCollection = mongo.db.collection('users');

        const users = [
            {
                _id: MONGO_IDS.INSTRUCTOR,
                keycloakUuid: KEYCLOAK_IDS.INSTRUCTOR,
                name: "Instructor One",
                email: "instructor1@example.com",
                role: UserRole.Instructor,
                createdAt: new Date()
            },
            {
                _id: MONGO_IDS.STUDENT,
                keycloakUuid: KEYCLOAK_IDS.STUDENT,
                name: "Student One",
                email: "student1@example.com",
                role: UserRole.Student,
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                keycloakUuid: KEYCLOAK_IDS.ADMIN,
                name: "Admin User",
                email: "admin@example.com",
                role: UserRole.Admin,
                createdAt: new Date()
            }
        ];

        const result = await usersCollection.insertMany(users);
        console.log(`✅ Seeded ${result.insertedCount} users`);
    }

    async seedCourses(): Promise<void> {
        if (!mongo.db) throw new Error('Database not initialized');
        const coursesCollection = mongo.db.collection('courses');

        const courses = [
            {
                _id: MONGO_IDS.COURSE_TS,
                title: "TypeScript Mastery",
                description: "Kompletní průvodce jazykem TypeScript od základů po pokročilé typy.",
                category: "Development",
                instructorId: MONGO_IDS.INSTRUCTOR,
                lessons: [
                    {
                        lessonId: new ObjectId(),
                        title: "Úvod do TypeScriptu",
                        order: 1,
                        content: [
                            {
                                type: ContentType.Text,
                                text: "Vítejte v kurzu! TypeScript je superset JavaScriptu..."
                            },
                            {
                                type: ContentType.Video,
                                url: "https://www.youtube.com/watch?v=BwuLxPH8IDs",
                                caption: "Instalace prostředí"
                            }
                        ]
                    },
                    {
                        lessonId: new ObjectId(),
                        title: "Základní typy",
                        order: 2,
                        content: [
                            {
                                type: ContentType.Code,
                                code: "let isDone: boolean = false;\nlet decimal: number = 6;\nlet color: string = \"blue\";",
                                language: "typescript",
                                filename: "types.ts"
                            },
                            {
                                type: ContentType.Text,
                                text: "Zde vidíte základní deklaraci proměnných."
                            }
                        ]
                    }
                ]
            },
            {
                _id: MONGO_IDS.COURSE_VUE,
                title: "Vue 3 Composition API",
                description: "Naučte se tvořit moderní frontendové aplikace pomocí Vue 3.",
                category: "Frontend",
                instructorId: MONGO_IDS.INSTRUCTOR,
                lessons: [
                    {
                        lessonId: new ObjectId(),
                        title: "Setup Script",
                        order: 1,
                        content: [
                            {
                                type: ContentType.Text,
                                text: "Composition API přináší <script setup>..."
                            },
                            {
                                type: ContentType.Code,
                                code: "<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>",
                                language: "html",
                                filename: "App.vue"
                            }
                        ]
                    }
                ]
            }
        ];

        const result = await coursesCollection.insertMany(courses);
        console.log(`✅ Seeded ${result.insertedCount} courses`);
    }

    async seed(clearExisting: boolean = true): Promise<void> {
        try {
            console.log('🚀 Starting database seeding...');
            await this.connect();

            if (clearExisting) {
                await this.clearCollections();
            }

            await this.seedUsers();
            await this.seedCourses();

            console.log('🎉 Database seeding completed successfully!');
        } catch (error) {
            console.error('❌ Database seeding failed:', error);
            process.exit(1);
        } finally {
            await this.disconnect();
        }
    }
}

async function main() {
    const seeder = new CourseAppSeeder();
    const shouldClear = !process.argv.includes('--no-clear');
    await seeder.seed(shouldClear);
}

main();