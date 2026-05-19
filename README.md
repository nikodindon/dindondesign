# Dindon Design 🦃

**Studio de développement IA distribué et indépendant**

---

## Vision

Dindon Design est un studio software expérimental piloté par IA distribuée sur plusieurs machines personnelles interconnectées via Tailscale. L'objectif : produire rapidement des MVP amusants et utiles, automatiser le développement, et créer des workflows robustes sans bullshit startup.

## Philosohie

- Petits produits fun, pas de projets gigantiques
- Architecture simple et robuste
- Itération rapide > planification excessive
- Équipements existants maximisés
- Dette technique évitée

## Infrastructure

### Workers IA

| Machine | Hardware | Rôle | Priorité |
|---------|----------|------|----------|
| vivobook | Ryzen 5 5500U, 20GB RAM | Archiviste / Coordinateur | Faible |
| nitro | i5-8300H, GTX 1050, 16GB | Frontend Engineer + QA | Moyenne |
| desktop | Ryzen 1600 AF, 32GB, GTX 1650 | Senior Software Engineer | Élevée |

### Stack Technique

- **Langages** : Python, HTML/CSS/JS, Node.js léger
- **Backend** : FastAPI, SQLite
- **Tools** : Git, Docker (si utile), JSON, Markdown

---

## Projets

### Space Invaders (port 4010)
Classic arcade shooter - Player vs aliens. ✅ Jouable

### Snake Battle Royale (port 4011)
Snake multiplayer-style with AI opponents. ✅ Jouable (quelques bugs AZERTY)

### Tetris (port 4012)
Classic block-stacking game. ❌ Cassé (mauvais dispatch)

### Breakout (port 4013)
Classic brick-breaker. ✅ Jouable

### Pong (port 4015)
Classic 1-player Pong vs AI. ✅ 100% AI workers!

### Asteroids (port 4016)
Classic asteroid shooter. ✅ 100% AI workers!

---

Tous les jeux sont jouables via `http://<IP>:PORT`

Voir `projects/` pour les specs détaillées.

## Roadmap

Voir `roadmap/` pour les objectifs à court et long terme.

---

*Studio opérationnel depuis 2025 • Fondé par Niko, CEO 🦃*