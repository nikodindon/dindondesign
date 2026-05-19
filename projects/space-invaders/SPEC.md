# Space Invaders - Game Design

## Concept
Jeu d'arcade rétro en HTML5/Canvas. Le joueur contrôle un vaisseau pour éliminer des vagues d'ennemis avant qu'ils n'atteignent le bas de l'écran. Boucle : déplacement → tir → survie → score-chasing. Ambiance arcade 8-bit, rythme rapide, facile à prendre en main, difficile à maîtriser.

## Gameplay
- **Contrôles** : `←` `→` (déplacement), `ESPACE` (tir).
- **Mécaniques** : 
  - Déplacement horizontal fluide, clamping aux bords.
  - Tir avec cooldown (0.25s).
  - Grille ennemie (5x11) se déplaçant latéralement.
  - Collision AABB.
  - Score progressif (10/20/30 pts). Combo x1.5 si >5 éliminations en <3s.
  - 3 vies. Game Over si vies à 0 ou ligne inférieure atteinte.

## Levels
- **Progression** : 10 vagues fixes + mode infini.
  - Vagues 1-3 : vitesse lente, tir ennemi rare, déplacement rectiligne.
  - Vagues 4-6 : vitesse moyenne, tir ponctuel, formation en V, boucliers destructibles.
  - Vagues 7-9 : vitesse rapide, tir fréquent, mouvements saccadés, patterns latéraux aléatoires.
  - Vague 10+ : vitesse maximale, tir automatique ennemi, boss intermédiaire toutes les 3 vagues.

## Power-ups
- **Spawn** : aléatoire (5% chance/tir ennemi ou toutes les 30s)
  - 🔥 **Triple Shot** : 3 projectiles en éventail (5s)
  - 🛡️ **Bouclier** : Absorbe 1 impact (3s)
  - ⏳ **Slow-Mo** : -60% vitesse ennemis (4s)
  - 💣 **EMP** : Désactive ennemis 2s + score x2
  - 🚀 **Speed Boost** : Double vitesse déplacement/tir (5s)

## Graphics
- **Style** : Pixel art 8-bit, Canvas 2D avec `imageSmoothingEnabled = false`.
- **Palette** : Fond #0a0a0a, vaisseau #00ff41, ennemis cyan/magenta/jaune.
- **Sprites** : 16x16 ou 32x32 drawn via canvas.
- **UI** : HUD monospace en haut (score, vies, vague).
- **Performance** : requestAnimationFrame, object pooling.

---

*SPEC générée par worker desktop*