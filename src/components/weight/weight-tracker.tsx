"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { Plus, Trash2, Camera } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface WeightEntry {
  id: string
  weight: number
  date: string
  notes: string | null
}

interface ProgressPhoto {
  id: string
  photo_url: string
  date: string
  notes: string | null
}

export function WeightTracker({ userId }: { userId: string }) {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([])
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false)
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWeightData()
    fetchProgressPhotos()
  }, [userId])

  const fetchWeightData = async () => {
    const { data } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    setWeightEntries(data || [])
  }

  const fetchProgressPhotos = async () => {
    const { data } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (data) {
      // Get signed URLs for photos
      const photosWithUrls = await Promise.all(
        data.map(async (photo) => {
          const { data: signedUrl } = await supabase.storage
            .from("progress-photos")
            .createSignedUrl(photo.photo_url, 3600)

          return {
            ...photo,
            photo_url: signedUrl?.signedUrl || photo.photo_url,
          }
        }),
      )
      setProgressPhotos(photosWithUrls)
    }
  }

  const addWeightEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const weight = Number.parseFloat(formData.get("weight") as string)
    const date = formData.get("date") as string
    const notes = formData.get("notes") as string

    const { error } = await supabase.from("weight_entries").insert({
      user_id: userId,
      weight,
      date,
      notes: notes || null,
    })

    if (!error) {
      setIsAddWeightOpen(false)
      fetchWeightData()
    }

    setLoading(false)
  }

  const deleteWeightEntry = async (id: string) => {
    await supabase.from("weight_entries").delete().eq("id", id)

    fetchWeightData()
  }

  const uploadProgressPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get("photo") as File
    const date = formData.get("date") as string
    const notes = formData.get("notes") as string

    if (file) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("progress-photos").upload(fileName, file)

      if (!uploadError) {
        const { error: dbError } = await supabase.from("progress_photos").insert({
          user_id: userId,
          photo_url: fileName,
          date,
          notes: notes || null,
        })

        if (!dbError) {
          setIsAddPhotoOpen(false)
          fetchProgressPhotos()
        }
      }
    }

    setLoading(false)
  }

  const deleteProgressPhoto = async (id: string, photoUrl: string) => {
    // Delete from storage
    await supabase.storage.from("progress-photos").remove([photoUrl])

    // Delete from database
    await supabase.from("progress_photos").delete().eq("id", id)

    fetchProgressPhotos()
  }

  const latestWeight = weightEntries[0]?.weight
  const previousWeight = weightEntries[1]?.weight
  const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : null

  return (
    <div className="space-y-6">
      {/* Weight Summary */}
      <Card>
        <CardHeader className="flex items-center justify-center">
          <CardTitle>Weight Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{latestWeight ? `${latestWeight} kg` : "No data"}</div>
              <div className="text-sm text-muted-foreground">Current Weight</div>
            </div>
            <div className="text-center">
              {weightChange !== null && (
                <>
                  <div className={`text-2xl font-bold ${weightChange > 0 ? "text-red-600" : "text-green-600"}`}>
                    {weightChange > 0 ? "+" : ""}
                    {weightChange.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-muted-foreground">Change</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weight Entries</CardTitle>
            <Button onClick={() => setIsAddWeightOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Weight
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {weightEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <div className="font-medium">{entry.weight} kg</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(entry.date), "MMM dd, yyyy")}</div>
                    {entry.notes && <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteWeightEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Progress Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress Photos</CardTitle>
            <Button onClick={() => setIsAddPhotoOpen(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {progressPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <Image
                  src={photo.photo_url || "/placeholder.svg"}
                  alt="Progress photo"
                  className="w-full h-48 object-cover rounded"
                  width={100}
                  height={100}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProgressPhoto(photo.id, photo.photo_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary">{format(new Date(photo.date), "MMM dd, yyyy")}</Badge>
                  {photo.notes && <p className="text-sm text-muted-foreground mt-1">{photo.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Weight Dialog */}
      <Dialog open={isAddWeightOpen} onOpenChange={setIsAddWeightOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Weight Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={addWeightEntry} className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" name="weight" type="number" step="0.1" required placeholder="70.5" />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" name="notes" placeholder="Any notes about this weigh-in..." />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Add Weight Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Photo Dialog */}
      <Dialog open={isAddPhotoOpen} onOpenChange={setIsAddPhotoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Photo</DialogTitle>
          </DialogHeader>
          <form onSubmit={uploadProgressPhoto} className="space-y-4">
            <div>
              <Label htmlFor="photo">Photo</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" required />
            </div>
            <div>
              <Label htmlFor="photo-date">Date</Label>
              <Input
                id="photo-date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="photo-notes">Notes (optional)</Label>
              <Textarea id="photo-notes" name="notes" placeholder="Any notes about this photo..." />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Upload Photo
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
