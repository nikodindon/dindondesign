# Guide de Dispatch Dindon Design

## Règle d'Or: CTO NE CODE PAS
- CTO = spec + prompts UNIQUEMENT
- Les workers génèrent TOUT le code
- Pas coder soi-même même si ça urge

## ⚠️ RÈGLE CRUCIALE: NO MARKDOWN, ONLY CODE
- **TOUJOURS** ajouter "NO MARKDOWN, ONLY CODE" dans les prompts
- Le modèle sinon écrit du markdown avec des explications
- Vérifier le code reçu - si markdown → reprompter
- Extraction du JSON: le code est dans `choices[0].message.content`

## Workflow Standard

```bash
# 1. Créer SPEC.md avec todos les détails (constants, fonctions, structure)
# 2. Créer dossier
mkdir -p /home/niko/dindondesign/projects/<nom>/src

# 3. Dispatcher 1 fichier par worker en parallèle
#    - vivobook → input.js (172.20.16.1:8080) 
#    - nitro → index.html (100.66.131.33:8080)
#    - nitro → style.css (100.66.131.33:8080) [SI PAREIL, job consécutifs]
#    - desktop → game.js (100.118.85.70:8080)

# 4. Utiliser background=true pour éviter timeouts
# 5. Extraire code du JSON wrapper si besoin
# 6. Lancer serveur: python3 -m http.server <PORT> --bind 0.0.0.0
```

## ⚠️ Comparaison Single vs Multi

| Approche | Avantages | Inconvénients |
|----------|-----------|---------------|
| **Single** (desktop only, 1 fichier) | oneshot complet, plus simple | 1 seul worker |
| **Multi** (3 workers, 3 fichiers) | parallel, chaque worker spécialisé | prompts + complexes, risque markdown |

## Test: Snake Single vs Multi
- Single (4017): game.html → ✅ Jouable!
- Multi (4018): index.html = markdown → ❌ Cassé
- LEÇON: Pour l'instant single plus fiable pour oneshot complet

## Matching Worker → Task Size

| Worker | Modèle | Vitesse | Best For |
|--------|--------|---------|----------|
| desktop | Qwen3.6-35B Q4_K_XL | ~12-25 t/s | Gros: game.js complet |
| nitro | Qwen3.6-35B IQ3_S | ~10 t/s | Moyen: HTML/CSS, input.js |
| vivobook | Qwen3.6-35B IQ2_XXS | ~6 t/s | Petit: petit HTML |

## Ports Jeux

- Space Invaders: 4010
- Snake Battle Royale: 4011
- Tetris: 4012 (cassé)
- Breakout: 4013
- Pong: 4015
- Asteroids: 4016