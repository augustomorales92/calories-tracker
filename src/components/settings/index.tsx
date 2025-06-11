'use client'
import { CalorieGoals, MealSection } from '@/lib/types'
import {
  getCalorieGoals,
  getMealSections,
  updateDailyGoals,
  updateSectionName
} from '@/services/data'
import type { User } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import LoadingComponent from '../Loading'

function SettingsComponent({
  updateSectionName,
  calorieGoals,
  mealSections,
  isEditing,
  setIsEditing,
  updateDailyGoalsMutation,
  user
}: {
  updateSectionName: (sectionId: string, newName: string, user: User) => void
  calorieGoals: CalorieGoals
  mealSections: MealSection[] | undefined
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  updateDailyGoalsMutation: (goals: CalorieGoals) => void
  user: User
}) {
  const [newCalorieGoals, setNewCalorieGoals] = useState<CalorieGoals>({
    calories: calorieGoals?.calories || 0,
    protein: calorieGoals?.protein || 0,
    carbs: calorieGoals?.carbs || 0,
    fats: calorieGoals?.fats || 0
  })

  const handleUpdateDailyGoals = () => {
    updateDailyGoalsMutation(newCalorieGoals)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Daily Goals</CardTitle>
          {isEditing ? (
            <Button variant="outline" onClick={() => handleUpdateDailyGoals()}>
              Save
              <CheckIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="calorie-goal">Daily Calorie Goal</Label>
            <Input
              id="calorie-goal"
              inputMode="decimal"
              value={newCalorieGoals.calories}
              disabled={!isEditing}
              onChange={(e) =>
                setNewCalorieGoals({
                  ...newCalorieGoals,
                  calories: Number(e.target.value)
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="protein-goal">Daily Protein Goal (g)</Label>
            <Input
              id="protein-goal"
              inputMode="decimal"
              value={newCalorieGoals.protein}
              disabled={!isEditing}
              onChange={(e) =>
                setNewCalorieGoals({
                  ...newCalorieGoals,
                  protein: Number(e.target.value)
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="carbs-goal">Daily Carbs Goal (g)</Label>
            <Input
              id="carbs-goal"
              inputMode="decimal"
              value={newCalorieGoals.carbs}
              disabled={!isEditing}
              onChange={(e) =>
                setNewCalorieGoals({
                  ...newCalorieGoals,
                  carbs: Number(e.target.value)
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="fats-goal">Daily Fats Goal (g)</Label>
            <Input
              id="fats-goal"
              inputMode="decimal"
              value={newCalorieGoals.fats}
              disabled={!isEditing}
              onChange={(e) =>
                setNewCalorieGoals({
                  ...newCalorieGoals,
                  fats: Number(e.target.value)
                })
              }
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Meal Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mealSections?.map((section) => (
            <div key={section.id} className="flex items-center gap-2">
              <Input
                value={section.name}
                onChange={(e) =>
                  updateSectionName(section.id, e.target.value, user)
                }
                className="flex-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  const { data: calorieGoals, isLoading: isCalorieGoalsLoading } = useQuery({
    queryKey: ['calorieGoals', user.id],
    queryFn: () => getCalorieGoals(user.id)
  })

  const { data: mealSections, isLoading: isMealSectionsLoading } = useQuery({
    queryKey: ['malSections', user.id],
    queryFn: () => getMealSections(user.id)
  })

  const { mutate: updateDailyGoalsMutation } = useMutation({
    mutationFn: (goals: CalorieGoals) => updateDailyGoals(user.id, goals),
    onSuccess: () => {
      setIsEditing(false)
      toast.success('Daily goals updated')
      queryClient.invalidateQueries({ queryKey: ['calorieGoals', user.id] })
    },
    onError: () => {
      toast.error('Failed to update daily goals')
    }
  })

  if (isMealSectionsLoading || isCalorieGoalsLoading) {
    return <LoadingComponent />
  }

  return (
    <SettingsComponent
      updateSectionName={updateSectionName}
      calorieGoals={calorieGoals}
      mealSections={mealSections}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      updateDailyGoalsMutation={updateDailyGoalsMutation}
      user={user}
    />
  )
}
