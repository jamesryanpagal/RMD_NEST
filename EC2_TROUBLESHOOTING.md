# EC2 Instance Troubleshooting Guide

## SSH Connection Issues

If SSH is hanging or taking forever, your EC2 instance is likely experiencing resource exhaustion. Here's how to diagnose and fix it:

### Immediate Actions (via AWS Console)

1. **Check CloudWatch Metrics**:
   - Go to EC2 → Your Instance → Monitoring
   - Check CPU Utilization (should be < 80%)
   - Check Memory/Network metrics
   - Check Status Checks (should be 2/2 passed)

2. **Check System Logs**:
   - EC2 → Your Instance → Actions → Monitor and troubleshoot → Get system log
   - Look for OOM (Out of Memory) errors or kernel panics

3. **Reboot the Instance**:
   - EC2 → Your Instance → Instance State → Reboot
   - This is the fastest way to recover if the instance is hung

### If You Can SSH In (After Reboot)

Run these commands to diagnose:

```bash
# Check memory usage
free -h

# Check CPU usage
top
# or
htop  # if installed

# Check disk space
df -h

# Check running processes consuming resources
ps aux --sort=-%mem | head -20
ps aux --sort=-%cpu | head -20

# Check Docker container status
docker ps -a
docker stats

# Check Docker logs
docker logs rmd_nest_prod --tail 100

# Check system load
uptime

# Check for OOM killer logs
dmesg | grep -i "out of memory"
dmesg | grep -i "killed process"

# Check swap usage
swapon --show
```

### Common Causes & Solutions

#### 1. **Out of Memory (OOM)**
**Symptoms**: SSH hangs, system becomes unresponsive
**Solution**:
- Increase EC2 instance size (more RAM)
- Or optimize application memory usage
- Check if Docker containers are consuming too much memory

#### 2. **High CPU Usage**
**Symptoms**: Slow response, SSH delays
**Solution**:
- Check what's consuming CPU: `top` or `htop`
- The `start:dev` command uses file watching which is CPU-intensive
- **FIXED**: Changed Dockerfile to use `start:prod` instead

#### 3. **Docker Container Issues**
**Symptoms**: Application not responding, 502 errors
**Solution**:
```bash
# Restart the container
docker compose --profile prod restart

# Or rebuild and restart
docker compose --profile prod down
docker compose --profile prod up -d --build

# Check container resource limits
docker stats rmd_nest_prod
```

#### 4. **Disk Space Full**
**Symptoms**: Can't write logs, application crashes
**Solution**:
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Clean up old logs
journalctl --vacuum-time=7d
```

### Prevention

1. **Use Production Mode**: ✅ Fixed - Dockerfile now uses `start:prod`
2. **Monitor Resources**: Set up CloudWatch alarms for:
   - CPU > 80%
   - Memory > 85%
   - Disk space < 20%
3. **Resource Limits**: Consider adding Docker memory limits in docker-compose.yml
4. **Health Checks**: Ensure your health endpoint is working (✅ Fixed - binding to 0.0.0.0)

### Quick Recovery Steps

1. **Reboot via AWS Console** (fastest)
2. **SSH in after reboot** and check logs
3. **Restart Docker containers**:
   ```bash
   docker compose --profile prod restart
   ```
4. **Check application logs**:
   ```bash
   docker logs rmd_nest_prod -f
   ```

### If Instance Keeps Hanging

Consider:
- Upgrading to a larger instance type (more CPU/RAM)
- Using an Application Load Balancer with health checks
- Setting up auto-scaling
- Moving to ECS/Fargate for better resource management

