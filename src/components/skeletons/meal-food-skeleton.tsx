import { Skeleton } from '@/components/ui/skeleton'

export function FoodEntrySkeleton() {
  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded">
      <div className="flex-1">
        {/* Skeleton para el nombre de la comida */}
        <Skeleton className="h-5 w-32 mb-1" />
        {/* Skeleton para la información de cantidad y calorías */}
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Skeleton para el botón de eliminar */}
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  )
}
