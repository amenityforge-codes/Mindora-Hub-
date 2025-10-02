# Digital Ocean Deployment Guide

This guide will help you deploy your English Learning Platform backend to Digital Ocean.

## Prerequisites

1. **Digital Ocean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Domain Name** (optional): For production use
3. **MongoDB Atlas Account**: For database hosting
4. **Environment Variables**: Production configuration

## Step 1: Create Digital Ocean Droplet

### Option A: Using Digital Ocean Web Interface

1. **Login to Digital Ocean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Sign in to your account

2. **Create a New Droplet**
   - Click "Create" → "Droplets"
   - Choose Ubuntu 22.04 LTS
   - Select size: **Basic Plan - $12/month (2GB RAM, 1 CPU, 50GB SSD)**
   - Add SSH Key (recommended) or use password
   - Choose datacenter region closest to your users
   - Give it a hostname: `english-learning-backend`
   - Click "Create Droplet"

### Option B: Using Digital Ocean CLI (doctl)

```bash
# Install doctl
# On Windows: Download from GitHub releases
# On Mac: brew install doctl
# On Linux: Download from GitHub releases

# Authenticate
doctl auth init

# Create droplet
doctl compute droplet create english-learning-backend \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-2gb \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID
```

## Step 2: Connect to Your Droplet

```bash
# Replace YOUR_DROPLET_IP with your actual droplet IP
ssh root@YOUR_DROPLET_IP
```

## Step 3: Server Setup

### Update System
```bash
apt update && apt upgrade -y
```

### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Install Additional Tools
```bash
# Install Git, Curl, and other utilities
apt install -y git curl wget unzip

# Install Node.js (for development/testing)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

## Step 4: Deploy Your Application

### Clone Your Repository
```bash
# Create application directory
mkdir -p /opt/english-learning
cd /opt/english-learning

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/your-repo.git .

# Or upload your files using SCP
# scp -r /path/to/your/project root@YOUR_DROPLET_IP:/opt/english-learning/
```

### Configure Environment Variables
```bash
# Copy and edit production environment file
cp .env.production .env

# Edit the environment file with your actual values
nano .env
```

**Important Environment Variables to Set:**
```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/english-learning-platform

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# CORS (your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Other production settings...
```

### Deploy with Docker
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## Step 5: Configure Domain and SSL (Optional)

### Point Domain to Your Droplet
1. **Get your droplet IP**: Check Digital Ocean dashboard
2. **Update DNS records**: Point your domain to the droplet IP
3. **Wait for propagation**: DNS changes can take up to 24 hours

### Setup SSL with Let's Encrypt
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Monitoring and Maintenance

### View Logs
```bash
# View application logs
docker-compose logs -f backend

# View nginx logs
docker-compose logs -f nginx
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup Strategy
```bash
# Backup uploads directory
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/

# Backup database (if using local MongoDB)
mongodump --uri="your-mongodb-uri" --out=backup-$(date +%Y%m%d)
```

## Step 7: Security Considerations

### Firewall Setup
```bash
# Configure UFW firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### Regular Updates
```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port 80/443 not accessible**
   ```bash
   # Check if nginx is running
   docker-compose ps
   
   # Check nginx configuration
   docker-compose exec nginx nginx -t
   ```

2. **Database connection issues**
   ```bash
   # Check MongoDB connection
   docker-compose logs backend | grep -i mongo
   
   # Test connection manually
   docker-compose exec backend node -e "console.log(process.env.MONGO_URI)"
   ```

3. **File upload issues**
   ```bash
   # Check uploads directory permissions
   ls -la uploads/
   
   # Fix permissions if needed
   chmod -R 755 uploads/
   ```

### Performance Optimization

1. **Enable Gzip compression** (already configured in nginx.conf)
2. **Set up Redis caching** (if needed)
3. **Configure CDN** for static files
4. **Monitor resource usage**

## Cost Estimation

- **Droplet**: $12/month (2GB RAM, 1 CPU, 50GB SSD)
- **Domain**: $10-15/year (optional)
- **SSL Certificate**: Free (Let's Encrypt)
- **MongoDB Atlas**: Free tier available, or $9/month for M2 cluster
- **Total**: ~$12-25/month

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec backend env`
3. Test health endpoint: `curl http://your-domain/api/health`
4. Check Digital Ocean status page for any outages

## Next Steps

1. **Set up monitoring**: Consider using Digital Ocean monitoring or external services
2. **Configure backups**: Set up automated backups for your database and files
3. **Scale up**: If you need more resources, you can resize your droplet
4. **Load balancing**: For high traffic, consider using Digital Ocean Load Balancer

---

**Note**: This guide assumes you're using the provided Docker configuration. Make sure to customize the environment variables according to your specific setup.
