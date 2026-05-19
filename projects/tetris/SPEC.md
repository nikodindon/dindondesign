# TETRIS — Dindon Design v0.1

## Game Design Document

---

## 1. VISION

Un clone de Tetris jouable en navigateur web, style retro arcade neon. 2-4 joueurs возможно (optionnel v0.2). Pour v0.1 : solo uniquement.

---

## 2. RÈGLES DU JEU

### Pièces (Tetriminos)
7 pièces classiques :
| Pièce | Forme | Couleur |
|-------|-------|---------|
| I | ██████ | Cyan |
| O | ████ | Yellow |
| T | █████ | Purple |
| S | ████ | Green |
| Z | ████ | Red |
| J | ███ | Blue |
| L | ███ | Orange |

### Contrôles
- **← →** : Déplacement latéral
- **↓** : Soft drop (descente rapide)
- **↑** : Rotation horaire
- **Espace** : Hard drop (chute instantanée)
- **P** : Pause

### Ligne clearing
- 1 ligne : 100 pts
- 2 lignes : 300 pts
- 3 lignes : 500 pts
- 4 lignes (Tetris) : 800 pts

### Niveau et vitesse
- Niveau increases toutes les 10 lignes
- Vitesse : descend de 1000ms à 50ms (min)
- Game over quand une nouvelle pièce ne peut pas spawner

---

## 3. ARCHITECTURE TECHNIQUE

### Fichiers à créer
```
src/
├── index.html      # HTML principal + CSS inline
├── game.js         # CORE: game loop, board, scoring
├── piece.js        # Pièces, rotations, couleurs
├── input.js        # Gestion clavier
└── renderer.js     # Canvas drawing
```

### Constantes
```javascript
const COLS = 10;
const ROWS = 20;
const CELL = 30;
const COLORS = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000'
};
```

### Board representation
Tableau 2D [20][10] de integers :
- 0 = vide
- 1-7 = couleur pièce

---

## 4. FONCTIONNALITÉS V0.1

### Must have
- [x] 7 pièces aléatoires avec probabilités égale
- [x] Rotation 90° horaire (SRT wall kick simple)
- [x] Collision detection (murs, sol, pièces)
- [x] Hard drop + soft drop
- [x] Ligne clearing + scoring
- [x] Niveau progressif
- [x] Game over detection
- [x] Pause
- [x] Affichage next piece
- [x] Affichage score/level/lignes

### Nice to have v0.2
- Ghost piece
- Hold piece
- Multiplayer
- Sound effects

---

## 5. STYLE VISUEL

### Couleurs
- Background: #0a0a0a
- Grid: #1a1a1a
- UI: neon green #00ff88
- Score: white

### Font
- 'Courier New', monospace
- Pixel art style si possible

### Effets
- Ligne qui disparaît : flash blanc avant clear
- Game over : overlay rouge

---

## 6. DISTRIBUTION TRAVAIL

### desktop (100.118.85.70:8080)
**Tâche principale : CORE engine**
- game.js complet (game loop, board, collision, scoring, niveaux)
- piece.js (définitions pièces, rotations)

### nitro (100.66.131.33:8080)  
**Tâche principale : UI/Pixel art**
- Renderer : dessins pièces, board, effets visuels
- Input handler simple (si temps)

### CTO
- SPEC
- Architecture fichiers
- Assemblage final
- Tests

---

## 7. CRITÈRES DE SUCCÈS

1. Jeu démarre sans erreurs JS
2. Les pièces spawn et tombent
3. Rotation fonctionne
4. Les lignes se clear
5. Score augmente
6. game over quand bloqué
7. Contrôles fluides
8. Style neon rétro

---

*Dindon Design - Tetris v0.1*