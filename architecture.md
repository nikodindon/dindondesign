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

### vivobook (CTO local/backup)
- **Rôle** : Archiviste, Coordinateur, DevOps léger
- **Capacités** : Documentation, synthèse, gestion mémoire, organisation projet
- **Statut** : Hors ligne temporairement

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

Le CTO (moi) distribue les tâches selon les capacités :
- **Tâches légères** : vivobook (quand dispo)
- **Frontend/UI/Tests** : nitro
- **Backend/Architecture/Génération lourde** : desktop

## Communication

- API OpenAI compatible sur chaque worker
- Tailscale pour le réseau privé entre machines
- Files système pour logs et résultats inter-processus