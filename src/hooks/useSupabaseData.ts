import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { parseApFromSupa, parseSesFromSupa } from '../lib/utils'
import type { Aprendente, SessaoAgenda } from '../lib/types'

export function useSupabaseData(parentPin?: string | null) {
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([])
  const [sessoesGlobais, setSessoesGlobais] = useState<SessaoAgenda[]>([])
  const [loading, setLoading] = useState(true)
  const [isParentMode, setIsParentMode] = useState(false)
  const [parentAprendente, setParentAprendente] = useState<Aprendente | null>(null)

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true)

      if (parentPin) {
        const { data: apLogado } = await supabase
          .from('aprendentes')
          .select('*')
          .eq('magic_pin', parentPin)
          .single()

        if (apLogado) {
          const parsedAp = parseApFromSupa(apLogado)
          const { data: sesDb } = await supabase
            .from('sessoes')
            .select('*')
            .eq('aprendente_id', apLogado.id)

          setAprendentes([parsedAp])
          setSessoesGlobais(sesDb ? sesDb.map(parseSesFromSupa) : [])
          setIsParentMode(true)
          setParentAprendente(parsedAp)
        }
      } else {
        const [{ data: aps }, { data: ses }] = await Promise.all([
          supabase.from('aprendentes').select('*'),
          supabase.from('sessoes').select('*'),
        ])
        if (aps) setAprendentes(aps.map(parseApFromSupa))
        if (ses) setSessoesGlobais(ses.map(parseSesFromSupa))
      }

      setLoading(false)
    }
    fetchDados()
  }, [parentPin])

  const addAprendente = useCallback((ap: Aprendente) => {
    setAprendentes((prev) => [ap, ...prev])
  }, [])

  const updateAprendente = useCallback((updated: Aprendente) => {
    setAprendentes((prev) => prev.map((ap) => (ap.id === updated.id ? updated : ap)))
  }, [])

  const removeAprendente = useCallback((id: string) => {
    setAprendentes((prev) => prev.filter((a) => a.id !== id))
    setSessoesGlobais((prev) => prev.filter((s) => s.aprendenteId !== id))
  }, [])

  const addSessoes = useCallback((novas: SessaoAgenda[]) => {
    setSessoesGlobais((prev) => [...prev, ...novas])
  }, [])

  const updateSessaoStatus = useCallback((id: string, status: SessaoAgenda['status']) => {
    setSessoesGlobais((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }, [])

  const removeFutureSessions = useCallback((aprendenteId: string) => {
    setSessoesGlobais((prev) =>
      prev.filter((s) => {
        if (s.aprendenteId !== aprendenteId) return true
        if (s.status !== 'agendado') return true
        const dataSessao = new Date(s.dataRealizacao + 'T23:59:59')
        return dataSessao < new Date()
      })
    )
  }, [])

  return {
    aprendentes,
    sessoesGlobais,
    loading,
    isParentMode,
    parentAprendente,
    addAprendente,
    updateAprendente,
    removeAprendente,
    addSessoes,
    updateSessaoStatus,
    setSessoesGlobais,
    removeFutureSessions,
  }
}
