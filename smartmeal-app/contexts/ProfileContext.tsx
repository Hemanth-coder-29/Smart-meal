"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfile } from "@/types/user";

interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
  saveProfile: () => void;
  loadProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = "smartmeal_profile";

const DEFAULT_PROFILE: UserProfile = {
  dailyCalorieGoal: 2000,
  proteinGoal: 150,
  carbGoal: 200,
  fatGoal: 65,
  dietaryRestrictions: [],
  activityLevel: "moderately-active",
  goalType: "maintain",
  preferredCuisines: [],
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setProfile(DEFAULT_PROFILE);
    }
  };

  const saveProfile = () => {
    if (profile) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (error) {
        console.error("Failed to save profile:", error);
      }
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;

    const updated = {
      ...profile,
      ...updates,
    };

    setProfile(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        saveProfile,
        loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
