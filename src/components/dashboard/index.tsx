'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { MealEntry } from '@/lib/types'
import {
  addMealEntry,
  copyFromYesterday,
  getDashboardData,
  removeMealEntry
} from '@/services/data'
import type { User } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import DateSelector from '../date/date-selector'
import { MealsCards } from '../meals-cards'
import { DashboardSkeleton } from '../skeletons/dashboard-skeleton'
import { CaloriesGoals } from './calories-goals'
import { MealForm } from './meal-form'

interface CalorieTrackerClientProps {
  user: User
  initialDate: string
}

export default function Dashboard({
  user,
  initialDate
}: CalorieTrackerClientProps) {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard', user?.id, initialDate],
    queryFn: () => getDashboardData(user, initialDate)
  })
  const {
    initialFoods: foods,
    initialMealSections: mealSections,
    initialCalorieGoals: calorieGoals
  } = dashboardData || {
    initialFoods: [],
    initialMealSections: [],
    initialCalorieGoals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    }
  }
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState<string | null>(initialDate)
  const [isAddMealOpen, setIsAddMealOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>('')

  const calculateNutrition = (entries: MealEntry[]) => {
    return entries.reduce(
      (total, entry) => {
        const multiplier = entry.quantity / 100
        return {
          calories: total.calories + entry.foods.calories_per_100g * multiplier,
          protein: total.protein + entry.foods.protein_per_100g * multiplier,
          carbs: total.carbs + entry.foods.carbs_per_100g * multiplier,
          fats: total.fats + entry.foods.fats_per_100g * multiplier
        }
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }

  const getDayTotal = () => {
    return mealSections?.reduce(
      (total, section) => {
        const sectionNutrition = calculateNutrition(section.meal_entries || [])
        return {
          calories: total.calories + sectionNutrition.calories,
          protein: total.protein + sectionNutrition.protein,
          carbs: total.carbs + sectionNutrition.carbs,
          fats: total.fats + sectionNutrition.fats
        }
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }

  const { mutate: addMealEntryMutation, isPending: isAddingMealEntry } =
    useMutation({
      mutationFn: ({
        foodId,
        quantity
      }: {
        foodId: string
        quantity: number
      }) =>
        addMealEntry(
          selectedSection,
          foodId,
          quantity,
          user,
          currentDate || ''
        ),
      onSuccess: () => {
        setIsAddMealOpen(false)
        queryClient.invalidateQueries({
          queryKey: ['dashboard', user?.id, currentDate]
        })
        toast.success('Added meal entry')
      },
      onError: (error) => {
        console.error(error)
        toast.error('Failed to add meal entry')
      }
    })

  const {
    mutate: handleCopyFromYesterdayMutation,
    isPending: isCopyingFromYesterday
  } = useMutation({
    mutationFn: () => copyFromYesterday(currentDate || '', user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard', user?.id, currentDate]
      })
      toast.success('Copied from yesterday')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to copy from yesterday')
    }
  })

  const { mutate: removeMealEntryMutation, isPending: isRemovingMealEntry } =
    useMutation({
      mutationFn: (entryId: string) => removeMealEntry(entryId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['dashboard', user?.id, currentDate]
        })
        toast.success('Removed meal entry')
      },
      onError: (error) => {
        console.error(error)
        toast.error('Failed to remove meal entry')
      }
    })

  const handleAddMealEntry = (foodId: string, quantity: number) => {
    addMealEntryMutation({ foodId, quantity })
  }

  const handleRemoveMealEntry = (entryId: string) => {
    removeMealEntryMutation(entryId)
  }

  const handleCopyFromYesterday = () => {
    handleCopyFromYesterdayMutation()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 space-y-4">
        <DateSelector
          currentDate={currentDate || ''}
          setCurrentDate={setCurrentDate}
        />
        {isLoadingDashboard ? (
          <DashboardSkeleton />
        ) : (
          <>
            <CaloriesGoals
              getDayTotal={getDayTotal}
              calorieGoals={calorieGoals}
              handleCopyFromYesterday={handleCopyFromYesterday}
            />

            {/* Meal Sections */}
            <div className="space-y-4">
              <MealsCards
                mealSections={mealSections}
                setSelectedSection={setSelectedSection}
                setIsAddMealOpen={setIsAddMealOpen}
                removeMealEntry={handleRemoveMealEntry}
                isLoading={
                  isRemovingMealEntry ||
                  isAddingMealEntry ||
                  isCopyingFromYesterday
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Food to Meal</DialogTitle>
          </DialogHeader>
          <MealForm foods={foods || []} onSubmit={handleAddMealEntry} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
