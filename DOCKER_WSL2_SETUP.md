# Docker + WSL2 Setup Guide

## Accessing Angular Dev Server from Windows Host

Since you're on WSL2, here's how to access the containerized Angular app:

### Option 1: Using WSL2 IP (Recommended)
1. Get your WSL2 IP address:
   ```bash
   ip addr | grep "inet " | grep -v 127.0.0.1
   # Look for something like 172.28.x.x
   ```

2. Access from Windows browser:
   ```
   http://<wsl2-ip>:4200
   ```
   Example: `http://172.28.0.1:4200`

### Option 2: Using localhost with port forwarding
If direct IP doesn't work, try:
```bash
docker-compose -f docker-compose.dev.yml up angular-dev
```

Then access: `http://localhost:4200`

### Verify Docker is running
```bash
docker ps
```

### Common WSL2 Issues & Fixes

**Issue: Port 4200 not accessible**
- Check Docker Desktop is running on Windows
- Verify WSL2 backend is enabled in Docker Desktop settings
- Try restarting Docker: `systemctl restart docker` (in WSL2 terminal)

**Issue: File changes not detected**
- The `--poll=2000` flag enables polling for file changes
- If still not working, check Docker Desktop WSL2 integration settings

**To start the dev server:**
```bash
docker-compose -f docker-compose.dev.yml up angular-dev
```

**To run commands in the container:**
```bash
docker-compose -f docker-compose.dev.yml exec angular-dev ng version
```

**To stop:**
```bash
docker-compose -f docker-compose.dev.yml down
```
