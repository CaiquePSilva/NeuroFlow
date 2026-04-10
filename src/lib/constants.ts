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
// Dados do Consultório (editar aqui por enquanto)
// ==========================================

export const DADOS_PROFISSIONAL = {
  nome: 'Elvira Portes',
  titulo: 'Neuropsicopedagoga',
  registro: 'CRFa 12.345',        // adaptar conforme o registro real
  consultorio: 'Espaço NeuroAprendiz',
  endereco: 'Rua das Flores, 123 — Belo Horizonte / MG',
  telefone: '(31) 9 9999-9999',
  email: 'contato@neuroaprendiz.com.br',
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
