// scripts/generate-api-types.ts
import {generate} from 'openapi-typescript-codegen';
import * as path from 'path';

async function generateApiTypes(): Promise<void> {
    try {
        await generate({
            input: path.resolve(__dirname, '../memory_bank/Documentation/openapi.yaml'),
            output: path.resolve(__dirname, '../frontend/src/types/api'),
            exportCore: true,
            exportServices: true,
            exportModels: true,
            exportSchemas: false,
            indent: '2',
            httpClient: 'fetch', // alternativ: 'axios'
            useOptions: true,
            useUnionTypes: true,
        });
        console.log('✅ API-Typen erfolgreich generiert!');
    } catch (error) {
        console.error('❌ Fehler bei der Generierung der API-Typen:', error);
        process.exit(1);
    }
}

generateApiTypes();
