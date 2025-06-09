import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Separator } from "./ui/separator"
import { MealEntry, MealSection } from "@/lib/types"


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


interface MealsCardsProps {
  mealSections: MealSection[]
  setSelectedSection: (sectionId: string) => void
  setIsAddMealOpen: (isOpen: boolean) => void
  removeMealEntry: (entryId: string) => void
}

export function MealsCards({ mealSections, setSelectedSection, setIsAddMealOpen, removeMealEntry }: MealsCardsProps) {
    console.log('mealSections', mealSections)
  return  mealSections.map((section) => {
    const nutrition = calculateNutrition(section.meal_entries || [])
    return (
      <Card key={section.id}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{section.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {Math.round(nutrition.calories)} cal
              </Badge>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedSection(section.id)
                  setIsAddMealOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!section.meal_entries ||
          section.meal_entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No items logged
            </p>
          ) : (
            <div className="space-y-2">
              {section.meal_entries.map((entry) => {
                const entryCalories =
                  (entry.foods.calories_per_100g * entry.quantity) /
                  100
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {entry.foods.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.quantity}g •{' '}
                        {Math.round(entryCalories)} cal
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMealEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
              <Separator />
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span>{Math.round(nutrition.protein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span>{Math.round(nutrition.carbs)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fats:</span>
                  <span>{Math.round(nutrition.fats)}g</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  })
}