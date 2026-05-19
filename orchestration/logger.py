#!/usr/bin/env python3
"""
Dindon Design - Logger
Système de logs simple et lisible
"""

import os
import json
from datetime import datetime
from pathlib import Path

LOG_DIR = Path("/home/niko/dindondesign/logs")
LOG_DIR.mkdir(exist_ok=True)

def log(level: str, message: str, project: str = "system", file: str = None):
    """Écrit un log formaté"""
    timestamp = datetime.now().isoformat()
    entry = f"[{timestamp}] [{level.upper()}] [{project}] {message}"
    
    # Console
    print(entry)
    
    # Fichier
    log_file = LOG_DIR / f"{project}.log"
    if file:
        log_file = LOG_DIR / f"{project}_{file}.log"
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(entry + "\n")

def log_json(project: str, data: dict, action: str = "action"):
    """Log en format JSON"""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "project": project,
        "action": action,
        "data": data
    }
    
    log_file = LOG_DIR / f"{project}.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python logger.py <level> <message> [project]")
        sys.exit(1)
    
    level = sys.argv[1]
    message = " ".join(sys.argv[2:])
    project = sys.argv[3] if len(sys.argv) > 3 else "system"
    
    log(level, message, project)