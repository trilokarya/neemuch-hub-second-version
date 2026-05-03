import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfrmscctezsmqlehjigz.supabase.co';

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcm1zY2N0ZXpzbXFsZWhqaWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDExOTYsImV4cCI6MjA4NzY3NzE5Nn0.oNgPRWd-oea9mmPpLsJjtt4CRaagsbGtUiujGNWPJTQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
