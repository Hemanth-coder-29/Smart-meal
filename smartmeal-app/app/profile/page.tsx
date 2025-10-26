"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/types/user";
import { calculateCalorieGoal, calculateMacroSplit } from "@/lib/nutritionCalculator";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    dailyCalorieGoal: 2000,
    proteinGoal: 150,
    carbGoal: 200,
    fatGoal: 65,
    dietaryRestrictions: [],
    activityLevel: "moderately-active",
    goalType: "maintain",
    preferredCuisines: [],
  });

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    age: 30,
    gender: "male" as "male" | "female" | "other",
    weight: 70,
    height: 170,
  });

  const [targetWeight, setTargetWeight] = useState(70);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load profile from localStorage
    const stored = localStorage.getItem("smartmeal_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("smartmeal_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const calculateGoals = () => {
    const calories = calculateCalorieGoal(
      profile.activityLevel,
      profile.goalType,
      2000 // base calories
    );

    const macros = calculateMacroSplit(calories);

    setProfile({
      ...profile,
      dailyCalorieGoal: calories,
      proteinGoal: macros.proteinGoal,
      carbGoal: macros.carbGoal,
      fatGoal: macros.fatGoal,
    });
  };

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Keto",
    "Paleo",
    "Low-Carb",
  ];

  const cuisineOptions = [
    "Italian",
    "Mexican",
    "Chinese",
    "Indian",
    "Thai",
    "Japanese",
    "Mediterranean",
    "American",
  ];

  const toggleDietary = (restriction: string) => {
    if (profile.dietaryRestrictions.includes(restriction)) {
      setProfile({
        ...profile,
        dietaryRestrictions: profile.dietaryRestrictions.filter(
          (r) => r !== restriction
        ),
      });
    } else {
      setProfile({
        ...profile,
        dietaryRestrictions: [...profile.dietaryRestrictions, restriction],
      });
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (profile.preferredCuisines.includes(cuisine)) {
      setProfile({
        ...profile,
        preferredCuisines: profile.preferredCuisines.filter(
          (c) => c !== cuisine
        ),
      });
    } else {
      setProfile({
        ...profile,
        preferredCuisines: [...profile.preferredCuisines, cuisine],
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile & Goals</h1>
              <p className="text-muted-foreground">
                Customize your nutrition goals and preferences
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? "✓ Saved!" : "💾 Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, name: e.target.value })
                    }
                    placeholder="Your name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Age
                    </label>
                    <Input
                      type="number"
                      value={personalInfo.age}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Gender
                    </label>
                    <select
                      value={personalInfo.gender}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          gender: e.target.value as "male" | "female" | "other",
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      value={personalInfo.weight}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Height (cm)
                    </label>
                    <Input
                      type="number"
                      value={personalInfo.height}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          height: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Activity Level
                  </label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        activityLevel: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="lightly-active">Light (1-3 days/week)</option>
                    <option value="moderately-active">Moderate (3-5 days/week)</option>
                    <option value="very-active">Very Active (athlete)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Health Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Goal Type
                  </label>
                  <select
                    value={profile.goalType}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        goalType: e.target.value as "lose" | "maintain" | "gain",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Weight (kg)
                  </label>
                  <Input
                    type="number"
                    value={targetWeight}
                    onChange={(e) =>
                      setTargetWeight(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <Button variant="secondary" onClick={calculateGoals}>
                  🧮 Auto-Calculate Nutrition Goals
                </Button>
              </CardContent>
            </Card>

            {/* Dietary Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Restrictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleDietary(option)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        profile.dietaryRestrictions.includes(option)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cuisine Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Cuisine Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        profile.preferredCuisines.includes(cuisine)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Nutrition Goals */}
          <div className="space-y-6">
            {/* Nutrition Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Nutrition Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Calories
                  </label>
                  <Input
                    type="number"
                    value={profile.dailyCalorieGoal}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        dailyCalorieGoal: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Protein (g)
                  </label>
                  <Input
                    type="number"
                    value={profile.proteinGoal}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        proteinGoal: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Carbs (g)
                  </label>
                  <Input
                    type="number"
                    value={profile.carbGoal}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        carbGoal: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fats (g)
                  </label>
                  <Input
                    type="number"
                    value={profile.fatGoal}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        fatGoal: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* BMI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Body Mass Index</CardTitle>
              </CardHeader>
              <CardContent>
                {personalInfo.weight > 0 && personalInfo.height > 0 ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-primary">
                        {(
                          personalInfo.weight /
                          Math.pow(personalInfo.height / 100, 2)
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        BMI
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Underweight: &lt; 18.5</p>
                      <p>• Normal: 18.5 - 24.9</p>
                      <p>• Overweight: 25 - 29.9</p>
                      <p>• Obese: ≥ 30</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter your weight and height to calculate BMI
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Set realistic goals for sustainable results</li>
                  <li>• Update your profile as you progress</li>
                  <li>• Adjust macros based on your activity</li>
                  <li>• Consult a professional for medical advice</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
