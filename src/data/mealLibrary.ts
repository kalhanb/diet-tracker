export interface Meal {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
}

export const mealLibrary: Meal[] = [
  {
    id: 'k1',
    name: 'Kirkland Stir Fry Vegetables & Shrimp',
    category: 'Dinner',
    calories: 320,
    protein: 34,
    carbs: 18,
    fat: 6,
    tags: ['Costco', 'High Protein', 'Kirkland']
  },
  {
    id: 'k2',
    name: 'Egg White & Whole Egg Omelet',
    category: 'Breakfast',
    calories: 250,
    protein: 28,
    carbs: 4,
    fat: 14,
    tags: ['Eggs', 'High Protein']
  },
  {
    id: 'k3',
    name: 'Kirkland Thin Sliced Chicken Breast',
    category: 'Lunch',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    tags: ['Chicken', 'Kirkland', 'Clean']
  },
  {
    id: 'k4',
    name: 'Wild Caught Salmon with Quinoa',
    category: 'Lunch',
    calories: 420,
    protein: 38,
    carbs: 35,
    fat: 16,
    tags: ['Salmon', 'Omega-3', 'Quinoa']
  },
  {
    id: 'k5',
    name: 'Kirkland Three Berry Blend Smoothie',
    category: 'Breakfast',
    calories: 210,
    protein: 15,
    carbs: 28,
    fat: 4,
    tags: ['Berries', 'Smoothie']
  },
  {
    id: 'k6',
    name: 'Almonds & Chia Seed Yogurt',
    category: 'Snack',
    calories: 280,
    protein: 12,
    carbs: 14,
    fat: 22,
    tags: ['Healthy Fats', 'Almonds', 'Chia']
  },
  {
    id: 'k7',
    name: 'Fresh Orange & Avocado Salad',
    category: 'Snack',
    calories: 220,
    protein: 4,
    carbs: 18,
    fat: 15,
    tags: ['Healthy Fats', 'Vitamins']
  }
];
