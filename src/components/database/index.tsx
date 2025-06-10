'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Food } from '@/lib/types'
import { addFood, addFoodsBulk, getFoods, updateFood } from '@/services/data'
import { User } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { BulkFoodImport } from '../food-bulk-import'

// Food Form Component
function FoodForm({
  onSubmit,
  initialData,
  isEditing = false,
  user
}: {
  onSubmit: (data: any, user: User) => void
  initialData?: Food
  isEditing?: boolean
  user: User
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    calories_per_100g: String(initialData?.calories_per_100g || ''),
    protein_per_100g: String(initialData?.protein_per_100g || ''),
    carbs_per_100g: String(initialData?.carbs_per_100g || ''),
    fats_per_100g: String(initialData?.fats_per_100g || '')
  })

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (value === '' || /^[0-9]*,?[0-9]*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSubmit = {
      name: formData.name,
      calories_per_100g: parseFloat(formData.calories_per_100g) || 0,
      protein_per_100g: parseFloat(formData.protein_per_100g) || 0,
      carbs_per_100g: parseFloat(formData.carbs_per_100g) || 0,
      fats_per_100g: parseFloat(formData.fats_per_100g) || 0
    }
    onSubmit(dataToSubmit, user)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Food Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="calories_per_100g">Calories per 100g</Label>
        <Input
          id="calories_per_100g"
          name="calories_per_100g"
          value={formData.calories_per_100g}
          onChange={handleNumericChange}
          inputMode="decimal"
          required
        />
      </div>

      <div>
        <Label htmlFor="protein_per_100g">Protein per 100g (g)</Label>
        <Input
          id="protein_per_100g"
          name="protein_per_100g"
          value={formData.protein_per_100g}
          onChange={handleNumericChange}
          inputMode="decimal"
          required
        />
      </div>

      <div>
        <Label htmlFor="carbs_per_100g">Carbohydrates per 100g (g)</Label>
        <Input
          id="carbs_per_100g"
          name="carbs_per_100g"
          value={formData.carbs_per_100g}
          onChange={handleNumericChange}
          inputMode="decimal"
          required
        />
      </div>

      <div>
        <Label htmlFor="fats_per_100g">Fats per 100g (g)</Label>
        <Input
          id="fats_per_100g"
          name="fats_per_100g"
          value={formData.fats_per_100g}
          onChange={handleNumericChange}
          inputMode="decimal"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Update Food' : 'Add Food'}
      </Button>
    </form>
  )
}

export default function DatabaseComponent({ user }: { user: User }) {
  const [search, setSearch] = useState('')
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const queryClient = useQueryClient()

  const { data: foods, isLoading: isFoodsLoading } = useQuery({
    queryKey: ['foods', user.id],
    queryFn: () => getFoods(user)
  })

  const { mutate: deleteFoodMutation } = useMutation({
    mutationFn: (foodId: string) => deleteFood(foodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods', user.id] })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const deleteFood = async (foodId: string) => {
    await deleteFoodMutation(foodId)
  }

  if (isFoodsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 space-y-4 h-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2">
        <span className="flex w-full">
          <Input
            placeholder="Search food"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </span>
        <span className="flex items-center justify-between md:justify-end gap-2 w-full">
          <Button onClick={() => setIsAddFoodOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Food
          </Button>
          <Button onClick={() => setIsImportOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Import from Excel
          </Button>
        </span>
      </div>

      <ScrollArea className="h-full min-h-[calc(100vh-200px)]">
        <div className="space-y-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {foods
            ?.filter((food) =>
              food.name.toLowerCase().includes(search.toLowerCase())
            )
            ?.map((food) => (
              <Card key={food.id} className="p-2">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{food.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {food.calories_per_100g} cal/100g
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        P: {food.protein_per_100g}g • C: {food.carbs_per_100g}g
                        • F: {food.fats_per_100g}g
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFood(food)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFood(food.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </ScrollArea>

      {/* Add Food Dialog */}
      <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Food</DialogTitle>
          </DialogHeader>
          <FoodForm onSubmit={addFood} user={user} />
        </DialogContent>
      </Dialog>

      <BulkFoodImport
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={(foods) => addFoodsBulk(foods, user)}
        user={user}
      />

      {/* Edit Food Dialog */}
      <Dialog open={!!editingFood} onOpenChange={() => setEditingFood(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Food</DialogTitle>
          </DialogHeader>
          {editingFood && (
            <FoodForm
              initialData={editingFood}
              onSubmit={(data) => updateFood(data)}
              user={user}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
