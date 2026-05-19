# Architecture Dindon Design

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    HERMES (CTO)                          │
│               minimax-m2.5 via ollama-cloud              │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │vivobook │    │  nitro  │    │ desktop │
   │(local)  │────│(Tailscale)───│(Tailscale)│
   │  OFFLINE│    │  ONLINE │    │  ONLINE  │
   └─────────┘    └─────────┘    └─────────┘
```

## Workers

### vivobook (CTO local)
- **Rôle** : Archiviste, Coordinateur, DevOps léger
- **Endpoint** : http://172.20.16.1:8080 (via WSL)
- **Modèle** : Qwen3.6-35B-A3B-UD-IQ2_XXS (10GB, 65K context)
- **Statut** : ✅ ONLINE

### nitro
- **Rôle** : Frontend Engineer + QA
- **Endpoint** : http://100.66.131.33:8080
- **Modèle** : Qwen3.6-35B-A3B-UD-IQ3_S (IQ3_S - petite quantization)
- **Capacités** : Frontend web, UI, tests, debugging, QA

### desktop
- **Rôle** : Senior Software Engineer
- **Endpoint** : http://100.118.85.70:8080
- **Modèle** : Qwen3.6-35B-A3B-UD-Q4_K_XL (Q4_K_XL - grosse quantization)
- **Capacités** : Backend complexe, architecture, raisonnement principal

## Orchestration

### Workflow Actuel
1. **CTO** crée SPEC.md détaillée puis dispatche 1 fichier par worker
2. **3 workers bossent en parallèle** sur 3 fichiers différents
3. **Pas de timeouts** - background=true, le code arrive quand il arrive
4. **CTO ne code jamais** - si worker échoue, reprompter

### Dispatch Standard
- **vivobook** (172.20.16.1:8080, IQ2_XXS) → input.js
- **nitro** (100.66.131.33:8080, IQ3_S) → index.html + style.css  
- **desktop** (100.118.85.70:8080, Q4_K_XL) → game.js

### Résultats
- Pong: 100% workers ✅
- Asteroids: 100% workers ✅
- Premier vrai test du workflow distribué réussi!

## Communication

- API OpenAI compatible sur chaque worker
- Tailscale pour le réseau privé entre machines
- Files système pour logs et résultats inter-processus