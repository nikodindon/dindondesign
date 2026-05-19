#!/bin/bash
# Envoyer prompt à nitro pour renderer.js

curl -s -X POST http://100.66.131.33:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.6-35B-A3B-UD-IQ3_S.gguf",
    "messages": [{"role": "user", "content": "Tu es un developpeur JS expert. Cree le fichier renderer.js pour un clone Tetris. Canvas rendering, board 10x20, CELL=30px. Couleurs neon: I=cyan, O=yellow, T=purple, S=green, Z=red, J=blue, L=orange. Fond #0a0a0a. Fonctions: drawBoard(), drawPiece(piece), drawNext(), drawUI(score,level,lines), drawGameOver(). Style retro neon avec glow. Retourne SEULEMENT le code JavaScript."}],
    "max_tokens": 16384,
    "temperature": 0.7
  }'