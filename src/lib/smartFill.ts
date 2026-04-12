import type { NotaSessao } from './types'

function getAverages(notas: NotaSessao[]) {
  const cEng = notas.filter(n => n.engajamento)
  const avgEng = cEng.length ? cEng.reduce((a, b) => a + (b.engajamento || 0), 0) / cEng.length : 0

  const cReg = notas.filter(n => n.regulacaoEmocional)
  const avgReg = cReg.length ? cReg.reduce((a, b) => a + (b.regulacaoEmocional || 0), 0) / cReg.length : 0

  return { avgEng, avgReg }
}

function getRanks(notas: NotaSessao[]) {
  const counts: Record<string, number> = {}
  notas.forEach(n => {
    n.tags.forEach(t => {
      counts[t] = (counts[t] || 0) + 1
    })
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export function generateHipoteses(notas: NotaSessao[]): string | null {
  if (notas.length === 0) return null

  const { avgEng, avgReg } = getAverages(notas)
  const rank = getRanks(notas)
  const total = notas.length

  let texto = `Com base nas observações clínicas estruturadas ao longo de ${total} encontro(s) registrados, `

  if (rank.length > 0) {
    const top = rank.slice(0, 2).map(r => r[0])
    texto += `nota-se uma incidência significativa de componentes de ordem ${top.join(' e ')} nas demandas apresentadas.\n\n`
  } else {
    texto += `nota-se uma demanda difusa no perfil de desenvolvimento comportamental.\n\n`
  }

  // Engajamento insight
  texto += `No tocante ao engajamento e flexibilidade cognitiva, o aprendente apresenta indicativos `
  if (avgEng >= 4.0) texto += `de forte envolvimento na relação terapêutica (nível basal contínuo). `
  else if (avgEng >= 3.0) texto += `de participação satisfatória porém com flutuações dependendo do estímulo. `
  else if (avgEng > 0) texto += `de resistência ou baixo envolvimento frente às atividades diretivas. `
  else texto += `de padrão variável nas sessões observadas. `

  // Regulação insight
  if (avgReg > 0) {
    texto += `A regulação emocional mapeada se mostrou `
    if (avgReg >= 4.0) texto += `suficientemente estável e adequada para sustentar o aprendizado.`
    else if (avgReg >= 3.0) texto += `passível de mediação, requerendo balizamento do profissional em momentos de frustração.`
    else texto += `frágil, evidenciando reatividade ou baixa tolerância à frustração perante os desafios.`
  }

  return texto
}

export function generateRecomendacoes(notas: NotaSessao[]): string | null {
  if (notas.length === 0) return null

  const { avgEng, avgReg } = getAverages(notas)
  const rank = getRanks(notas)
  const topTags = rank.slice(0, 3).map(r => r[0])

  const sugestoes: string[] = []

  if (avgEng < 3.5 && avgEng > 0) {
    sugestoes.push('- Adequação do vínculo: Utilizar recursos altamente motivadores e de interesse direto do paciente nas aberturas das atividades, intercalados por pausas estratégicas.')
  }

  if (avgReg < 3.5 && avgReg > 0) {
    sugestoes.push('- Programa específico para Autorregulação: Incluir treino de identificação emocional e regulação do impulso/reatividade através de atividades lúdicas e previsibilidade rotineira.')
  }

  if (topTags.includes('cognitivo')) {
    sugestoes.push('- Treino Cognitivo Sistematizado: Intervenção neuropsicopedagógica focada na estimulação direta das funções executivas e sustentação do processamento cognitivo.')
  }

  if (topTags.includes('acadêmico')) {
    sugestoes.push('- Adaptação Escolar Curricular: Comunicação estreita com a escola (coordenação e regência) buscando simplificação das instruções, maior apoio pedagógico e/ou flexibilização avaliativa.')
  }

  if (topTags.includes('motor')) {
    sugestoes.push('- Encaminhamento Multidisciplinar (Terapia Ocupacional/Psicomotricidade): Avaliação clínica do perfil motor, sensorial ou de lateralidade para suporte coadjuvante no processo acadêmico.')
  }

  if (topTags.includes('linguagem') || topTags.includes('social')) {
    sugestoes.push('- Encaminhamento Multidisciplinar (Fonoaudiologia/Psicologia): Investigação paralela a fundo sobre o circuito perceptivo da fala ou pragmática social e comunicativa.')
  }

  // Fallback genérico se tudo estiver muito perfeito nas notas ou faltar tags
  if (sugestoes.length === 0) {
    sugestoes.push('- Manutenção: Prosseguir com o processo de estimulação de base para manutenção dos resultados bem mapeados.')
  }

  return `Com base na inteligência analítica das áreas de necessidade do aprendente, sugere-se o seguinte plano tático de encaminhamentos e orientações:\n\n${sugestoes.join('\n\n')}`
}
