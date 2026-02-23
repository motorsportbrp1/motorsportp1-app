const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' }); // Assuming it's run from backend

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching sample data to understand schema...");

    const tables = ['results', 'races', 'driver_standings', 'qualifying', 'constructors'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        console.log(`\n--- TABLE: ${table} ---`);
        if (error) {
            console.error(error);
        } else if (data && data.length > 0) {
            console.log(Object.keys(data[0]).join(', '));
            console.log("Sample:", data[0]);
        } else {
            console.log("Empty or not found");
        }
    }
}

run();
