#!/usr/bin/env python3
"""
Dindon Design - Worker Orchestrator
Distribution des tâches selon les capacités machines
"""

import json
import time
from datetime import datetime
from typing import Optional
import requests

WORKERS = {
    "vivobook": {
        "endpoint": "http://127.0.0.1:8080",
        "role": "Archiviste/Coordinateur",
        "model": "Qwen3.6-35B-A3B-UD-IQ2_M",
        "status": "offline",
        "max_tokens": 4096
    },
    "nitro": {
        "endpoint": "http://100.66.131.33:8080",
        "role": "Frontend Engineer + QA",
        "model": "Qwen3.6-35B-A3B-UD-IQ3_S",
        "status": "online",
        "max_tokens": 8192
    },
    "desktop": {
        "endpoint": "http://100.118.85.70:8080",
        "role": "Senior Software Engineer",
        "model": "Qwen3.6-35B-A3B-UD-Q4_K_XL",
        "status": "online",
        "max_tokens": 16384
    }
}

def check_workers():
    """Vérifie que les workers répondent"""
    print(f"[{datetime.now().isoformat()}] Vérification workers...")
    for name, worker in WORKERS.items():
        try:
            resp = requests.get(f"{worker['endpoint']}/v1/models", timeout=5)
            if resp.status_code == 200:
                worker['status'] = 'online'
                print(f"  ✅ {name}: ONLINE")
            else:
                worker['status'] = 'offline'
                print(f"  ❌ {name}: ERROR {resp.status_code}")
        except Exception as e:
            worker['status'] = 'offline'
            print(f"  ❌ {name}: {e}")

def generate(prompt: str, worker_name: str = "desktop", max_tokens: Optional[int] = None) -> str:
    """Génère du texte via un worker"""
    worker = WORKERS.get(worker_name)
    if not worker or worker['status'] != 'online':
        # Fallback vers desktop si dispo
        if WORKERS['desktop']['status'] == 'online':
            worker_name = 'desktop'
            worker = WORKERS['desktop']
        else:
            return "ERROR: No workers available"
    
    limit = max_tokens or worker['max_tokens']
    
    payload = {
        "model": worker['model'],
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": limit,
        "temperature": 0.7
    }
    
    try:
        resp = requests.post(
            f"{worker['endpoint']}/v1/chat/completions",
            json=payload,
            timeout=300
        )
        if resp.status_code == 200:
            return resp.json()['choices'][0]['message']['content']
        else:
            return f"ERROR: {resp.status_code} - {resp.text}"
    except Exception as e:
        return f"ERROR: {e}"

def assign_task(task_type: str, prompt: str) -> str:
    """Assigne une tâche au worker approprié"""
    if task_type in ["frontend", "ui", "test", "qa", "debug"]:
        worker = "nitro" if WORKERS['nitro']['status'] == 'online' else "desktop"
    elif task_type in ["backend", "architecture", "complex", "refactor", "heavy"]:
        worker = "desktop"
    else:
        worker = "desktop"  # Default
    
    return generate(prompt, worker)

# CLI
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python orchestrator.py <prompt> [--worker nitro|desktop]")
        sys.exit(1)
    
    worker = sys.argv[-1] if sys.argv[-1].startswith("--") else "desktop"
    prompt = " ".join(sys.argv[1:])
    
    if "--worker" in sys.argv:
        idx = sys.argv.index("--worker")
        worker = sys.argv[idx + 1]
        prompt = " ".join(sys.argv[1:idx])
    
    check_workers()
    print(f"\nGénération via {worker}...")
    result = generate(prompt, worker)
    print(result)