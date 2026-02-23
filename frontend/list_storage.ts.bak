import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles(path: string = '') {
    const { data, error } = await supabase.storage.from('f1-media').list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
        console.error(`Error listing path ${path}:`, error);
        return;
    }

    for (const item of data) {
        if (!item.id) { // It's a folder
            await listFiles(path ? `${path}/${item.name}` : item.name);
        } else {
            console.log(path ? `${path}/${item.name}` : item.name);
        }
    }
}

listFiles('teams').then(() => listFiles('drivers/max_verstappen'));
