# Infrastructure Dindon Design

## Réseau

- **VPN** : Tailscale
- **Subnet** : 100.x.x.x (tailcale)

## Workers

### nitro (Acer Nitro 5)
```
IP: 100.66.131.33
SSH: nitro
Modèle: Qwen3.6-35B-A3B-UD-IQ3_S
Quantization: IQ3_S (petite, ~13GB)
Context: 100K
```

### desktop (Ryzen 1600 AF)
```
IP: 100.118.85.70
SSH: desktop
Modèle: Qwen3.6-35B-A3B-UD-Q4_K_XL
Quantization: Q4_K_XL (grosse, ~22GB)
Context: 100K
```

### vivobook (Asus Vivobook)
```
IP: 127.0.0.1
Modèle: Qwen3.6-35B-A3B-UD-IQ2_M
Statut: HORS LIGNE
```

## Services

- **Hermes (CTO)** : minimax-m2.5 via ollama-cloud
- **Ollama local** : llama.cpp sur chaque worker
- **Git** : Configuration GitHub active

## Monitoring

Vérification périodique des workers :
```bash
curl http://<IP>:8080/v1/models
```

## Troubleshooting

- Worker unreachable ? Vérifier Tailscale, redémarrer ollama
- Rate limit ? Rotation sur ollama-cloud
- Performance degrade ? Context trop long, réduire