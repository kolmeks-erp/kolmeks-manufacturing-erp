import { supabase } from './supabase';
import { UserProfile } from '../types';

export class ProfileService {
  /**
   * Fetch application profile for a given auth user UUID
   */
  static async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          department,
          profile_image,
          status,
          role_id,
          role:roles (
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch user profile:', error.message);
        return null;
      }

      // Format role safely
      const profileData: UserProfile = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        profile_image: data.profile_image,
        status: data.status as 'active' | 'inactive' | 'suspended',
        role_id: data.role_id,
        role: Array.isArray(data.role) ? data.role[0] : data.role,
      };

      return profileData;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  }
}
