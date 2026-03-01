import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing config");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: families, error: familiesError } = await supabase.from('families').select('*');
    console.log("Families:", families, familiesError);

    if (families && families.length > 0) {
        const { data: members, error: membersError } = await supabase.from('family_members').select('*');
        console.log("Members:", members, membersError);

        if (members && members.length > 0) {
            const userIds = members.map(m => m.user_id);
            const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').in('id', userIds);
            console.log("Profiles:", profiles, profilesError);
        }
    }
}

test();
