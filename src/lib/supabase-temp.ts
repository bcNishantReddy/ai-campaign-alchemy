
import { createClient } from '@supabase/supabase-js';
import type { SupabaseDatabase } from '@/types/supabase-temp';

const SUPABASE_URL = "https://tcrqykrxjmoauzuckxza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcnF5a3J4am1vYXV6dWNreHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzQ5NDUsImV4cCI6MjA1Njk1MDk0NX0.x4qki13HYYRoUK0gp5X9RdQU6F5LX4pYmywIp9wvlis";

export const supabaseTemp = createClient<SupabaseDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
