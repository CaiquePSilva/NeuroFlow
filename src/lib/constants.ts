// ==========================================
// Constantes do NeuroFlow
// ==========================================

export const MOTIVOS_ENCERRAMENTO = [
  "Alta Clínica/Pedagógica (Objetivos alcançados)",
  "Desistência - Fator Financeiro/Custo",
  "Desistência - Incompatibilidade de Horários",
  "Desistência - Mudança de Cidade/Logística",
  "Encaminhamento para outro profissional",
  "Pausa temporária (Trancamento)",
  "Outros"
]

// ==========================================
// Dados do Consultório
// ==========================================

export const DADOS_PROFISSIONAL = {
  // Identidade principal
  nome: 'Elvira G. dos Santos Portes',
  nomeAbreviado: 'Elvira Portes',
  titulos: 'Pedagoga / Neuropsicopedagoga / Psicopedagoga',
  titulo: 'Neuropsicopedagoga',
  registro: 'CBO 2394-25',
  consultorio: 'Espaço NeuroAprendiz',

  // Contato
  telefone: '(11) 94171-6325',
  email: 'eportesneuropsicopedag@gmail.com',
  instagram: '@espaconeuroaprendiz',

  // Endereço (rodapé)
  endereco: 'Tv. São Valentin 60, Itatiba, SP',
  cidade: 'Itatiba',

  // Assets
  logoUrl: '/assets/logo-elvira.png',

  // Parceiro (opcional — remover ou deixar null para não exibir)
  parceiro: {
    nome: 'Clínica CETMA',
    telefone: '(11) 99931-5196',
    instagram: '@clinicacetma',
    logoUrl: '/assets/logo-cetma.png',
  } as {
    nome: string
    telefone: string
    instagram: string
    logoUrl: string
  } | null,
}

// ==========================================
// Frases-Modelo para RANs (linguagem de "indicativos")
// ==========================================

export const FRASES_HIPOTESES = [
  'Os dados obtidos são sugestivos de dificuldades no campo da atenção sustentada.',
  'Observam-se indicadores compatíveis com dificuldades na regulação emocional, sem caráter diagnóstico.',
  'Os resultados indicam necessidade de suporte pedagógico especializado nas áreas avaliadas.',
  'As avaliações neuropsicopedagógicas evidenciam indicativos de dificuldades de aprendizagem.',
  'Recomenda-se investigação neurológica complementar para melhor compreensão do quadro.',
  'O desempenho observado é sugestivo de dificuldades no processamento fonológico.',
  'Identificam-se indicadores de impacto nas funções executivas, com ênfase em planejamento e organização.',
]

export const FRASES_RECOMENDACOES = [
  'Acompanhamento neuropsicopedagógico com frequência de duas sessões semanais.',
  'Intervenção fonoaudiológica para desenvolvimento das habilidades de linguagem e comunicação.',
  'Avaliação neurológica para investigação de aspectos relacionados às funções atencionais.',
  'Orientação familiar e escolar para implementação de estratégias de suporte ao aprendente.',
  'Reaplicação dos instrumentos de avaliação em 6 meses para monitoramento de progressos.',
  'Adaptações curriculares conforme legislação vigente (Lei nº 13.146/2015).',
]

export const ESPECIALIDADES_ENCAMINHAMENTO = [
  'Neuropediatria',
  'Fonoaudiologia',
  'Psicologia',
  'Psicopedagogia',
  'Terapia Ocupacional',
  'Psiquiatria Infantil',
  'Oftalmologia',
  'Outro',
] as const
