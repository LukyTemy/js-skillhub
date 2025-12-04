import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import * as path from 'path';
import * as fs from 'fs';


const serviceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `skillhub-a4524.firebasestorage.app`
        });
    }
} else {
    console.error("❌ Service Account Key not found at " + serviceAccountPath);
}

export class StorageService {
    async uploadFile(fileBuffer: Buffer, destinationPath: string): Promise<string> {
        const bucket = getStorage().bucket();
        const file = bucket.file(destinationPath);

        await file.save(fileBuffer, {
            metadata: {
                contentType: 'application/pdf',
            },
        });

        await file.makePublic();

        return file.publicUrl();
    }
}