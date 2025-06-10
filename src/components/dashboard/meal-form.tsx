import { Food } from "@/lib/types"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MealForm({
    foods,
    onSubmit
  }: {
    foods: Food[]
    onSubmit: (foodId: string, quantity: number) => void
  }) {
    const [selectedFoodId, setSelectedFoodId] = useState('')
    const [quantity, setQuantity] = useState(100)
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedFoodId) {
        onSubmit(selectedFoodId, quantity)
      }
    }
  
    const selectedFood = foods.find((f) => f.id === selectedFoodId)
  
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="w-full">
          <Label htmlFor="food">Select Food</Label>
          <Combobox
            items={foods.map((food) => ({
              value: food.id,
              label: `${food.name} (${food.calories_per_100g} cal/100g)`
            }))}
            value={selectedFoodId}
            onValueChange={setSelectedFoodId}
            placeholder="Search for a food..."
            emptyText="No foods found"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity (grams)</Label>
          <Input
            id="quantity"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>
        {selectedFood && (
          <div className="p-3 bg-muted rounded">
            <h4 className="font-medium mb-2">Nutrition Preview</h4>
            <div className="text-sm space-y-1">
              <div>
                Calories:{' '}
                {Math.round((selectedFood.calories_per_100g * quantity) / 100)}
              </div>
              <div>
                Protein:{' '}
                {Math.round((selectedFood.protein_per_100g * quantity) / 100)}g
              </div>
              <div>
                Carbs:{' '}
                {Math.round((selectedFood.carbs_per_100g * quantity) / 100)}g
              </div>
              <div>
                Fats: {Math.round((selectedFood.fats_per_100g * quantity) / 100)}g
              </div>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full">
          Add to Meal
        </Button>
      </form>
    )
  }
  