import { http } from "@/services/http"
import type { ActionLog, Approval, Finding, Integration, Rule } from "@/types/api"

/**
 * Typed API wrapper functions will live here.
 * Keep it thin: request/response DTOs in `src/types/`, error mapping in `src/services/`.
 */
export const api = {
  health: async () => {
    const res = await http.get<{ status: string }>("/health")
    return res.data
  },
  findings: async () => {
    const res = await http.get<{ findings?: Finding[] }>("/findings")
    return res.data.findings ?? []
  },
  rules: async () => {
    const res = await http.get<{ rules?: Rule[] }>("/rules")
    return res.data.rules ?? []
  },
  actions: async () => {
    const res = await http.get<{ actions?: ActionLog[] }>("/actions/logs")
    return res.data.actions ?? []
  },
  approvals: async () => {
    const res = await http.get<{ approvals?: Approval[] }>("/approvals")
    return res.data.approvals ?? []
  },
  approve: async (id: string) => {
    const res = await http.post<Approval>(`/approvals/${id}/approve`, {})
    return res.data
  },
  reject: async (id: string) => {
    const res = await http.post<Approval>(`/approvals/${id}/reject`, {})
    return res.data
  },
  integrations: async () => {
    // Backend connection routes are action-oriented today, so the UI keeps a
    // client-side integration summary and augments it as endpoints evolve.
    return [] as Integration[]
  },
  awsMockData: async () => {
    const res = await http.get("/integrations/aws/mock-data")
    return res.data
  },
}
