# Dindon Design - Worker Orchestration Guide

## RÈGLES DE DISPATCH

### Par taille de travail
| Taille estimée | Worker | Modèle | Vitesse |
|----------------|--------|--------|---------|
| **GROS** (>5KB) | desktop | Q4_K_XL | 12 tok/s |
| **MOYEN** (2-5KB) | nitro | IQ3_S | 10 tok/s |
| **PETIT** (<2KB) | vivobook | IQ2_XXS | 6 tok/s |

### Exemples corrects
| Travail | Taille | Worker |
|---------|--------|--------|
| game.js complet | 7KB | desktop |
| HTML/CSS complet | 8KB | desktop |
| input.js | 2.7KB | **vivobook** |
| CSS seul | 1KB | vivobook |

### NEVER
- Donner gros travail à vivobook (plus faible)
- Donner petit travail à desktop (gaspillage)

---

## WORKFLOW CTO

1. **ANALYSE** le travail à faire
2. **DÉCOUPEn** en tâches par taille
3. **ATTRIBUE** selon règles ci-dessus
4. **LANCE EN PARALLÈLE**
5. **VÉRIFIE** chaque résultat
6. **REPROMPRT** si insatisfaisant
7. **ASSEMBLE** et teste
8. **COMMIT** sur GitHub

---

## COMMANDES

```bash
# Lancer un worker
curl -s -X POST http://WORKER_IP:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "MODEL_NAME", "messages": [...], "max_tokens": N}'

# Sauvegarder résultat
jq -r '.choices[0].message.content' > output.js
```

---

## TEMPS ESTIMÉS

| Worker | 2KB | 5KB | 10KB |
|--------|-----|-----|------|
| desktop | 10s | 25s | 50s |
| nitro | 15s | 30s | 60s |
| vivobook | 25s | 50s | 100s |