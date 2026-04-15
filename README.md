<div align="center">

# NeuroFlow

**Plataforma clínica e administrativa para Neuropsicopedagogia**

*Gestão inteligente de aprendentes, relatórios automatizados e protocolos de avaliação em um único lugar.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)

</div>

---

## Visão Geral

O **NeuroFlow** é um Progressive Web App (PWA) projetado para profissionais de Neuropsicopedagogia e Psicopedagogia. A plataforma centraliza as principais demandas de um consultório moderno: do cadastro do aprendente até a emissão de relatórios clínicos completos, com uma interface responsiva que funciona tanto no desktop quanto em dispositivos móveis.

O sistema foi construído com ênfase em **segurança clínica**, utilizando terminologia compatível com as normas do CFP e da ABPp — como "indicativos" e "hipóteses" — evitando o uso de diagnósticos fechados nos documentos gerados.

---

## Funcionalidades

### Gestão de Aprendentes
Cadastro completo com anamnese estruturada, histórico de sessões, registro evolutivo e controle financeiro individual. O perfil do aprendente concentra todos os dados clínicos e administrativos em uma única tela.

### Motor de Relatórios Clínicos (RAN / PIN / Encaminhamentos)
Geração automatizada de documentos prontos para impressão:
- **RAN** — Relatório de Avaliação Neuropsicopedagógica
- **PIN** — Plano de Intervenção Neuropsicopedagógica
- **Encaminhamentos** — Documentos de referenciamento para outros especialistas

Todos exportáveis em PDF com layout limpo, sem a interface da aplicação.

### Smart Fill V2 — Motor de Sugestões
Sistema heurístico que analisa os indicativos registrados na anamnese e sugere automaticamente baterias e protocolos de avaliação adequados ao perfil do aprendente (ex: EAME-IJ, TDE, BPA, WISC).

### Protocolos de Avaliação Customizáveis
Construção, edição e aplicação de protocolos de avaliação diretamente pelo profissional. Resultados vinculados ao perfil do aprendente e disponíveis para consulta no histórico.

### Agenda e Gestão de Sessões
Visualização diária de atendimentos, agendamento rápido, controle de pagamentos, remarcação e cancelamento — tudo sincronizado em tempo real via Supabase.

### Dashboards e Analytics
Gráficos interativos de evolução por domínios cognitivos e funções executivas. Mapas de cobertura que permitem visualizar, de forma clara, o progresso de cada aprendente ao longo do tempo.

### Portal dos Pais
Rota pública autenticada por PIN exclusivo que permite às famílias acompanharem informações essenciais do processo de intervenção, sem acesso aos dados clínicos completos.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 + TypeScript 5.9 |
| Roteamento | React Router 7 |
| Build & Dev Server | Vite 8 |
| Backend & Database | Supabase (PostgreSQL + Auth + RLS) |
| Estilização | Vanilla CSS com Design Tokens |
| Ícones | Lucide React |
| PWA | vite-plugin-pwa |
| Qualidade de Código | ESLint (Strict Type-Checked) |

---

## Arquitetura do Projeto

O projeto adota a **Feature-Sliced Architecture**, onde cada módulo de negócio é isolado em sua própria pasta dentro de `features/`. Isso garante baixo acoplamento, facilidade de manutenção e escalabilidade para adicionar novos módulos clínicos sem impactar os existentes.

```
src/
├── components/          # Componentes UI reutilizáveis (Layout, BottomNav, FABMenu)
├── context/             # Estado global da aplicação (AppContext, Auth)
├── features/
│   ├── agenda/          # Visualização diária e controle da agenda
│   ├── analytics/       # Gráficos de evolução e mapas de cobertura
│   ├── aprendentes/     # Cadastro, perfil, configuração e encerramento de aprendentes
│   ├── auth/            # Autenticação (login, sessão, logout)
│   ├── dashboard/       # Tela inicial com resumo de atendimentos e métricas
│   ├── portal/          # Portal dos Pais (rota pública por PIN)
│   ├── protocolos/      # Construtor, listagem e aplicação de protocolos
│   ├── ran/             # Módulo de relatórios clínicos (RAN, PIN, Encaminhamentos, Devolutiva)
│   └── sessoes/         # Agendamento de sessões e controle financeiro
├── hooks/               # Custom Hooks (useAuth, etc.)
├── lib/
│   └── types.ts         # Definições de tipos TypeScript globais
└── App.tsx              # Configuração de rotas e AuthGate
```

### Fluxo de Autenticação e Rotas

O componente `AuthGate` em `App.tsx` é responsável por proteger todas as rotas da aplicação. Ele apresenta o `LoginPage` para usuários não autenticados, enquanto usuários autenticados têm acesso ao `AppProvider` que carrega todos os dados via Supabase com Row Level Security (RLS) ativo — garantindo que cada profissional acesse exclusivamente seus próprios dados.

A única exceção é a rota `/portal/:pin`, que é pública e acessível sem autenticação.

---

## Configuração do Ambiente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Conta e projeto configurado no [Supabase](https://supabase.com/)

### Instalação

**1. Clone o repositório**
```bash
git clone https://github.com/CaiquePSilva/NeuroFlow.git
cd NeuroFlow
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

> **Importante:** Nunca exponha a `service_role key`. A `anon key` é segura para uso no cliente pois o acesso aos dados é controlado pelas políticas de RLS no Supabase.

**4. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Compila TypeScript e gera o bundle de produção |
| `npm run preview` | Serve o bundle de produção localmente |
| `npm run lint` | Executa o ESLint em todo o projeto |

---

## Deploy

O NeuroFlow está configurado para deploy contínuo na **Vercel** com as seguintes configurações:

| Configuração | Valor |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Variáveis de ambiente necessárias no painel da Vercel:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Após o deploy, o `vite-plugin-pwa` gera automaticamente o Service Worker e o manifesto, habilitando a instalação do app em dispositivos móveis e o funcionamento offline.

---

## Considerações de Segurança Clínica

O NeuroFlow foi desenvolvido em conformidade com as diretrizes éticas do **Conselho Federal de Psicologia (CFP)** e da **Associação Brasileira de Psicopedagogia (ABPp)**:

- Relatórios utilizam exclusivamente os termos **"indicativos"** e **"hipóteses"** — nunca diagnósticos fechados.
- Dados de aprendentes são isolados por profissional via **Row Level Security (RLS)** no Supabase.
- O acesso ao Portal dos Pais é controlado por um PIN único por aprendente.

---

<div align="center">

**NeuroFlow** · Desenvolvido por [Caique P. Silva](https://github.com/CaiquePSilva)

</div>
