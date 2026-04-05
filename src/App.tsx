import { useState, useEffect } from 'react'
import { Home, Calendar, Users, Plus, Clock, UserPlus, ArrowLeft, Settings, CheckCircle } from 'lucide-react'
import './App.css'
import './form-styles.css'

type StatusType = 'agendado' | 'andamento' | 'pago'



export interface SessaoAgenda {
  id: string
  aprendenteId: string
  nomeAprendente: string // Guardamos para não ter que buscar toda hora
  tipoSessao: string // Copia pra historico
  dataRealizacao: string // YYYY-MM-DD
  horaInicio: string // HH:mm
  horaFim: string // Calculado: HH:mm
  status: StatusType
  valor: string // Histórico do valor
}

export interface Aprendente {
  id: string
  nome: string
  dataOuIdade: string
  responsavel1: string
  responsavel2: string
  contato: string
  motivo: string
  tipoSessao?: 'Avaliação' | 'Intervenção' | ''
  qtdSessoesAvaliacao?: number
  formaPagamento?: 'Por Sessão' | 'Pacote Mensal' | 'Avaliação Completa' | ''
  valorReferencia?: string
  duracaoMinutos?: string
  status?: 'ativo' | 'inativo'
  motivoEncerramento?: string
  dataEncerramento?: string
  metodoPagamento?: string
}

const MOTIVOS_ENCERRAMENTO = [
  "Alta Clínica/Pedagógica (Objetivos alcançados)",
  "Desistência - Fator Financeiro/Custo",
  "Desistência - Incompatibilidade de Horários",
  "Desistência - Mudança de Cidade/Logística",
  "Encaminhamento para outro profissional",
  "Pausa temporária (Trancamento)",
  "Outros"
];

function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'novo-aprendente' | 'detalhe-aprendente' | 'agendar-sessao' | 'encerrar-aprendente' | 'agendamento-rapido-selecionar' | 'agendamento-rapido-form' | 'perfil-aprendente'>('dashboard')
  const [selectedAprendente, setSelectedAprendente] = useState<Aprendente | null>(null)

  // Form States (Novo Agendamento Rápido)
  const [quickDate, setQuickDate] = useState('')
  const [quickTime, setQuickTime] = useState('')

  // Form States (Novo Aprendente)
  const [ageOrDate, setAgeOrDate] = useState('')
  const [phone, setPhone] = useState('')

  // Form States (Configuração de Sessões)
  const [confTipoSessao, setConfTipoSessao] = useState<'Avaliação' | 'Intervenção' | ''>('')
  const [confQtd, setConfQtd] = useState<number | ''>('')
  const [confFormaPagamento, setConfFormaPagamento] = useState<'Por Sessão' | 'Pacote Mensal' | 'Avaliação Completa' | ''>('')
  const [confValor, setConfValor] = useState('')
  const [confDuracao, setConfDuracao] = useState('')

  // App Data State
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([])
  const [sessoesGlobais, setSessoesGlobais] = useState<SessaoAgenda[]>([])

  // Helper Form (Agendamento)
  const [agendarData, setAgendarData] = useState('')
  const [agendarHoraInicio, setAgendarHoraInicio] = useState('')

  // Helper (Filtro da Agenda Diária)
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  })

  // On Load: Carregar dados do localStorage
  useEffect(() => {
    const savedAp = localStorage.getItem('neuroflow_aprendentes')
    if (savedAp) setAprendentes(JSON.parse(savedAp))

    const savedSes = localStorage.getItem('neuroflow_sessoes')
    if (savedSes) setSessoesGlobais(JSON.parse(savedSes))
  }, [])

  const dToday = new Date();
  const mmToday = String(dToday.getMonth() + 1).padStart(2, '0');
  const ddToday = String(dToday.getDate()).padStart(2, '0');
  const todayStr = `${dToday.getFullYear()}-${mmToday}-${ddToday}`;

  const todaySessions = sessoesGlobais
    .filter(s => s.dataRealizacao === todayStr)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const previsaoDia = todaySessions.reduce((acc, sessao) => {
    const strVal = sessao.valor.replace(/[^\d,]/g, '').replace(',', '.');
    return acc + (parseFloat(strVal) || 0);
  }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getStatusBadge = (status: StatusType) => {
    switch(status) {
      case 'agendado': return <span className="badge badge-agendado">Agendado</span>
      case 'andamento': return <span className="badge badge-andamento">Em Andamento</span>
      case 'pago': return <span className="badge badge-pago">Pago</span>
      default: return null
    }
  }

  // --- Máscaras Inteligentes ---
  const handleAgeOrDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Remove tudo que não for número

    if (value.length > 2) {
      // Se passar de 2 dígitos, assume data (dd/mm/yyyy)
      if (value.length > 8) value = value.slice(0, 8)
      value = value.replace(/(\d{2})(\d)/, '$1/$2')
      value = value.replace(/(\d{2})(\d)/, '$1/$2')
    } else {
      // Se tiver 1 ou 2 dígitos, mantém puro (idade)
      if (value.length > 2) value = value.slice(0, 2)
    }

    setAgeOrDate(value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Remove tudo que não for número

    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2')
    }
    if (value.length > 9) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
    } else if (value.length > 8) { // mask for 8 digit numbers as fallback
       value = value.replace(/(\d{4})(\d)/, '$1-$2')
    }
    
    setPhone(value)
  }

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d,]/g, ''); // mantém apenas números e vírgula
    if (raw === '') { setConfValor(''); return; }
    
    // Garante que só tenha uma vírgula
    const parts = raw.split(',');
    if (parts.length > 2) {
      raw = parts[0] + ',' + parts.slice(1).join('');
    }

    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    if (integerPart) {
      integerPart = parseInt(integerPart, 10).toString(); // remove zeros à esquerda inuteis
      integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    } else {
      integerPart = '0';
    }

    if (decimalPart.length > 2) {
      decimalPart = decimalPart.slice(0, 2);
    }

    let formatted = '';
    if (raw.includes(',')) {
      formatted = `R$ ${integerPart},${decimalPart}`;
    } else {
      formatted = `R$ ${integerPart}`;
    }
    
    setConfValor(formatted);
  }

  const handleMoneyBlur = () => {
    if (!confValor || confValor === 'R$ ' || confValor === 'R$ 0') return;
    
    if (!confValor.includes(',')) {
      setConfValor(confValor + ',00');
    } else {
      const parts = confValor.split(',');
      if (parts[1].length === 0) {
        setConfValor(parts[0] + ',00');
      } else if (parts[1].length === 1) {
        setConfValor(confValor + '0');
      }
    }
  }

  const handleQuickDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length < quickDate.length) { setQuickDate(value); return; } 
    value = value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setQuickDate(value);
  }

  const handleQuickDateBlur = () => {
    let value = quickDate.replace(/\D/g, '');
    if (!value) return;
    if (value.length === 3) value = '0' + value; // 104 -> 01/04
    if (value.length >= 4) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setQuickDate(value);
  }

  const handleQuickTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     let value = e.target.value;
     if (value.length < quickTime.length) { setQuickTime(value); return; } 
     value = value.replace(/\D/g, '');
     if (value.length > 4) value = value.slice(0, 4);
     setQuickTime(value);
  }

  const handleQuickTimeBlur = () => {
    let value = quickTime.replace(/\D/g, '');
    if (!value) return;
    if (value.length <= 2) value = value.padStart(2, '0') + '00';
    else if (value.length === 3) value = '0' + value;
    
    if (value.length >= 4) {
       let h = parseInt(value.slice(0, 2));
       let m = parseInt(value.slice(2, 4));
       if (h > 23) h = 23;
       if (m > 59) m = 59;
       value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    setQuickTime(value);
  }

  const handleOpenNewAprendente = () => {
    setIsFabOpen(false);
    setCurrentScreen('novo-aprendente');
  }

  const handleCloseForm = () => {
    setCurrentScreen('dashboard');
    // Clear temp states just in case
    setAgeOrDate('')
    setPhone('')
  }

  const handleSubmitNovoAprendente = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const novoAprendente: Aprendente = {
      id: Date.now().toString(),
      nome: formData.get('nome') as string,
      dataOuIdade: ageOrDate,
      responsavel1: formData.get('resp1') as string,
      responsavel2: formData.get('resp2') as string,
      contato: phone,
      motivo: formData.get('motivo') as string,
      metodoPagamento: formData.get('metodoPagamento') as string,
      status: 'ativo'
    }

    const novaLista = [novoAprendente, ...aprendentes]
    setAprendentes(novaLista)
    localStorage.setItem('neuroflow_aprendentes', JSON.stringify(novaLista))
    
    handleCloseForm()
  }

  const openDetalhes = (ap: Aprendente) => {
    setSelectedAprendente(ap)
    setAgeOrDate(ap.dataOuIdade)
    setPhone(ap.contato)
    setConfTipoSessao(ap.tipoSessao || '')
    setConfQtd(ap.qtdSessoesAvaliacao || '')
    setConfFormaPagamento(ap.formaPagamento || '')
    setConfValor(ap.valorReferencia || '')
    setConfDuracao(ap.duracaoMinutos || '')
    setCurrentScreen('perfil-aprendente')
  }

  const salvarDetalhes = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedAprendente) return;

    const formData = new FormData(e.currentTarget);

    const atualizado = {
      ...selectedAprendente,
      nome: formData.get('nome') as string || selectedAprendente.nome,
      dataOuIdade: ageOrDate || selectedAprendente.dataOuIdade,
      responsavel1: formData.get('resp1') as string || selectedAprendente.responsavel1,
      responsavel2: formData.get('resp2') as string || selectedAprendente.responsavel2,
      contato: phone || selectedAprendente.contato,
      motivo: formData.get('motivo') as string || selectedAprendente.motivo,
      metodoPagamento: formData.get('metodoPagamento') as string || selectedAprendente.metodoPagamento,
      tipoSessao: confTipoSessao,
      qtdSessoesAvaliacao: confTipoSessao === 'Avaliação' ? Number(confQtd) : undefined,
      formaPagamento: confFormaPagamento,
      valorReferencia: confValor,
      duracaoMinutos: confDuracao
    }

    const novaLista = aprendentes.map(ap => ap.id === atualizado.id ? atualizado : ap)
    setAprendentes(novaLista)
    localStorage.setItem('neuroflow_aprendentes', JSON.stringify(novaLista))
    setSelectedAprendente(atualizado)
    setCurrentScreen('perfil-aprendente')
  }

  // --- NOVA LÓGICA DE AGENDAMENTO ---
  const handleAbrirAgendador = () => {
    setAgendarData('')
    setAgendarHoraInicio('')
    setCurrentScreen('agendar-sessao')
  }

  const calcularHoraFim = (inicio: string, minDura: number) => {
    if (!inicio) return '';
    const [h, m] = inicio.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0);
    date.setMinutes(date.getMinutes() + minDura);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  const handleSubmitSessao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAprendente || !agendarData || !agendarHoraInicio) return;
    
    const duracao = parseInt(selectedAprendente.duracaoMinutos || '45', 10);
    const sessoesGeradas: SessaoAgenda[] = [];
    const isLoteAvaliacao = selectedAprendente.tipoSessao === 'Avaliação' && selectedAprendente.qtdSessoesAvaliacao;
    const qtdSessoes = isLoteAvaliacao ? (selectedAprendente.qtdSessoesAvaliacao as number) : 1;

    for (let i = 0; i < qtdSessoes; i++) {
       // Calcular data corrigindo fuso horário (Meio dia isola Date bugs)
       const baseDate = new Date(agendarData + 'T12:00:00'); 
       baseDate.setDate(baseDate.getDate() + (i * 7));
       const dataNovaIso = baseDate.toISOString().split('T')[0];

       // Adicionar Sufixo Discreto [X/Y]
       const tipoDisplay = qtdSessoes > 1 
         ? `Avaliação [${i + 1}/${qtdSessoes}]` 
         : (selectedAprendente.tipoSessao || 'Intervenção');

       sessoesGeradas.push({
         id: Date.now().toString() + '-' + i,
         aprendenteId: selectedAprendente.id,
         nomeAprendente: selectedAprendente.nome,
         tipoSessao: tipoDisplay,
         dataRealizacao: dataNovaIso,
         horaInicio: agendarHoraInicio,
         horaFim: calcularHoraFim(agendarHoraInicio, duracao),
         status: 'agendado',
         valor: selectedAprendente.valorReferencia || 'R$ 0,00'
       });
    }

    const novaLista = [...sessoesGlobais, ...sessoesGeradas];
    setSessoesGlobais(novaLista);
    localStorage.setItem('neuroflow_sessoes', JSON.stringify(novaLista));

    setCurrentScreen('dashboard');
    setActiveTab('agenda'); // Vai direto pra agenda olhar!
  }

  if (currentScreen === 'novo-aprendente') {
    return (
      <div className="screen-overlay">
        <header className="screen-header">
          <button className="btn-icon" onClick={handleCloseForm} aria-label="Voltar">
            <ArrowLeft size={28} />
          </button>
          <h2 className="screen-title">Novo Aprendente</h2>
        </header>

        <form 
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }} 
          onSubmit={handleSubmitNovoAprendente}
        >
          <div className="form-scroll-area">
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">
                  Nome Completo do Aprendente <span className="required-asterisk">*</span>
                </label>
                <input type="text" name="nome" className="form-input" placeholder="Ex: Lucas Pereira Silva" required />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Idade ou Data de Nascimento <span className="required-asterisk">*</span>
                </label>
                <input 
                  type="text" 
                  name="idade"
                  className="form-input" 
                  placeholder="Ex: 8 ou 15/05/2015" 
                  value={ageOrDate}
                  onChange={handleAgeOrDateChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nome do Responsável 1 <span className="required-asterisk">*</span>
                </label>
                <input type="text" name="resp1" className="form-input" placeholder="Ex: Maria Pereira" required />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nome do Responsável 2 <span className="text-muted" style={{fontSize: '0.9rem', marginLeft: '8px'}}>(Opcional)</span>
                </label>
                <input type="text" name="resp2" className="form-input" placeholder="Ex: João da Silva" />
              </div>

              <div className="form-group">
                <label className="form-label">
                  WhatsApp / Contato <span className="required-asterisk">*</span>
                </label>
                <input 
                  type="tel" 
                  name="contato"
                  className="form-input" 
                  placeholder="(00) 00000-0000" 
                  value={phone}
                  onChange={handlePhoneChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Motivo Principal <span className="required-asterisk">*</span>
                </label>
                <textarea name="motivo" className="form-input" placeholder="Breve relato ou queixa pedagógica principal..." required></textarea>
              </div>
            </div>
          </div>
          
          <div className="bottom-action-bar">
            <button type="submit" className="btn-primary-large">
              Salvar Cadastro
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (currentScreen === 'detalhe-aprendente' && selectedAprendente) {
    // Calculo Matemático Inteligente
    let calculationText = '';
    if (confValor && confFormaPagamento === 'Avaliação Completa' && confTipoSessao === 'Avaliação' && confQtd) {
      const numericValue = parseFloat(confValor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      if (!isNaN(numericValue) && confQtd > 0) {
        const perSession = (numericValue / Number(confQtd)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        calculationText = `O valor total é ${confValor}, equivalente a ${perSession} recebidos por sessão.`;
      }
    }

    return (
      <div className="screen-overlay">
        <header className="screen-header">
          <button className="btn-icon" onClick={() => setCurrentScreen('perfil-aprendente')} aria-label="Voltar">
            <ArrowLeft size={28} />
          </button>
          <div style={{flex: 1}}>
            <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>{selectedAprendente.nome}</h2>
            <p className="card-subtitle" style={{ fontSize: '1.1rem', marginTop: 0 }}>Configuração de Atendimento</p>
          </div>
        </header>

        <form 
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }} 
          onSubmit={salvarDetalhes}
        >
          <div className="form-scroll-area">
            <div className="form-container">
              
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados Pessoais</h3>

              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" name="nome" className="form-input" defaultValue={selectedAprendente.nome} required />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Idade/Data Nasc.</label>
                  <input type="text" name="idade" className="form-input" value={ageOrDate} onChange={handleAgeOrDateChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Contato/WhatsApp</label>
                  <input type="tel" name="contato" className="form-input" value={phone} onChange={handlePhoneChange} required />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Responsável 1</label>
                  <input type="text" name="resp1" className="form-input" defaultValue={selectedAprendente.responsavel1} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Responsável 2</label>
                  <input type="text" name="resp2" className="form-input" defaultValue={selectedAprendente.responsavel2} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo Principal</label>
                <textarea name="motivo" className="form-input" defaultValue={selectedAprendente.motivo} required></textarea>
              </div>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuração de Sessões</h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={handleAbrirAgendador}
                  className="fab-option-label" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', color: 'var(--accent-rose)', border: '2px solid var(--accent-rose-light)' }}
                >
                  <Calendar size={20} /> 
                  {confTipoSessao === 'Avaliação' ? 'Agendar Avaliação' : 
                   confTipoSessao === 'Intervenção' ? 'Agendar Intervenção' : 'Agendar Nova Sessão'}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Sessão</label>
                <select 
                  className="form-input" 
                  value={confTipoSessao} 
                  onChange={(e) => setConfTipoSessao(e.target.value as any)}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Avaliação">Avaliação</option>
                  <option value="Intervenção">Intervenção</option>
                </select>
              </div>

              {confTipoSessao === 'Avaliação' && (
                <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                  <label className="form-label">Quantidade de Sessões</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Ex: 5" 
                    value={confQtd} 
                    onChange={(e) => setConfQtd(e.target.value ? Number(e.target.value) : '')}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Modelo de Cobrança</label>
                <select className="form-input" value={confFormaPagamento} onChange={(e) => setConfFormaPagamento(e.target.value as any)}>
                  <option value="" disabled>Selecione...</option>
                  <option value="Por Sessão">Por Sessão</option>
                  <option value="Pacote Mensal">Pacote Mensal</option>
                  <option value="Avaliação Completa">Avaliação Completa</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Forma de Pagamento</label>
                <select name="metodoPagamento" className="form-input" defaultValue={selectedAprendente.metodoPagamento || ""}>
                  <option value="" disabled>Selecione uma opção...</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Doctor Prime">Doctor Prime</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Valor de Referência</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="R$ 0,00" 
                  value={confValor} 
                  onChange={handleMoneyChange}
                  onBlur={handleMoneyBlur}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duração da Sessão <span className="text-muted">(minutos)</span></label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ex: 45 ou 50" 
                  value={confDuracao} 
                  onChange={(e) => setConfDuracao(e.target.value)}
                  required
                />
              </div>

              {calculationText && (
                <div style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 500, lineHeight: 1.4, fontSize: '1.2rem', animation: 'fadeIn 0.3s' }}>
                  💡 {calculationText}
                </div>
              )}
            </div>
          </div>
          
          <div className="bottom-action-bar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <button type="submit" className="btn-primary-large">
              Salvar Alterações
            </button>
            <button 
              type="button" 
              className="btn-primary-large" 
              style={{ background: 'transparent', color: 'var(--accent-rose)', border: '2px solid var(--accent-rose-light)' }}
              onClick={() => setCurrentScreen('encerrar-aprendente')}
            >
              Finalizar Acompanhamento
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (currentScreen === 'encerrar-aprendente' && selectedAprendente) {
    const handleEncerrar = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const motivo = formData.get('motivoEnc') as string;
      const dataIso = new Date().toISOString().split('T')[0];

      // 1. Atualizar Aprendente
      const atualizado = {
        ...selectedAprendente,
        status: 'inativo' as const,
        motivoEncerramento: motivo,
        dataEncerramento: dataIso
      };

      const novaLista = aprendentes.map(ap => ap.id === atualizado.id ? atualizado : ap);
      setAprendentes(novaLista);
      localStorage.setItem('neuroflow_aprendentes', JSON.stringify(novaLista));

      // 2. Apagar sessões futuras do aprendente que estiverem agendadas
      const novoSessoes = sessoesGlobais.filter(s => {
        if (s.aprendenteId !== atualizado.id) return true;
        if (s.status !== 'agendado') return true;
        
        const dataSessao = new Date(s.dataRealizacao + 'T23:59:59'); 
        const hoje = new Date();
        return dataSessao < hoje; // Mantém apenas se a sessão for antiga
      });

      setSessoesGlobais(novoSessoes);
      localStorage.setItem('neuroflow_sessoes', JSON.stringify(novoSessoes));

      setCurrentScreen('dashboard');
      setSelectedAprendente(null);
    }

    return (
      <div className="screen-overlay">
        <header className="screen-header">
          <button className="btn-icon" onClick={() => setCurrentScreen('detalhe-aprendente')} aria-label="Voltar">
            <ArrowLeft size={28} />
          </button>
          <div style={{flex: 1}}>
            <h2 className="screen-title" style={{ fontSize: '1.25rem', color: 'var(--accent-rose)' }}>Finalizar Acompanhamento</h2>
            <p className="card-subtitle" style={{ fontSize: '1.1rem', marginTop: 0 }}>Arquivar {selectedAprendente.nome}</p>
          </div>
        </header>

        <form autoComplete="off" onSubmit={handleEncerrar} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="form-scroll-area">
            <div className="form-container">
              <div style={{ background: 'var(--accent-rose-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--accent-rose)', margin: 0, fontSize: '1.1rem' }}>
                  <strong>Atenção:</strong> Ao arquivar este aprendente, ele sairá da sua lista ativa e <strong>todas as suas sessões futuras agendadas serão automaticamente canceladas e removidas.</strong>
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Por que o acompanhamento está sendo encerrado? <span className="required-asterisk">*</span></label>
                <select name="motivoEnc" className="form-input" required defaultValue="">
                  <option value="" disabled>Selecione um motivo...</option>
                  {MOTIVOS_ENCERRAMENTO.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bottom-action-bar">
            <button type="submit" className="btn-primary-large" style={{ background: 'var(--accent-rose)' }}>
              Confirmar e Arquivar
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (currentScreen === 'agendar-sessao' && selectedAprendente) {
    const isLoteAvaliacao = selectedAprendente.tipoSessao === 'Avaliação' && selectedAprendente.qtdSessoesAvaliacao && selectedAprendente.qtdSessoesAvaliacao > 1;

    return (
      <div className="screen-overlay">
        <header className="screen-header">
          <button className="btn-icon" onClick={() => setCurrentScreen('detalhe-aprendente')} aria-label="Voltar">
            <ArrowLeft size={28} />
          </button>
          <div style={{flex: 1}}>
            <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>
              {isLoteAvaliacao ? 'Agendar Lote de Avaliações' : `Agendar ${selectedAprendente.tipoSessao || 'Sessão'}`}
            </h2>
            <p className="card-subtitle" style={{ fontSize: '1.1rem', marginTop: 0 }}>{selectedAprendente.nome}</p>
          </div>
        </header>

        <form 
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }} 
          onSubmit={handleSubmitSessao}
        >
          <div className="form-scroll-area">
            <div className="form-container">
              
              <div className="form-group">
                <label className="form-label">{isLoteAvaliacao ? 'Data da Primeira Avaliação' : 'Data da Sessão'}</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={agendarData} 
                  onChange={(e) => setAgendarData(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horário de Início</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={agendarHoraInicio} 
                  onChange={(e) => setAgendarHoraInicio(e.target.value)}
                  required
                />
              </div>

              <div style={{ background: 'var(--bg-stone)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginTop: '2rem' }}>
                <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  A duração programada para este aprendente é de <strong>{selectedAprendente.duracaoMinutos || 45} minutos</strong>. O encerramento será calculado automaticamente.
                </p>
                {isLoteAvaliacao && (
                  <p className="text-muted" style={{ fontSize: '1.1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    ✨ Por possuir um pacote de Avaliação, a agenda reservará automaticamente <strong>{selectedAprendente.qtdSessoesAvaliacao} sessões</strong>, repetindo este mesmo dia e horário a cada semana.
                  </p>
                )}
              </div>

            </div>
          </div>
          
          <div className="bottom-action-bar">
            <button type="submit" className="btn-primary-large">
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    )
  }

  const handleMarcarComoPago = (idSessao: string) => {
    const novaLista = sessoesGlobais.map(s => s.id === idSessao ? { ...s, status: 'pago' as StatusType } : s);
    setSessoesGlobais(novaLista);
    localStorage.setItem('neuroflow_sessoes', JSON.stringify(novaLista));
  }

  if (currentScreen === 'perfil-aprendente' && selectedAprendente) {
     const sessoesDoAluno = sessoesGlobais
        .filter(s => s.aprendenteId === selectedAprendente.id)
        .sort((a, b) => a.dataRealizacao.localeCompare(b.dataRealizacao) || a.horaInicio.localeCompare(b.horaInicio));
     
     const parseMoney = (val: string) => {
        return parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
     }

     const totalPago = sessoesDoAluno.reduce((acc, s) => s.status === 'pago' ? acc + parseMoney(s.valor) : acc, 0);
     const totalPendente = sessoesDoAluno.reduce((acc, s) => s.status !== 'pago' ? acc + parseMoney(s.valor) : acc, 0);
     
     const historico = [...sessoesDoAluno].reverse().slice(0, 5);
     
     const ehAvaliacao = selectedAprendente.tipoSessao === 'Avaliação';
     const totalSessoes = ehAvaliacao ? (selectedAprendente.qtdSessoesAvaliacao || sessoesDoAluno.length) : sessoesDoAluno.length;
     const concluidas = sessoesDoAluno.filter(s => s.status === 'pago').length;

     return (
       <div className="screen-overlay">
         <header className="screen-header" style={{ borderBottom: 'none' }}>
           <button className="btn-icon" onClick={() => { setSelectedAprendente(null); setCurrentScreen('dashboard'); }} aria-label="Voltar">
             <ArrowLeft size={28} />
           </button>
           <div style={{flex: 1}}>
             <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>Perfil</h2>
           </div>
           <button className="btn-icon" style={{ marginRight: 0, color: 'var(--accent-rose)' }} onClick={() => setCurrentScreen('detalhe-aprendente')} aria-label="Configurações">
             <Settings size={28} />
           </button>
         </header>

         <div className="form-scroll-area">
           <div className="form-container" style={{ paddingTop: 0 }}>
             
             {/* Cabeçalho do Perfil */}
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {selectedAprendente.nome.charAt(0)}
                </div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '4px', textAlign: 'center' }}>{selectedAprendente.nome}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{selectedAprendente.dataOuIdade} {selectedAprendente.dataOuIdade.length <= 2 ? 'anos' : ''} • {selectedAprendente.tipoSessao || 'Sessão Padrão'}</p>
             </div>

             {/* Resumo Financeiro */}
             <section className="summary-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="summary-card">
                  <div className="summary-value" style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>
                    {totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="summary-label" style={{ fontSize: '1rem' }}>Pendente (Aberto)</div>
                </div>
                <div className="summary-card" style={{ background: 'var(--accent-emerald-light)', borderColor: 'transparent' }}>
                  <div className="summary-value" style={{ fontSize: '1.5rem', color: 'var(--accent-emerald)' }}>
                    {totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="summary-label" style={{ color: 'var(--accent-emerald)', opacity: 0.8, fontSize: '1rem' }}>Total Pago</div>
                </div>
             </section>

             {/* Progresso Tracker */}
             {ehAvaliacao && selectedAprendente.qtdSessoesAvaliacao && (
               <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-lux)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Progresso da Avaliação</span>
                     <span style={{ color: 'var(--text-muted)' }}>{concluidas} de {totalSessoes} concluídas</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ width: `${Math.min(100, (concluidas / Number(totalSessoes)) * 100)}%`, height: '100%', background: 'var(--accent-rose)', transition: 'width 0.3s' }}></div>
                  </div>
               </div>
             )}

             {/* Trilha Histórica (Acoes Financeiras) */}
             <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
               Trilha de Sessões
             </h3>

             {sessoesDoAluno.length === 0 ? (
               <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>Nenhuma sessão lançada.</p>
             ) : (
               historico.map(s => {
                  let dParts = s.dataRealizacao.split('-');
                  let displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : s.dataRealizacao;
                  let isPago = s.status === 'pago';
                  
                  return (
                    <article key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', boxShadow: 'var(--shadow-lux)' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px', paddingRight: '0.8rem', borderRight: '1px solid var(--border-light)' }}>
                         <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '1.1rem' }}>{displayDate}</span>
                         <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.horaInicio}</span>
                       </div>
                       
                       <div style={{ flex: 1, paddingLeft: '0.8rem', display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{s.tipoSessao}</span>
                         <span style={{ color: isPago ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '0.9rem', fontWeight: 500 }}>
                           {isPago ? 'Recebido: ' : 'Pendente: '} {s.valor}
                         </span>
                       </div>

                       {!isPago && (
                         <button 
                            onClick={() => handleMarcarComoPago(s.id)}
                            style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                            aria-label="Marcar como Pago"
                         >
                            <CheckCircle size={20} />
                         </button>
                       )}
                       {isPago && (
                         <div style={{ color: 'var(--accent-emerald)', width: '40px', display: 'flex', justifyContent: 'center', opacity: 0.6 }}>
                            <CheckCircle size={20} />
                         </div>
                       )}
                    </article>
                  )
               })
             )}

           </div>
         </div>
       </div>
     )
  }

  if (currentScreen === 'agendamento-rapido-selecionar') {
    const ativos = aprendentes.filter(a => a.status !== 'inativo');
    return (
      <div className="screen-overlay">
        <header className="screen-header">
          <button className="btn-icon" onClick={() => setCurrentScreen('dashboard')} aria-label="Voltar">
            <ArrowLeft size={28} />
          </button>
          <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>Para quem é a sessão?</h2>
        </header>
        <div className="form-scroll-area" style={{ padding: '1.5rem' }}>
          {ativos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Users size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Nenhum aprendente ativo cadastrado.</p>
            </div>
          ) : (
             ativos.map((ap) => (
                <article key={ap.id} className="lux-card" onClick={() => { setSelectedAprendente(ap); setCurrentScreen('agendamento-rapido-form'); }} style={{ cursor: 'pointer', marginBottom: '1rem', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="card-title" style={{ marginBottom: '0.25rem', fontSize: '1.3rem' }}>{ap.nome}</h3>
                  <p className="card-subtitle" style={{ marginTop: '0', color: 'var(--accent-emerald)' }}>{ap.tipoSessao || 'Sessão Padrão'}</p>
                </article>
             ))
          )}
        </div>
      </div>
    )
  }

  if (currentScreen === 'agendamento-rapido-form' && selectedAprendente) {
    const handleAgendamentoRapido = (e: React.FormEvent) => {
       e.preventDefault();
       if (!quickDate || !quickTime || quickDate.length < 5 || quickTime.length < 5) return;
       const [vdd, vmm] = quickDate.split('/');
       const now = new Date();
       const monthNow = now.getMonth() + 1;
       let year = now.getFullYear();
       if (parseInt(vmm) < monthNow && (monthNow - parseInt(vmm)) > 3) {
          year++;
       }
       const isoDate = `${year}-${vmm.padStart(2,'0')}-${vdd.padStart(2,'0')}`;
       const duracao = parseInt(selectedAprendente.duracaoMinutos || '45', 10);
       const hrInicioFinal = quickTime.includes(':') ? quickTime : quickTime.replace(/(\d{2})(\d{2})/, '$1:$2');
       const novaSessao: SessaoAgenda = {
          id: 'qr-' + Date.now().toString(),
          aprendenteId: selectedAprendente.id,
          nomeAprendente: selectedAprendente.nome,
          tipoSessao: selectedAprendente.tipoSessao || 'Sessão',
          dataRealizacao: isoDate,
          horaInicio: hrInicioFinal,
          horaFim: calcularHoraFim(hrInicioFinal, duracao),
          status: 'agendado',
          valor: selectedAprendente.valorReferencia || 'R$ 0,00'
       };
       const novaLista = [...sessoesGlobais, novaSessao];
       setSessoesGlobais(novaLista);
       localStorage.setItem('neuroflow_sessoes', JSON.stringify(novaLista));
       setCurrentScreen('dashboard');
       setActiveTab('agenda');
       setQuickDate('');
       setQuickTime('');
       setSelectedAprendente(null);
    }
    return (
      <div className="screen-overlay">
        <header className="screen-header">
          <button className="btn-icon" onClick={() => setCurrentScreen('agendamento-rapido-selecionar')} aria-label="Voltar">
            <ArrowLeft size={28} />
          </button>
          <div style={{flex: 1}}>
            <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>Agendar Sessão</h2>
            <p className="card-subtitle" style={{ fontSize: '1.1rem', marginTop: 0 }}>{selectedAprendente.nome}</p>
          </div>
        </header>
        <form autoComplete="off" onSubmit={handleAgendamentoRapido} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="form-scroll-area">
            <div className="form-container">
              <div style={{ background: 'var(--accent-emerald-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--accent-emerald)', margin: 0, fontSize: '1.1rem' }}>
                  <strong>{selectedAprendente.tipoSessao || 'Sessão Padrão'}</strong> • Digite números direto, o formato é inteligente!
                </p>
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '1.3rem' }}>Data</label>
                  <input type="tel" className="form-input" style={{ fontSize: '1.6rem', padding: '1.5rem', textAlign: 'center', letterSpacing: '2px' }} placeholder="10/04" value={quickDate} onChange={handleQuickDateChange} onBlur={handleQuickDateBlur} required autoFocus />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '1.3rem' }}>Hora</label>
                  <input type="tel" className="form-input" style={{ fontSize: '1.6rem', padding: '1.5rem', textAlign: 'center', letterSpacing: '2px' }} placeholder="14:00" value={quickTime} onChange={handleQuickTimeChange} onBlur={handleQuickTimeBlur} required />
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-action-bar">
            <button type="submit" className="btn-primary-large">
              Confirmar e Agendar
            </button>
          </div>
        </form>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const getDynamicMessage = (h: number, count: number) => {
    if (h >= 18) {
      return "O expediente chegou ao fim! Aproveite para organizar relatórios, descansar a mente e recarregar as energias para amanhã."
    }
    if (count === 0) {
      return h < 12 
        ? "Café na xícara e agenda livre! Aproveite a manhã para organizar relatórios ou planejar a semana."
        : "Tarde tranquila por aqui. Que tal tirar um momento para você ou adiantar os estudos de caso?"
    }
    if (count === 1) {
      return h < 12
        ? "Apenas um atendimento aguardando por você hoje. Que seja uma sessão muito produtiva!"
        : "Falta pouco! Você tem mais um atendimento programado para esta tarde."
    }
    
    // Múltiplos atendimentos (2+)
    return h < 12
      ? `Espero que o dia seja ótimo. Você tem ${count} atendimentos programados, dê uma olhada no fluxo abaixo.`
      : `A tarde está movimentada! Há ${count} aprendentes aguardando por você nos próximos horários.`
  }

  const remainingSessionsCount = todaySessions.length;

  return (
    <div className="mobile-container">
      
      {/* Header Greeting / Assistant Voice */}
      <header className="header-greeting" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.2' }}>Espaço NeuroAprendiz</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Elvira Portes</span>
          </div>
        </div>

        {activeTab === 'inicio' ? (
          <>
            <h1 style={{ color: 'var(--accent-rose)', fontSize: '1.8rem', lineHeight: '1.3' }}>
              {greeting}, Elvira!
            </h1>
            <p className="text-muted" style={{ fontSize: '1.15rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
              {getDynamicMessage(hour, remainingSessionsCount)}
            </p>
          </>
        ) : (
          <h1 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', lineHeight: '1.4', fontWeight: 500 }}>
            {activeTab === 'clientes' && "Aqui estão todos os seus aprendentes, Elvira. Você acompanhou alguma novidade recente?"}
            {activeTab === 'agenda' && "Vamos verificar seus próximos compromissos para garantir que nada passe despercebido."}
          </h1>
        )}
      </header>

      {/* Quick Summary Grid */}
      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-value">{String(todaySessions.length).padStart(2, '0')}</div>
          <div className="summary-label">Consultas Hoje</div>
        </div>
        <div className="summary-card">
          <div className="summary-value" style={{ color: 'var(--accent-emerald)', fontSize: previsaoDia.length > 10 ? '1.5rem' : '2.2rem' }}>{previsaoDia}</div>
          <div className="summary-label">Previsão do Dia</div>
        </div>
      </section>

      {/* Content based on Active Tab */}
      <section>
        {activeTab === 'inicio' && (
          <>
            <h2 className="section-title">Próximos Atendimentos</h2>
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nenhum atendimento</h3>
                <p>Você não tem consultas agendadas para hoje.</p>
              </div>
            ) : (
              todaySessions.map((session) => (
                <article key={session.id} className="lux-card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{session.nomeAprendente}</h3>
                      <p className="card-subtitle" style={{marginTop: '4px'}}>
                        <Clock size={20} />
                        Hoje, {session.horaInicio}
                      </p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  <div className="card-footer">
                    <span className="text-muted">{session.tipoSessao}</span>
                    <span className="card-price">{session.valor}</span>
                  </div>
                </article>
              ))
            )}
          </>
        )}

        {activeTab === 'clientes' && (
          <>
            <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Meus Aprendentes
              <span style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                {aprendentes.filter(a => a.status !== 'inativo').length}
              </span>
            </h2>

            {aprendentes.filter(a => a.status !== 'inativo').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nenhum Aprendente</h3>
                <p>Você ainda não possui aprendentes ativos. Use o botão + abaixo para cadastrar.</p>
              </div>
            ) : (
              aprendentes.filter(a => a.status !== 'inativo').map((ap) => (
                <article key={ap.id} className="lux-card" onClick={() => openDetalhes(ap)} style={{ cursor: 'pointer' }}>
                  <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>{ap.nome}</h3>
                  <p className="card-subtitle" style={{ marginTop: '0', marginBottom: '1rem' }}>
                    {ap.dataOuIdade} {ap.dataOuIdade.length <= 2 ? 'anos' : ''}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} /> 
                      {ap.responsavel1}
                    </span>
                    {ap.contato && (
                      <a href={`https://wa.me/55${ap.contato.replace(/\D/g, '')}`} target="_blank" className="badge badge-pago" style={{ textDecoration: 'none' }}>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </>
        )}

        {activeTab === 'agenda' && (
          <section>
            {/* Header customizado da Agenda */}
            <div style={{ 
              display: 'flex', gap: '1rem', overflowX: 'auto', 
              padding: '0.5rem 0 1.5rem 0', marginLeft: '-1rem', marginRight: '-1rem', 
              paddingLeft: '1rem', paddingRight: '1rem', // Fake full width scroll
              scrollbarWidth: 'none' // hide scrollbar firefox
            }}>
              <style>{`
                ::-webkit-scrollbar { display: none; }
              `}</style>
              
            {/* Render 30 days in carousel for context */}
              {Array.from({length: 30}, (_, i) => i - 5).map((offset) => {
                const d = new Date()
                d.setDate(d.getDate() + offset)
                
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const isoDate = `${d.getFullYear()}-${mm}-${dd}`;
                
                const isSelected = selectedAgendaDate === isoDate;
                const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
                const numStr = d.getDate()
                
                return (
                  <div 
                    key={offset} 
                    onClick={() => setSelectedAgendaDate(isoDate)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      minWidth: '70px', padding: '1rem 0.5rem',
                      background: isSelected ? 'var(--accent-rose)' : 'var(--card-bg)',
                      color: isSelected ? 'white' : 'var(--text-dark)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: isSelected ? 'var(--shadow-fab)' : 'var(--shadow-lux)',
                      border: isSelected ? 'none' : '1px solid var(--border-light)',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{dayStr}</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '4px' }}>{numStr}</span>
                  </div>
                )
              })}
            </div>

            <h2 className="section-title">Programação do Dia</h2>

            {(() => {
              const sessoesDoDia = sessoesGlobais.filter(s => s.dataRealizacao === selectedAgendaDate);
              
              if (sessoesDoDia.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Calendar size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Sua agenda está livre.</h3>
                    <p>Nenhuma sessão marcada para este dia.</p>
                  </div>
                )
              }

              return sessoesDoDia.map((sessao) => (
                <article key={sessao.id} className="lux-card" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', borderRight: '2px solid var(--border-light)', paddingRight: '1rem' }}>
                     <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-dark)' }}>{sessao.horaInicio}</span>
                     <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sessao.horaFim}</span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 className="card-title" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{sessao.nomeAprendente}</h3>
                    <span className="text-muted" style={{ fontSize: '1.1rem' }}>{sessao.tipoSessao}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                     {getStatusBadge(sessao.status)}
                  </div>
                </article>
              ))
            })()}
          </section>
        )}
      </section>

      {/* Footer Branding */}
      <div style={{ padding: '2rem 0 3rem 0', textAlign: 'center', opacity: 0.35 }}>
        <span style={{ fontSize: '1rem', fontWeight: 500 }}>
          Tecnologia <strong style={{ color: 'var(--text-dark)' }}>Neuro Flow</strong>
        </span>
      </div>

      {/* Floating Action Menu */}
      {isFabOpen && (
        <div className="fab-overlay" onClick={() => setIsFabOpen(false)}></div>
      )}
      
      <div className={`fab-menu-container ${isFabOpen ? 'open' : ''}`}>
        <div className="fab-menu-options">
          <button className="fab-option" onClick={() => { setIsFabOpen(false); setQuickDate(''); setQuickTime(''); setSelectedAprendente(null); setCurrentScreen('agendamento-rapido-selecionar'); }}>
             <span className="fab-option-label">Novo Agendamento</span>
             <div className="fab-option-icon"><Calendar size={28} /></div>
          </button>
          <button className="fab-option" onClick={handleOpenNewAprendente}>
            <span className="fab-option-label">Novo Aprendente</span>
            <div className="fab-option-icon"><UserPlus size={28} /></div>
          </button>
        </div>

        <button 
          className="fab" 
          aria-label={isFabOpen ? "Fechar Menu" : "Adicionar Novo"}
          onClick={() => setIsFabOpen(!isFabOpen)}
        >
          <Plus 
            size={32} 
            strokeWidth={2.5} 
            style={{ 
              transform: isFabOpen ? 'rotate(45deg)' : 'none', 
              transition: 'transform 0.3s ease' 
            }} 
          />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          <Home size={28} strokeWidth={activeTab === 'inicio' ? 2.5 : 2} />
          <span>Início</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`}
          onClick={() => setActiveTab('agenda')}
        >
          <Calendar size={28} strokeWidth={activeTab === 'agenda' ? 2.5 : 2} />
          <span>Agenda</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('clientes')}
        >
          <Users size={28} strokeWidth={activeTab === 'clientes' ? 2.5 : 2} />
          <span>Aprendentes</span>
        </button>
      </nav>

    </div>
  )
}

export default App
