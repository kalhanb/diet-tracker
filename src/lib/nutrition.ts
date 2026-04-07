export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
  extra: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function getRecommendedCalories(
  tdee: number,
  goalType: 'lose' | 'maintain' | 'gain'
): number {
  switch (goalType) {
    case 'lose':
      return tdee - 500;
    case 'gain':
      return tdee + 500;
    default:
      return tdee;
  }
}
