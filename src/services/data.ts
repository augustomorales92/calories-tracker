'use server'

import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { CalorieGoals, Food } from '@/lib/types'
import { User } from '@supabase/supabase-js'


export async function getMealSections(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meal_sections')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getCalorieGoals(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateDailyGoals(userId: string, goals: CalorieGoals) {
  const supabase = await createClient()

  await supabase
    .from('daily_goals')
    .update({
      ...goals
    })
    .eq('user_id', userId)

  return goals
}

export const addFood = async (foodData: Omit<Food, 'id'>, user: User) => {
  const supabase = await createClient()
  if (!user) return

  const { error } = await supabase.from('foods').insert({
    user_id: user.id,
    name: foodData.name,
    calories_per_100g: foodData.calories_per_100g,
    protein_per_100g: foodData.protein_per_100g,
    carbs_per_100g: foodData.carbs_per_100g,
    fats_per_100g: foodData.fats_per_100g
  })

  if (!error) {
    return { success: true }
  } else {
    return { success: false, error: error.message }
  }
}

export const updateFood = async (updatedFood: Food) => {
  const supabase = await createClient()
  const { error } = await supabase
    .from('foods')
    .update({
      name: updatedFood.name,
      calories_per_100g: updatedFood.calories_per_100g,
      protein_per_100g: updatedFood.protein_per_100g,
      carbs_per_100g: updatedFood.carbs_per_100g,
      fats_per_100g: updatedFood.fats_per_100g
    })
    .eq('id', updatedFood.id)

  if (!error) {
    return { success: true }
  } else {
    return { success: false, error: error.message }
  }
}

export const deleteFood = async (foodId: string) => {
  const supabase = await createClient()
  await supabase.from('foods').delete().eq('id', foodId)
  return { success: true }
}

export const getFoods = async (user: User) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateSectionName = async (
  sectionId: string,
  newName: string,
  user: User
) => {
  const supabase = await createClient()
  if (!user) return
  await supabase
    .from('meal_sections')
    .update({ name: newName })
    .eq('id', sectionId)
    .eq('user_id', user.id)
}

export const addFoodsBulk = async (
  foodsData: Omit<Food, 'id'>[],
  user: User
) => {
  if (!user) return

  // Preparar los datos para inserción en lotes
  const foodsToInsert = foodsData.map((food) => ({
    user_id: user.id,
    name: food.name,
    calories_per_100g: food.calories_per_100g,
    protein_per_100g: food.protein_per_100g,
    carbs_per_100g: food.carbs_per_100g,
    fats_per_100g: food.fats_per_100g
  }))

  const { error } = await supabase.from('foods').insert(foodsToInsert)

  if (!error) {
    // Actualizar el estado local o refrescar los datos
    console.log(`Successfully imported ${foodsData.length} foods`)
    // fetchFoods() // Tu función para refrescar la lista
  } else {
    throw new Error('Failed to import foods')
  }
}

export const getDashboardData = async (user: User, currentDate: string) => {
  const supabase = await createClient()
  const fetchFoods = supabase
    .from('foods')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  const fetchMealSections = supabase
    .from('meal_sections')
    .select(
      `
        *,
        meal_entries!meal_entries_meal_section_id_fkey (
          *,
          foods (*)
        )
      `
    )
    .eq('user_id', user.id)
    .eq('meal_entries.date', currentDate)
    .order('order_index')

  const fetchDailyGoals = supabase
    .from('daily_goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const [
    { data: initialFoods },
    { data: initialMealSectionsData },
    { data: initialCalorieGoalsData }
  ] = await Promise.all([fetchFoods, fetchMealSections, fetchDailyGoals])

  let initialMealSections = initialMealSectionsData

  if (!initialMealSections || initialMealSections.length === 0) {
    const defaultSections = [
      { name: 'Breakfast', order_index: 0 },
      { name: 'Lunch', order_index: 1 },
      { name: 'Dinner', order_index: 2 },
      { name: 'Snack 1', order_index: 3 },
      { name: 'Snack 2', order_index: 4 },
      { name: 'Late Night', order_index: 5 }
    ]

    const { data: newSections } = await supabase.from('meal_sections').insert(
      defaultSections.map((section) => ({
        ...section,
        user_id: user.id
      }))
    )
    initialMealSections = newSections
  }

  let initialCalorieGoals = initialCalorieGoalsData
  if (!initialCalorieGoals) {
    const { data: newGoals } = await supabase
      .from('daily_goals')
      .insert({
        user_id: user.id,
        calories: 2300,
        protein: 210,
        carbs: 200,
        fats: 70
      })
      .select()
      .single()
    initialCalorieGoals = newGoals
  }

  return {
    initialFoods,
    initialMealSections,
    initialCalorieGoals
  }
}

export async function getUserProfile(user: User) {
  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let profile = profileData

  if (!profile) {
    const { data: newProfile } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || ''
    })
    profile = newProfile
  }

  return profile
}

export const addMealEntry = async (
  sectionId: string,
  foodId: string,
  quantity: number,
  user: User,
  currentDate: string
) => {
  const supabase = await createClient()
  if (!user) return

  const { error } = await supabase.from('meal_entries').insert({
    user_id: user.id,
    food_id: foodId,
    meal_section_id: sectionId,
    date: currentDate,
    quantity
  })

  if (!error) {
    return { success: true }
  }
}

export const removeMealEntry = async (entryId: string) => {
  const supabase = await createClient()
  await supabase.from('meal_entries').delete().eq('id', entryId)
  return { success: true }
}

export const copyFromYesterday = async (
  currentDate: string,
  user: User
) => {
  const supabase = await createClient()
  const yesterday = new Date(currentDate || '')
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = yesterday.toISOString().split('T')[0]
  const { data: yesterdayMealEntries } = await supabase
    .from('meal_entries')
    .select('*')
    .eq('user_id', user?.id)
    .eq('date', yesterdayDate)

  const todayMealSections = yesterdayMealEntries?.map((meal) => {
    const { id, ...rest } = meal
    return {
      ...rest,
      date: currentDate
    }
  })

  if (yesterdayMealEntries) {
    const { data: mealEntries } = await supabase
      .from('meal_entries')
      .insert(todayMealSections)
      .eq('user_id', user?.id)

    return { success: true }
  }
  return { success: false }
}
