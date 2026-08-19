import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Fallback local user
      setUser({
        id: 'candidate_default_01',
        name: 'Alex Mercer',
        email: 'candidate@example.com',
        target_role: 'Full Stack Developer',
        experience_level: 'Intermediate',
        streak_count: 3,
        settings: {
          theme: 'dark',
          voice_enabled: true,
          default_difficulty: 'Intermediate',
          default_hr_percentage: 20,
          default_question_count: 5,
          mode: 'real'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (updateData) => {
    try {
      const updated = await authApi.updateProfile(updateData);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshProfile: fetchProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
