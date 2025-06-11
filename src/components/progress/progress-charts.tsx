"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { supabase } from "@/lib/supabase"
import { format, subDays, parseISO } from "date-fns"
import LoadingComponent from "../Loading"

interface DailyNutrition {
  date: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

interface WeightEntry {
  date: string
  weight: number
}

export function ProgressCharts({ userId }: { userId: string }) {
  const [nutritionData, setNutritionData] = useState<DailyNutrition[]>([])
  const [weightData, setWeightData] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgressData()
  }, [userId])

  const fetchProgressData = async () => {
    setLoading(true)

    // Get last 30 days of data
    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd")

    // Fetch nutrition data
    const { data: mealEntries } = await supabase
      .from("meal_entries")
      .select(`
        date,
        quantity,
        foods (
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fats_per_100g
        )
      `)
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo)
      .order("date")

    // Process nutrition data
    const nutritionMap = new Map<string, DailyNutrition>()

    mealEntries?.forEach((entry: any) => {
      const date = entry.date
      const multiplier = entry.quantity / 100

      if (!nutritionMap.has(date)) {
        nutritionMap.set(date, {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        })
      }

      const dayData = nutritionMap.get(date)!
      dayData.calories += entry.foods.calories_per_100g * multiplier
      dayData.protein += entry.foods.protein_per_100g * multiplier
      dayData.carbs += entry.foods.carbs_per_100g * multiplier
      dayData.fats += entry.foods.fats_per_100g * multiplier
    })

    setNutritionData(Array.from(nutritionMap.values()).sort((a, b) => a.date.localeCompare(b.date)))

    // Fetch weight data
    const { data: weightEntries } = await supabase
      .from("weight_entries")
      .select("date, weight")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo)
      .order("date")

    setWeightData(weightEntries || [])
    setLoading(false)
  }

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <div className="space-y-6">
      {/* Calorie Intake Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Calorie Intake</CardTitle>
          <CardDescription>Your calorie consumption over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              calories: {
                label: "Calories",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), "MMM dd")} />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => format(parseISO(value as string), "MMM dd, yyyy")}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="var(--color-calories)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Macronutrient Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrient Breakdown</CardTitle>
          <CardDescription>Daily protein, carbs, and fats intake</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              protein: {
                label: "Protein",
                color: "hsl(var(--chart-2))",
              },
              carbs: {
                label: "Carbs",
                color: "hsl(var(--chart-3))",
              },
              fats: {
                label: "Fats",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), "MMM dd")} />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => format(parseISO(value as string), "MMM dd, yyyy")}
                />
                <Line type="monotone" dataKey="protein" stroke="var(--color-protein)" strokeWidth={2} />
                <Line type="monotone" dataKey="carbs" stroke="var(--color-carbs)" strokeWidth={2} />
                <Line type="monotone" dataKey="fats" stroke="var(--color-fats)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Weight Progress Chart */}
      {weightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>Your weight changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                weight: {
                  label: "Weight",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), "MMM dd")} />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => format(parseISO(value as string), "MMM dd, yyyy")}
                  />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Weekly Calorie Average */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Average Calories</CardTitle>
          <CardDescription>Average daily calories by week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              avgCalories: {
                label: "Avg Calories",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getWeeklyAverages(nutritionData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgCalories" fill="var(--color-avgCalories)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function getWeeklyAverages(data: DailyNutrition[]) {
  const weeks = new Map<string, { total: number; count: number }>()

  data.forEach((day) => {
    const date = parseISO(day.date)
    const weekStart = format(subDays(date, date.getDay()), "MMM dd")

    if (!weeks.has(weekStart)) {
      weeks.set(weekStart, { total: 0, count: 0 })
    }

    const week = weeks.get(weekStart)!
    week.total += day.calories
    week.count += 1
  })

  return Array.from(weeks.entries()).map(([week, data]) => ({
    week,
    avgCalories: Math.round(data.total / data.count),
  }))
}
