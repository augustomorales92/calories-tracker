import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CaloriesGoalsSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Daily Summary</CardTitle>
        <Skeleton className="h-9 w-44 rounded-md animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Left column - Calories section */}
          <div className="text-center">
            <Skeleton className="h-8 w-16 mx-auto mb-1 animate-pulse" />
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Calories
              <Skeleton className="h-3 w-12 animate-pulse" />
            </div>
            {/* Progress bar with subtle animation */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div className="bg-gray-300 h-2.5 rounded-full animate-pulse w-1/4"></div>
            </div>
          </div>

          {/* Right column - Macros section */}
          <div className="space-y-2">
            {/* Protein */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Protein:</span>
              <Skeleton className="h-4 w-16 animate-pulse" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gray-300 h-1.5 rounded-full animate-pulse w-1/3"></div>
            </div>

            {/* Carbs */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Carbs:</span>
              <Skeleton className="h-4 w-16 animate-pulse" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gray-300 h-1.5 rounded-full animate-pulse w-1/2"></div>
            </div>

            {/* Fats */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Fats:</span>
              <Skeleton className="h-4 w-16 animate-pulse" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gray-300 h-1.5 rounded-full animate-pulse w-1/4"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen  max-w-md mx-auto">
      <div className="my-4">
        <CaloriesGoalsSkeleton />
      </div>
      <div className="space-y-4">
        {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
          <div key={meal} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-20" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {index === 2 && (
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              )}
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
