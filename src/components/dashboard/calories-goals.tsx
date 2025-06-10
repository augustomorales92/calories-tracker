import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalorieGoals } from '@/lib/types'

export function CaloriesGoals({
  getDayTotal,
  calorieGoals,
  handleCopyFromYesterday
}: {
  getDayTotal: () => {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  calorieGoals: CalorieGoals
  handleCopyFromYesterday: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Daily Summary</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyFromYesterday()}
        >
          Duplicate from yesterday
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(getDayTotal().calories)}
            </div>
            <div className="text-sm text-muted-foreground">
              Calories
              <span className="ml-1 text-xs">/ {calorieGoals.calories}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (getDayTotal().calories / calorieGoals.calories) * 100
                  )}%`
                }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Protein:</span>
              <span className="text-sm font-medium">
                {Math.round(getDayTotal().protein)}g / {calorieGoals.protein}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (getDayTotal().protein / calorieGoals.protein) * 100
                  )}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Carbs:</span>
              <span className="text-sm font-medium">
                {Math.round(getDayTotal().carbs)}g / {calorieGoals.carbs}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-yellow-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (getDayTotal().carbs / calorieGoals.carbs) * 100
                  )}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Fats:</span>
              <span className="text-sm font-medium">
                {Math.round(getDayTotal().fats)}g / {calorieGoals.fats}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (getDayTotal().fats / calorieGoals.fats) * 100
                  )}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
