"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from "@supabase/supabase-js"

interface Food {
  id?: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fats_per_100g: number
}

interface ParsedFood extends Omit<Food, "id"> {
  rowIndex: number
  isValid: boolean
  errors: string[]
}

interface BulkFoodImportProps {
  onImport: (foods: Omit<Food, "id">[]) => Promise<void>
  isOpen: boolean
  onClose: () => void
  user: User
}

export function BulkFoodImport({ onImport, isOpen, onClose, user }: BulkFoodImportProps) {
  const [parsedFoods, setParsedFoods] = useState<ParsedFood[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [fileName, setFileName] = useState<string>("")

  const validateFood = (food: any, rowIndex: number): ParsedFood => {
    const errors: string[] = []

    if (!food.name || typeof food.name !== "string" || food.name.trim() === "") {
      errors.push("Nombre requerido")
    }

    const calories = Number.parseFloat(food.calories_per_100g)
    if (isNaN(calories) || calories < 0) {
      errors.push("Calorías inválidas")
    }

    const protein = Number.parseFloat(food.protein_per_100g)
    if (isNaN(protein) || protein < 0) {
      errors.push("Proteínas inválidas")
    }

    const carbs = Number.parseFloat(food.carbs_per_100g)
    if (isNaN(carbs) || carbs < 0) {
      errors.push("Carbohidratos inválidos")
    }

    const fats = Number.parseFloat(food.fats_per_100g)
    if (isNaN(fats) || fats < 0) {
      errors.push("Grasas inválidas")
    }

    return {
      name: food.name?.toString().trim() || "",
      calories_per_100g: calories || 0,
      protein_per_100g: protein || 0,
      carbs_per_100g: carbs || 0,
      fats_per_100g: fats || 0,
      rowIndex,
      isValid: errors.length === 0,
      errors,
    }
  }

  const parseExcelFile = useCallback((file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Asumimos que la primera fila son los headers
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]

        const foods: ParsedFood[] = rows
          .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
          .map((row, index) => {
            const foodData = {
              name: row[0], // Columna A: Alimento
              calories_per_100g: row[1], // Columna B: Calorías
              protein_per_100g: row[2], // Columna C: Proteínas
              fats_per_100g: row[3], // Columna D: Grasas
              carbs_per_100g: row[4], // Columna E: Carbohidratos
            }

            return validateFood(foodData, index + 2) // +2 porque empezamos desde la fila 2
          })

        setParsedFoods(foods)
        setFileName(file.name)
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        setImportStatus("error")
      }
    }

    reader.readAsArrayBuffer(file)
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        parseExcelFile(file)
      }
    },
    [parseExcelFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const handleImport = async () => {
    const validFoods = parsedFoods.filter((food) => food.isValid)

    if (validFoods.length === 0) {
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulamos progreso durante la importación
      const batchSize = 10
      const batches = []

      for (let i = 0; i < validFoods.length; i += batchSize) {
        batches.push(validFoods.slice(i, i + batchSize))
      }

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i].map(({ rowIndex, isValid, errors, ...food }) => food)
        await onImport(batch)
        setProgress(((i + 1) / batches.length) * 100)
      }

      setImportStatus("success")
      setTimeout(() => {
        onClose()
        setParsedFoods([])
        setFileName("")
        setImportStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error importing foods:", error)
      setImportStatus("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const validCount = parsedFoods.filter((food) => food.isValid).length
  const invalidCount = parsedFoods.length - validCount

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] m-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Importar Alimentos desde Excel</CardTitle>
            <CardDescription>Arrastra un archivo Excel (.xlsx, .xls) o CSV con los datos de alimentos</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {parsedFoods.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo Excel aquí"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar un archivo</p>
                </div>
                <div className="text-xs text-muted-foreground">Formatos soportados: .xlsx, .xls, .csv</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <span className="font-medium">{fileName}</span>
                <Badge variant="secondary">{parsedFoods.length} filas</Badge>
                {validCount > 0 && (
                  <Badge variant="default" className="bg-green-500">
                    {validCount} válidas
                  </Badge>
                )}
                {invalidCount > 0 && <Badge variant="destructive">{invalidCount} con errores</Badge>}
              </div>

              {importStatus === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>¡Alimentos importados exitosamente!</AlertDescription>
                </Alert>
              )}

              {importStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error al importar los alimentos. Por favor, inténtalo de nuevo.</AlertDescription>
                </Alert>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importando alimentos...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <ScrollArea className="h-64 border rounded-md">
                <div className="p-4">
                  <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <div>Fila</div>
                    <div>Nombre</div>
                    <div>Calorías</div>
                    <div>Proteínas</div>
                    <div>Grasas</div>
                    <div>Carbohidratos</div>
                  </div>
                  {parsedFoods.map((food, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-6 gap-2 text-xs py-2 border-b ${
                        food.isValid ? "text-foreground" : "text-destructive"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {food.rowIndex}
                        {food.isValid ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                      <div className="truncate" title={food.name}>
                        {food.name || "-"}
                      </div>
                      <div>{food.calories_per_100g}</div>
                      <div>{food.protein_per_100g}</div>
                      <div>{food.fats_per_100g}</div>
                      <div>{food.carbs_per_100g}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsedFoods([])
                    setFileName("")
                    setImportStatus("idle")
                  }}
                >
                  Cargar otro archivo
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImport} disabled={validCount === 0 || isProcessing}>
                    {isProcessing ? "Importando..." : `Importar ${validCount} alimentos`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
