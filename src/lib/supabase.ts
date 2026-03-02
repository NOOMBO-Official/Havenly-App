import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvgsjvjjjtpxtkbkfdco.supabase.co';
const supabaseAnonKey = 'sb_publishable_IllxjGwWdQ3hh6qCu301qw_zmz9nzBU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
