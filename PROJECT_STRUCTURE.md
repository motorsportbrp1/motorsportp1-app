# 🏗️ MotorSport P1 - Estrutura Organizacional e Checklist

Este documento reflete a estrutura exata das pastas e arquivos planejada para o projeto, com indicadores (`[x]` para implementado e `[ ]` para pendente) do que **já temos no sistema atual** e o que ainda precisa ser criado.

---

## 🖥️ 1. Frontend (Next.js)
A base do frontend está sólida e quase todas as páginas visuais já foram prototipadas e construídas através dos componentes.

```text
frontend/
├── 📁 public/
│   ├── favicon.ico
│   └── 📁 assets/                     # (Opcional) SVG, Imagens
├── 📁 src/
│   ├── 📁 app/                        # 🟢 App Router (Rotas da Aplicação - Implementadas)
│   │   ├── layout.tsx                 [x] Root layout file
│   │   ├── page.tsx                   [x] Home Route (/)
│   │   ├── 📁 compare/                [x] Driver Compare Route (/compare)
│   │   ├── 📁 live/                   [x] Live Timing Route (/live)
│   │   ├── 📁 race/                   [x] Race Weekend Route (/race)
│   │   ├── 📁 seasons/                [x] Seasons Route (/seasons)
│   │   ├── 📁 session/                [x] Session Analyzer Route (/session)
│   │   └── 📁 settings/               [x] Settings Route (/settings)
│   │
│   ├── 📁 components/                 # 🟢 Componentes Reutilizáveis
│   │   ├── 📁 layout/
│   │   │   ├── ClientLayout.tsx       [x] 
│   │   │   ├── Footer.tsx             [x]
│   │   │   ├── Header.tsx             [x]
│   │   │   ├── Navbar.tsx             [x]
│   │   │   ├── Sidebar.tsx            [x]
│   │   │   └── ThemeProvider.tsx      [x]
│   │   │
│   │   ├── 📁 pages/                  # 🟢 View Pages (Onde a lógica/UI está de fato)
│   │   │   ├── DriverComparePage.tsx  [x]
│   │   │   ├── HomePage.tsx           [x]
│   │   │   ├── LiveTimingPage.tsx     [x]
│   │   │   ├── RaceWeekendPage.tsx    [x]
│   │   │   ├── SessionAnalyzerPage.tsx[x]
│   │   │   ├── SettingsPage.tsx       [x]
│   │   │   ├── 📁 drivers/            
│   │   │   │   ├── DriversIndexPage.tsx   [x]
│   │   │   │   └── DriverProfilePage.tsx  [x]
│   │   │   └── 📁 seasons/
│   │   │       ├── SeasonsIndexPage.tsx   [x]
│   │   │       └── SeasonDetailPage.tsx   [x]
│   │   │
│   │   ├── 📁 ui/                     [ ] (Opcional) Base UI Components (Buttons, Cards, Modals genéricos)
│   │   ├── 📁 charts/                 [ ] (Pendente) Componentes ECharts reutilizáveis
│   │   └── 📁 track/                  [ ] (Pendente) TrackMap SVG interativo
│   │
│   ├── 📁 hooks/                      # 🔴 Lógica de Dados (A Conectar com o Backend)
│   │   ├── useSession.ts              [ ] Hook para ler Laps/Stints da API
│   │   ├── useTelemetry.ts            [ ] Hook para Telemetria
│   │   ├── useLiveTiming.ts           [ ] Hook WebSocket para o Live Timing
│   │   └── useCompare.ts              [ ] Hook para Comparação de Deltas
│   │
│   ├── 📁 lib/                        # 🟡 Utilidades e Integrações
│   │   ├── api.ts                     [ ] Axios/Fetch wrapper configurado para o Backend Python
│   │   ├── supabase.ts                [ ] (Pendente) Inicializador do Cliente Supabase no Front
│   │   ├── ws.ts                      [ ] (Pendente) Conexão do WebSockets
│   │   └── 📁 mock-data/              [x] (Usado amplamente nos atuais componentes das páginas)
│   │
│   └── 📁 types/                      # 🟡 Interfaces TypeScript
│       └── index.ts                   [ ] Interfaces de Session, Driver, Lap, Telemetry, etc.
```

---

## ⚙️ 2. Backend (FastAPI / F1 Python)
A base do projeto já foi gerada com a conexão do banco de dados relacional e a carga histórica concluída, mas as *Regras de Negócio, Endpoints e Integrações do F1Fast* ainda estão vazias e precisarão ser montadas.

```text
backend/
├── main.py                            [x] Arquivo inicial do FastAPI (Boilerplate com CORS e Health Check)
├── .env                               [x] Variáveis de ambiente
├── requirements.txt / pyproject.toml  [ ] (Pendente) Definir e congelar as dependências corretas
├── 📁 data/                           [x] CSVs da f1db usados no seed
├── seed.py (e semelhantes)            [x] Scripts utilizados para a importação de dados para o Supabase
│
├── 📁 app/
│   ├── 📁 api/                        # 🔴 Routers / Controladores da API
│   │   └── 📁 v1/
│   │       ├── schedule.py            [ ] Retorna as temporadas e calendários (do Supabase)
│   │       ├── session.py             [ ] Retorna Stints e Laps (FastF1 -> Cache)
│   │       ├── telemetry.py           [ ] Retorna TelemetrySample (FastF1 -> Cache)
│   │       ├── compare.py             [ ] Delta calculation
│   │       ├── live.py                [ ] WebSocket do Live Timing
│   │       └── router.py              [ ] Junta todos os arquivos acima para o main.py
│   │
│   ├── 📁 services/                   # 🔴 Regras de negócio (Onde a lógica pesada rola)
│   │   ├── schedule_service.py        [ ] Busca informações no banco de dados e retorna pra API
│   │   ├── session_service.py         [ ] Carrega a FastF1 e devolve os dados limpos
│   │   ├── telemetry_service.py       [ ] Converte a telemetria grossa para os gráficos
│   │   ├── compare_service.py         [ ] Math de delta e interpolação de curvas
│   │   ├── live_timing_service.py     [ ] Pooling/PubSub no LiveTiming
│   │   └── cache_service.py           [ ] Wrapper pro Redis
│   │
│   ├── 📁 models/                     # 🔴 Modelos Pydantic (Validadores REST)
│   │   ├── session.py                 [ ]
│   │   ├── lap.py                     [ ]
│   │   ├── telemetry.py               [ ]
│   │   ├── driver.py                  [ ]
│   │   └── live.py                    [ ]
│   │
│   ├── 📁 clients/                    # 🔴 Clientes Externos
│   │   ├── fastf1_client.py           [ ] O wrapper principal que converte Pandas DF para Dict/Pydantic
│   │   └── live_timing_client.py      [ ] Conector para `livetiming.formula1.com/static`
│   │
│   └── 📁 db/                         # 🟡 Banco de Dados e Conexões
│       └── supabase_client.py         [ ] Inicializador da lib `supabase-py` para interagir com o server
```

---

## ☁️ 3. Infraestrutura & DevOps (Fase Final)
Atualmente inexistente, isso virá depois que o backend começar a rodar as rotas locais.

```text
infra/
├── docker/
│   └── redis.conf                     [ ] Configurações do Redis para Caching do Live e Queries
├── docker-compose.yml                 [ ] (Pendente) Para rodar O Backend + Redis juntos com um comando
└── scripts/
    └── preload_cache.py               [ ] Warm-up cache para não engasgar no 1º load do usuário
```

---

## 🎯 **Resumo do Checklist e o Fator de Bloqueio**

Como você pode observar:
1. ✓ **Estrutura de Layout e UI das Páginas (Frontend)** já existem em grande parte do caminho.
2. ✓ **Carga Historica do Banco DB (1950-2025)** já existe através dos scripts em `backend/*.py`.
3. ❌ **Lógica do Backend, Rotas (API) e Casters/Modelos (Pydantic / Services)** nas subpastas `backend/app/*` estão atualmente sem arquivos. 
4. ❌ **Conexão Real do Frontend (Hooks / Lib)** atualmente o front lê componentes e dados Mock (fakes) via arquivos TypeScript. Precisamos plugar essas páginas com requisições *Fetch/Axios* usando os `.ts` da pasta `hooks/` direcionados para o Backend assim que suas rotas forem criadas.
