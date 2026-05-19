# Guide de Dispacth Dindon Design

## Règle d'Or: CTO NE CODE PAS
- CTO = spec + prompts UNIQUEMENT
- Les workers génèrent TOUT le code
- Pas coder soi-même même si ça urge

## Workflow Standard

```bash
# 1. Créer SPEC.md avec todos les détails (constants, fonctions, structure)
# 2. Créer dossier
mkdir -p /home/niko/dindondesign/projects/<nom>/src

# 3. Dispatcher 1 fichier par worker en parallèle
#    - vivobook → input.js (172.20.16.1:8080) 
#    - nitro → index.html + style.css (100.66.131.33:8080)
#    - desktop → game.js (100.118.85.70:8080)

# 4. Utiliser background=true pour éviter timeouts
curl -s -X POST http://<IP>:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "...", "messages": [{"role": "user", "content": "..."}]}' \
  -o /home/niko/dindondesign/projects/<nom>/src/<fichier>

# 5. Extraire code du JSON wrapper si besoin
# 6. Lancer serveur: python3 -m http.server <PORT> --bind 0.0.0.0
```

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