#!/usr/bin/env python3
"""
Orchestrateur Dindon Design - Worker parallel robuste
"""
import subprocess
import json
import threading
import time
import os
import sys

WORKERS = {
    "desktop": {
        "ip": "100.118.85.70",
        "model": "Qwen3.6-35B-A3B-UD-Q4_K_XL.gguf",
        "speed": 12,  # tokens/sec
        "desc": "GROS TRAVAIL - backend, game logic",
    },
    "nitro": {
        "ip": "100.66.131.33",
        "model": "Qwen3.6-35B-A3B-UD-IQ3_S.gguf",
        "speed": 10,
        "desc": "MOYEN TRAVAIL - input, UI",
    },
    "vivobook": {
        "ip": "172.20.16.1",
        "model": "Qwen3.6-35B-A3B-UD-IQ2_XXS.gguf",
        "speed": 6,
        "desc": "PETIT TRAVAIL - HTML, CSS",
    },
}

results = {}
errors = {}

def call_worker(name, prompt, max_tokens):
    """Appelle un worker avec retry et timeout intelligent"""
    worker = WORKERS[name]
    estimated_time = max_tokens / worker["speed"]
    timeout = int(estimated_time * 2) + 60  # 2x estimation + marge
    
    print(f"\n{name} -> {worker['desc']}")
    print(f"  Estime: {estimated_time}s, timeout: {timeout}s")
    
    data = {
        "model": worker["model"],
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    
    cmd = [
        'curl', '-s', '-X', 'POST', f"http://{worker['ip']}:8080/v1/chat/completions",
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(data)
    ]
    
    # Retry loop
    for attempt in range(3):
        try:
            print(f"  Attempt {attempt + 1}/3...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            
            if result.returncode != 0:
                print(f"  Error: {result.returncode}")
                continue
                
            response = json.loads(result.stdout)
            
            if 'choices' not in response:
                print(f"  No choices in response")
                continue
                
            code = response['choices'][0]['message']['content']
            results[name] = code
            tokens = response.get('usage', {}).get('completion_tokens', len(code)//4)
            print(f"  SUCCESS: {tokens} tokens generated")
            return True
            
        except subprocess.TimeoutExpired:
            print(f"  Timeout after {timeout}s")
        except json.JSONDecodeError as e:
            print(f"  JSON error: {e}")
        except Exception as e:
            print(f"  Error: {e}")
        
        # Wait before retry
        time.sleep(5)
    
    errors[name] = "Failed after 3 attempts"
    print(f"  FAILED after 3 attempts")
    return False

def worker_desktop(prompt, max_tokens):
    call_worker("desktop", prompt, max_tokens)

def worker_nitro(prompt, max_tokens):
    call_worker("nitro", prompt, max_tokens)

def worker_vivobook(prompt, max_tokens):
    call_worker("vivobook", prompt, max_tokens)

def parallel_execute(tasks):
    """
    Lance plusieurs workers en parallèle
    tasks: [{"worker": "desktop", "prompt": "...", "max_tokens": 16384}, ...]
    """
    print(f"\n=== PARALLEL EXECUTION: {len(tasks)} tasks ===\n")
    
    threads = []
    for task in tasks:
        name = task["worker"]
        if name == "desktop":
            t = threading.Thread(target=worker_desktop, args=(task["prompt"], task["max_tokens"]))
        elif name == "nitro":
            t = threading.Thread(target=worker_nitro, args=(task["prompt"], task["max_tokens"]))
        elif name == "vivobook":
            t = threading.Thread(target=worker_vivobook, args=(task["prompt"], task["max_tokens"]))
        else:
            continue
        threads.append((t, name))
        t.start()
    
    # Wait with progress
    start = time.time()
    for t, name in threads:
        t.join()
        elapsed = time.time() - start
        print(f"[{elapsed:.1f}s] {name} finished")
    
    print("\n=== RESULTS ===")
    for name, code in results.items():
        print(f"  {name}: {len(code)} chars")
    for name, err in errors.items():
        print(f"  {name}: ERROR - {err}")
    
    return results, errors

if __name__ == "__main__":
    # Test: Tetris
    tasks = [
        {
            "worker": "desktop",
            "prompt": "Cree game.js pour Tetris. 7 pieces I,O,T,S,Z,J,L. Functions: spawnPiece, move, rotate, hardDrop, softDrop, collision, lock, clearLines, scoring, niveau, game over. CONSTANTES: COLS=10, ROWS=20. Reponds SEUL code JS.",
            "max_tokens": 16384
        },
        {
            "worker": "nitro", 
            "prompt": "Cree input.js pour Tetris. Touches: ArrowLeft/Right=lateral, ArrowDown=soft drop, ArrowUp=rotation, Space=hard drop, P=pause. Event listeners keydown/keyup. Callbacks: onMove, onRotate, onSoftDrop, onHardDrop, onPause. Reponds SEUL code JS.",
            "max_tokens": 8192
        },
        {
            "worker": "vivobook",
            "prompt": "Cree HTML Tetris. Canvas: #tetris-canvas 300x600, #next-canvas 120x120. UI: score/level/lines. Style: retro neon, bg #0a0a0a, neon #00ff88, monospace. Reponds SEUL HTML.",
            "max_tokens": 8192
        },
    ]
    
    results, errors = parallel_execute(tasks)
    
    # Sauvegarde auto
    for name, code in results.items():
        if name == "desktop":
            with open('/home/niko/dindondesign/projects/tetris/src/game.js', 'w') as f:
                f.write(code)
        elif name == "nitro":
            with open('/home/niko/dindondesign/projects/tetris/src/input.js', 'w') as f:
                f.write(code)
        elif name == "vivobook":
            with open('/home/niko/dindondesign/projects/tetris/src/index.html', 'w') as f:
                f.write(code)
    
    print("\nFichiers sauvegardes!")