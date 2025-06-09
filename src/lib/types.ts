export interface Food {
    id: string
    name: string
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fats_per_100g: number
  }
  
  export interface MealEntry {
    id: string
    food_id: string
    meal_section_id: string
    quantity: number
    foods: Food
  }
  
  export interface MealSection {
    id: string
    name: string
    order_index: number
    meal_entries: MealEntry[]
  }
  
  export interface CalorieGoals {
    calories: number
    protein: number
    carbs: number
    fats: number
  }