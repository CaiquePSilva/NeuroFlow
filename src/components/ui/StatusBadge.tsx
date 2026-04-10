import { Clock, Play, CheckCircle, Ban, RefreshCw } from 'lucide-react'
import type { StatusType } from '../../lib/types'

interface StatusBadgeProps {
  status: StatusType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'agendado':
      return (
        <span className="badge badge-agendado">
          <Clock size={12} /> Agendado
        </span>
      )
    case 'andamento':
      return (
        <span className="badge badge-andamento">
          <Play size={12} /> Em Andamento
        </span>
      )
    case 'pago':
      return (
        <span className="badge badge-pago">
          <CheckCircle size={12} /> Pago
        </span>
      )
    case 'cancelado':
      return (
        <span className="badge badge-cancelado">
          <Ban size={12} /> Cancelada
        </span>
      )
    case 'remarcado':
      return (
        <span className="badge badge-remarcado">
          <RefreshCw size={12} /> Remarcada
        </span>
      )
    default:
      return null
  }
}
