# Conventions Dindon Design

## Principes

1. **KISS** - Keep It Simple, Stupid
2. **YAGNI** - You Aren't Gonna Need It
3. **DRY** - Don't Repeat Yourself
4. **Petit premier** - itération rapide > fonctionnalité parfaite

## Format code

- Python : PEP 8, docstrings, type hints si pertinent
- JS/HTML : fonctionnel, minimal, comments适量
- Fichiers courts (< 500 lignes si possible)

## Organisation projet

```
project/
├── README.md          # pitch + quickstart
├── roadmap.md         # fonctionnalités futures
├── tasks.json         # tâches en cours
├── architecture.md    # décision techniques
├── changelog.md       # historique
├── prompts/           # prompts worker pour ce projet
├── logs/              # logs d'exécution
├── src/               # code source
└── assets/            # images, sons, fonts
```

## Nommage

- fichiers : kebab-case (mon-projet.js)
- classes : PascalCase (MaClasse)
- functions : snake_case (ma_fonction)
- constantes : SCREAMING_SNAKE_CASE

## Git

- commits atomiques, messages clairs
- feature branches pour nouvelles fonctionnalités
- pas de commits massifs "fix everything"

## Logs

- timestamps iso8601
- niveaux : DEBUG, INFO, WARN, ERROR
- format lisible : `[YYYY-MM-DD HH:mm:ss] [LEVEL] message`

## Orchestration workers

- Toujours attribuer selon capacités
- Éviter saturation petite machines
- Prompts courts et spécialisés par worker
- Résultats consolidés par le CTO