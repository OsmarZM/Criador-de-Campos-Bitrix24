"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type EntityType = "leads" | "deals" | "contacts" | "companies"
type FieldType = "string" | "integer" | "double" | "file" | "boolean" | "enumeration"

interface LogEntry {
  id: string
  timestamp: string
  url: string
  payload: string
  status: number
  response: string
  type: "success" | "error"
}

const ENTITY_MAP: Record<EntityType, string> = {
  leads: "lead",
  deals: "deal",
  contacts: "contact",
  companies: "company",
}

const METHOD_MAP: Record<string, string> = {
  lead: "crm.lead.userfield.add",
  deal: "crm.deal.userfield.add",
  contact: "crm.contact.userfield.add",
  company: "crm.company.userfield.add",
}

export default function BitrixFieldCreator() {
  const [webhook, setWebhook] = useState("")
  const [fieldName, setFieldName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [entity, setEntity] = useState<EntityType>("leads")
  const [fieldType, setFieldType] = useState<FieldType>("string")
  const [listOptions, setListOptions] = useState("")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const sanitizeFieldName = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9_]/g, "_")
      .toUpperCase()
  }

  const addLog = (entry: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString("pt-BR"),
    }
    setLogs((prev) => [newLog, ...prev])
  }

  const createFields = async () => {
    if (!webhook || !fieldName) {
      setError("Por favor, preencha o webhook e o nome do campo")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      // Parse webhook URL
      const webhookMatch = webhook.match(/^(https?:\/\/[^/]+\/rest)\/(\d+)\/([^/]+)\/?$/)
      if (!webhookMatch) {
        throw new Error("Formato de webhook inválido. Use: https://dominio.bitrix24.com.br/rest/userId/token")
      }

      const [, apiUrl, userId, token] = webhookMatch
      const entityCode = ENTITY_MAP[entity]
      const method = METHOD_MAP[entityCode]
      const sanitizedName = sanitizeFieldName(fieldName)

      // Parse list options if field type is enumeration
      let listValues: { VALUE: string }[] = []
      if (fieldType === "enumeration" && listOptions) {
        listValues = listOptions.split(",").map((opt) => ({ VALUE: opt.trim() }))
      }

      // Create fields
      for (let i = 1; i <= quantity; i++) {
        const fieldNumber = String(i).padStart(3, "0")
        const fullFieldName = `UF_CRM_${entityCode.toUpperCase()}_${sanitizedName}_${fieldNumber}`

        const payload: any = {
          fields: {
            FIELD_NAME: fullFieldName,
            USER_TYPE_ID: fieldType,
            EDIT_FORM_LABEL: {
              pt: `${fieldName} ${fieldNumber}`,
            },
            LIST_FILTER_LABEL: {
              pt: `${fieldName} ${fieldNumber}`,
            },
          },
        }

        if (fieldType === "enumeration" && listValues.length > 0) {
          payload.fields.LIST = listValues
        }

        const url = `${apiUrl}/${userId}/${token}/${method}.json`

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })

          const data = await response.json()

          addLog({
            url,
            payload: JSON.stringify(payload, null, 2),
            status: response.status,
            response: JSON.stringify(data, null, 2),
            type: response.ok ? "success" : "error",
          })

          // Small delay to avoid rate limiting
          if (i < quantity) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        } catch (err) {
          addLog({
            url,
            payload: JSON.stringify(payload, null, 2),
            status: 0,
            response: err instanceof Error ? err.message : "Erro desconhecido",
            type: "error",
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar a requisição")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Criador de Campos Bitrix24</h1>
          <p className="text-muted-foreground">Crie campos personalizados em massa usando a API REST do Bitrix24</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração dos Campos</CardTitle>
              <CardDescription>Preencha os dados para criar os campos personalizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook do Bitrix24</Label>
                <Input
                  id="webhook"
                  placeholder="https://empresa.bitrix24.com.br/rest/163/abc123xyz/"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldName">Nome Base do Campo</Label>
                <Input
                  id="fieldName"
                  placeholder="Ex: NF, Arquivo, Documento"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade de Campos</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Entidade de Destino</Label>
                <Select value={entity} onValueChange={(value: EntityType) => setEntity(value)}>
                  <SelectTrigger id="entity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="deals">Negócios</SelectItem>
                    <SelectItem value="contacts">Contatos</SelectItem>
                    <SelectItem value="companies">Empresas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldType">Tipo do Campo</Label>
                <Select value={fieldType} onValueChange={(value: FieldType) => setFieldType(value)}>
                  <SelectTrigger id="fieldType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Texto</SelectItem>
                    <SelectItem value="integer">Número</SelectItem>
                    <SelectItem value="double">Decimal</SelectItem>
                    <SelectItem value="file">Arquivo</SelectItem>
                    <SelectItem value="boolean">Sim/Não</SelectItem>
                    <SelectItem value="enumeration">Lista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fieldType === "enumeration" && (
                <div className="space-y-2">
                  <Label htmlFor="listOptions">Opções da Lista</Label>
                  <Input
                    id="listOptions"
                    placeholder="Opção 1, Opção 2, Opção 3"
                    value={listOptions}
                    onChange={(e) => setListOptions(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Separe as opções por vírgula</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={createFields} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando campos...
                  </>
                ) : (
                  "Criar Campos no Bitrix24"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Logs Section */}
          <Card className="lg:max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Logs de Execução</CardTitle>
              <CardDescription>Acompanhe as requisições e respostas da API</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhum log ainda</p>
                  <p className="text-sm mt-2">Os logs aparecerão aqui após criar os campos</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.type === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-xs font-medium text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          log.type === "success"
                            ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {log.status || "ERROR"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-semibold text-foreground mb-1">URL:</p>
                        <p className="font-mono text-muted-foreground break-all">{log.url}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Payload:</p>
                        <pre className="bg-muted p-2 rounded overflow-x-auto text-muted-foreground">{log.payload}</pre>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Resposta:</p>
                        <pre className="bg-muted p-2 rounded overflow-x-auto text-muted-foreground">{log.response}</pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
