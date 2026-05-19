#!/usr/bin/env python3
"""
Dindon Design - Memory System
Mémoire projet persistante en JSON
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

MEMORY_DIR = Path("/home/niko/dindondesign/memory")
MEMORY_DIR.mkdir(exist_ok=True)

def save_project_state(project: str, state: Dict[str, Any]):
    """Sauvegarde l'état d'un projet"""
    memory_file = MEMORY_DIR / f"{project}.json"
    
    data = {
        "project": project,
        "updated": datetime.now().isoformat(),
        "state": state
    }
    
    with open(memory_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_project_state(project: str) -> Optional[Dict[str, Any]]:
    """Charge l'état d'un projet"""
    memory_file = MEMORY_DIR / f"{project}.json"
    
    if not memory_file.exists():
        return None
    
    with open(memory_file, encoding="utf-8") as f:
        return json.load(f)

def append_memory(project: str, entry: Dict[str, Any]):
    """Ajoute une entrée à l'historique"""
    memory_file = MEMORY_DIR / f"{project}_history.jsonl"
    
    entry["timestamp"] = datetime.now().isoformat()
    
    with open(memory_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def get_projects() -> list:
    """Liste les projets existants"""
    return [f.stem.replace("_history", "") for f in MEMORY_DIR.glob("*.json")]

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Memory Dindon Design")
        print(f"Projects: {get_projects()}")
        sys.exit(1)
    
    action = sys.argv[1]
    project = sys.argv[2] if len(sys.argv) > 2 else None
    
    if action == "list":
        print(f"Projets: {get_projects()}")
    elif action == "load" and project:
        state = load_project_state(project)
        print(json.dumps(state, indent=2) if state else "No memory")
    elif action == "save" and project:
        save_project_state(project, {"note": "test"})
        print(f"Saved {project}")