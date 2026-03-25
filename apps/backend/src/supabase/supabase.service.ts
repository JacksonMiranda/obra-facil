import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@obrafacil/shared';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client!: SupabaseClient<Database>;
  private _adminClient!: SupabaseClient<Database>;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this._client = createClient<Database>(url, anonKey);

    this._adminClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  get client(): SupabaseClient<Database> {
    return this._client;
  }

  get adminClient(): SupabaseClient<Database> {
    return this._adminClient;
  }
}
