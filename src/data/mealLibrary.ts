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
    id: '1',
    name: 'Grilled Salmon with Asparagus',
    category: 'Lunch',
    calories: 450,
    protein: 42,
    carbs: 5,
    fat: 28,
    tags: ['High Protein', 'Omega-3', 'Low Carb']
  },
  {
    id: '2',
    name: 'Quinoa & Chickpea Salad',
    category: 'Lunch',
    calories: 380,
    protein: 14,
    carbs: 55,
    fat: 12,
    tags: ['Plant-Based', 'High Fiber']
  },
  {
    id: '3',
    name: 'Chicken and Broccoli Stir-Fry',
    category: 'Dinner',
    calories: 410,
    protein: 48,
    carbs: 15,
    fat: 14,
    tags: ['High Protein', 'Clean']
  },
  {
    id: '4',
    name: 'Iced Matcha Latte with Almond Milk',
    category: 'Drink',
    calories: 90,
    protein: 2,
    carbs: 8,
    fat: 4,
    tags: ['Matcha', 'Antioxidant']
  },
  {
    id: '5',
    name: 'Egg White Omelet with Spinach',
    category: 'Breakfast',
    calories: 220,
    protein: 24,
    carbs: 4,
    fat: 12,
    tags: ['Breakfast', 'High Protein']
  },
  {
    id: '6',
    name: 'Greek Yogurt with Blueberries',
    category: 'Snack',
    calories: 180,
    protein: 15,
    carbs: 22,
    fat: 2,
    tags: ['Probiotic', 'High protein']
  },
  {
    id: '7',
    name: 'Seared Tuna with Asian Greens',
    category: 'Dinner',
    calories: 350,
    protein: 45,
    carbs: 10,
    fat: 8,
    tags: ['Seafood', 'High Protein']
  },
  {
    id: '8',
    name: 'Protein Matcha Smoothie',
    category: 'Breakfast',
    calories: 280,
    protein: 25,
    carbs: 18,
    fat: 6,
    tags: ['Smoothie', 'Matcha', 'Protein']
  }
];
