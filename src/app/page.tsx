import { CalorieTrackerClient } from '@/components/calorie-tracker-client'
import { createClient } from '@/lib/supabase/server'
import { CalorieGoals, Food, MealSection } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

const Content = ({
  currentDate,
  user,
  initialFoods,
  initialMealSections,
  initialCalorieGoals
}: {
  currentDate: string
  user: User
  initialFoods: Food[]
  initialMealSections: MealSection[]
  initialCalorieGoals: CalorieGoals
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalorieTrackerClient
        initialDate={currentDate}
        user={user}
        initialFoods={initialFoods || []}
        initialMealSections={initialMealSections || []}
        initialCalorieGoals={initialCalorieGoals}
      />
    </Suspense>
  )
}

export default async function CalorieTrackerPage({
  searchParams
}: {
  searchParams: { date: string }
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || ''
    })
  }

  // Create default meal sections if they don't exist
  const { data: sections } = await supabase
    .from('meal_sections')
    .select('*')
    .eq('user_id', user.id)

  if (!sections || sections.length === 0) {
    const defaultSections = [
      { name: 'Breakfast', order_index: 0 },
      { name: 'Lunch', order_index: 1 },
      { name: 'Dinner', order_index: 2 },
      { name: 'Snack 1', order_index: 3 },
      { name: 'Snack 2', order_index: 4 },
      { name: 'Late Night', order_index: 5 }
    ]

    await supabase.from('meal_sections').insert(
      defaultSections.map((section) => ({
        ...section,
        user_id: user.id
      }))
    )
  }

  const params = await searchParams
  const currentDate = params.date ?? new Date().toISOString().split('T')[0]

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
    { data: initialMealSections },
    { data: initialCalorieGoalsData }
  ] = await Promise.all([fetchFoods, fetchMealSections, fetchDailyGoals])

  let initialCalorieGoals = initialCalorieGoalsData

  if (!initialCalorieGoals) {
    const { data: newGoals } = await supabase
      .from('daily_goals')
      .insert({
        user_id: user.id,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 70
      })
      .select()
      .single()
    initialCalorieGoals = newGoals
  }

  return (
    <Content
      currentDate={currentDate}
      user={user}
      initialFoods={initialFoods || []}
      initialMealSections={initialMealSections || []}
      initialCalorieGoals={initialCalorieGoals}
    />
  )
}
