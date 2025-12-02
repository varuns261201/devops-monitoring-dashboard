# DevOps Monitoring Dashboard

A production-grade, containerized microservices-based monitoring application demonstrating full DevOps workflows including Docker containerization, Kubernetes orchestration, and CI/CD automation.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          GitHub Actions CI/CD                            │
│  ┌──────────┐      ┌──────────┐      ┌─────────────────────────────┐   │
│  │  Test &  │ ───> │  Build & │ ───> │  Deploy to Kubernetes       │   │
│  │   Lint   │      │   Push   │      │  (Cloud Cluster - Optional) │   │
│  └──────────┘      └──────────┘      └─────────────────────────────┘   │
│                          │                                               │
│                          ▼                                               │
│              GitHub Container Registry (GHCR)                            │
│         ghcr.io/USERNAME/monitoring-backend:latest                       │
│         ghcr.io/USERNAME/monitoring-frontend:latest                      │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (Minikube)                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  Namespace: monitoring                                         │     │
│  │                                                                │     │
│  │  ┌─────────────────┐    ┌─────────────────┐   ┌────────────┐ │     │
│  │  │   Frontend      │    │    Backend      │   │  MongoDB   │ │     │
│  │  │   (nginx)       │◄───┤  (Node.js)      │◄──┤ StatefulSet│ │     │
│  │  │   2 Replicas    │    │   2 Replicas    │   │  1 Replica │ │     │
│  │  │                 │    │                 │   │            │ │     │
│  │  │  Port: 80       │    │  Port: 8080     │   │ Port: 27017│ │     │
│  │  └────────┬────────┘    └─────────────────┘   └─────┬──────┘ │     │
│  │           │                                           │        │     │
│  │           │                                           │        │     │
│  │  ┌────────▼────────┐                         ┌───────▼──────┐ │     │
│  │  │ frontend-service│                         │   mongodb    │ │     │
│  │  │   NodePort      │                         │  ClusterIP   │ │     │
│  │  │   Port: 30080   │                         │ (Headless)   │ │     │
│  │  └─────────────────┘                         └──────────────┘ │     │
│  │           │                                           │        │     │
│  │           │                                  ┌────────▼──────┐ │     │
│  │           │                                  │ PersistentVol │ │     │
│  │           │                                  │    (1Gi)      │ │     │
│  │           │                                  └───────────────┘ │     │
│  └───────────┼────────────────────────────────────────────────────┘     │
│              │                                                           │
└──────────────┼───────────────────────────────────────────────────────────┘
               │
               ▼
     ┌─────────────────────┐
     │   User Access via:  │
     │  kubectl port-forward│
     │  localhost:8081      │
     └─────────────────────┘
```

### **Docker Compose Architecture (Local Development)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                         │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │  Frontend    │────>│   Backend    │────>│   MongoDB    │   │
│  │  (nginx)     │     │  (Node.js)   │     │   (mongo:7.0)│   │
│  │              │     │              │     │              │   │
│  │ Port: 3000:80│     │ Port: 8080   │     │ Port: 27017  │   │
│  └──────────────┘     └──────────────┘     └──────┬───────┘   │
│                                                     │           │
│                                            ┌────────▼────────┐  │
│                                            │ Docker Volume   │  │
│                                            │  mongo-data     │  │
│                                            │ (Persistent)    │  │
│                                            └─────────────────┘  │
│                                                                 │
│  Network: monitoring-network (bridge)                          │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
   http://localhost:3000 (Frontend)
   http://localhost:8080 (Backend API)
```

### **Data Flow**

```
User Browser
     │
     ▼
Frontend (React SPA)
     │
     ├─ Static Assets (nginx serves)
     │
     └─ API Calls (/api/*)
            │
            ▼
        Backend (Express)
            │
            ├─ GET /metrics          (Current metrics)
            ├─ GET /metrics/history  (Last 20 from DB)
            ├─ GET /health           (Health check)
            └─ GET /info             (App metadata)
                    │
                    ▼
                MongoDB
                    │
                    └─ Collection: metrics
                       - cpu_usage
                       - memory_usage
                       - api_latency
                       - request_count
                       - timestamp
```

---

## 🛠️ Tech Stack & Reasoning

### **Backend: Node.js + Express + MongoDB**
- **Node.js 18+**: Modern JavaScript runtime with excellent async/await support
- **Express 4.18**: Minimal, flexible web framework - industry standard for REST APIs
- **Mongoose 8.20**: MongoDB ODM with schema validation and type safety
- **Why?**: Fast development, excellent ecosystem, perfect for real-time metrics collection

### **Frontend: React + Vite + Recharts**
- **React 18.2**: Component-based UI library with hooks for state management
- **Vite 5.0**: Ultra-fast build tool (10x faster than webpack for dev server)
- **Recharts 2.10**: Composable charting library built on D3, easy to use
- **Axios 1.6**: Promise-based HTTP client for API calls
- **Why?**: Modern tooling, fast development, excellent developer experience

### **Database: MongoDB 7.0**
- **Document-based**: Schema flexibility for evolving metrics structure
- **High write performance**: Perfect for frequent metric inserts
- **Built-in aggregation**: Easy to query time-series data
- **Why?**: NoSQL flexibility, excellent for time-series data, easy to scale horizontally

### **Containerization: Docker + Docker Compose**
- **Docker**: Industry-standard containerization platform
- **Multi-stage builds**: Smaller images (~100MB backend, ~25MB frontend)
- **Docker Compose**: Simple orchestration for local development
- **Why?**: Environment consistency, easy onboarding, production parity

### **Orchestration: Kubernetes (Minikube)**
- **StatefulSets**: For MongoDB with persistent storage
- **Deployments**: For stateless backend/frontend with 2 replicas each
- **Services**: ClusterIP for internal, NodePort for external access
- **ConfigMaps**: Environment variable management
- **Why?**: Industry standard, production-ready, auto-healing, scaling, service discovery

### **CI/CD: GitHub Actions**
- **Automated testing**: ESLint + Jest on every push/PR
- **Automated builds**: Docker images built and pushed to GHCR
- **Automated deployment**: K8s manifests applied on main branch
- **Why?**: Native GitHub integration, free for public repos, powerful matrix builds

### **Container Registry: GitHub Container Registry (GHCR)**
- **Integrated with GitHub**: Same authentication, permissions
- **Free for public repos**: No Docker Hub rate limits
- **OCI-compliant**: Works with any container runtime
- **Why?**: Seamless CI/CD integration, no additional accounts needed

### **Web Server: nginx (alpine)**
- **nginx**: High-performance web server and reverse proxy
- **alpine**: Minimal base image (5MB) for smaller container size
- **Why?**: Production-grade static file serving, efficient resource usage

---

## 🚀 Local Deployment Guide

### **Prerequisites**

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download: https://docs.docker.com/get-docker/
   - Verify: `docker --version` (v24.0+)

2. **Node.js** (for local development without Docker)
   - Download: https://nodejs.org/ (v18+)
   - Verify: `node --version`

3. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **kubectl** (for Kubernetes)
   - Download: https://kubernetes.io/docs/tasks/tools/
   - Verify: `kubectl version --client`

5. **Minikube** (for local Kubernetes)
   - Download: https://minikube.sigs.k8s.io/docs/start/
   - Verify: `minikube version`

---

### **Option 1: Docker Compose (Recommended for Quick Start)**

#### **Step 1: Clone the Repository**
```bash
git clone https://github.com/varuns261201/devops-monitoring-dashboard.git
cd devops-monitoring-dashboard
```

#### **Step 2: Start All Services**
```bash
# Start in foreground (see logs)
docker-compose up --build

# OR start in background (detached)
docker-compose up -d --build
```

#### **Step 3: Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Metrics History**: http://localhost:8080/metrics/history

#### **Step 4: Stop Services**
```bash
# Stop containers (keeps data)
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

#### **Common Docker Compose Commands**
```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build

# Check service status
docker-compose ps
```

---

### **Option 2: Kubernetes Deployment**

#### **Step 1: Start Minikube**
```bash
# Start Minikube cluster
minikube start

# Verify cluster is running
minikube status
kubectl cluster-info
```

#### **Step 2: Build and Push Images to GHCR**

**Create GitHub Personal Access Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `write:packages`, `read:packages`, `delete:packages` permissions
3. Copy the token

**Login to GHCR:**
```bash
# Linux/Mac
echo YOUR_PAT_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Windows PowerShell
$env:CR_PAT = "YOUR_PAT_TOKEN"
echo $env:CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

**Build and Push:**
```bash
# Build images
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/monitoring-backend:latest ./backend
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/monitoring-frontend:latest ./frontend

# Push to GHCR
docker push ghcr.io/YOUR_GITHUB_USERNAME/monitoring-backend:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/monitoring-frontend:latest
```

**Make Images Public (on GitHub):**
1. Go to https://github.com/YOUR_GITHUB_USERNAME?tab=packages
2. Click on each package → Package settings → Change visibility → Public

#### **Step 3: Update Kubernetes Manifests**

Edit `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`:
```yaml
# Replace YOUR_GITHUB_USERNAME with your actual username
image: ghcr.io/YOUR_GITHUB_USERNAME/monitoring-backend:latest
```

#### **Step 4: Deploy to Kubernetes**
```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Watch pods start up
kubectl get pods -n monitoring -w
```

Wait until all pods show `Running` and `READY` status (1-2 minutes).

#### **Step 5: Access the Application**

**Using Port-Forward (Works on all platforms):**
```bash
# Forward frontend service to localhost
kubectl port-forward -n monitoring svc/frontend-service 8081:80

# Access: http://localhost:8081
```

**Using Minikube Service (Alternative):**
```bash
# Auto-open in browser
minikube service frontend-service -n monitoring

# Or get URL
minikube service frontend-service -n monitoring --url
```

**Using NodePort (Hyper-V driver only):**
```bash
# Get Minikube IP
minikube ip

# Access: http://MINIKUBE_IP:30080
```

#### **Step 6: Verify Deployment**
```bash
# Check all resources
kubectl get all -n monitoring

# Check pod status
kubectl get pods -n monitoring

# Check services
kubectl get svc -n monitoring

# Check persistent volumes
kubectl get pvc -n monitoring
```

#### **Step 7: Clean Up**
```bash
# Delete all resources
kubectl delete namespace monitoring

# Or delete individual resources
kubectl delete -f k8s/

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

---

### **Option 3: Local Development (No Docker)**

#### **Step 1: Install MongoDB Locally**
```bash
# Mac (Homebrew)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows (Chocolatey)
choco install mongodb
net start MongoDB
```

#### **Step 2: Start Backend**
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Backend runs on http://localhost:8080
```

#### **Step 3: Start Frontend**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:5173
```

---

## 🔄 CI/CD Pipeline Guide

### **Pipeline Overview**

The GitHub Actions workflow consists of **3 jobs** that run sequentially:

1. **Test & Lint** - Validates code quality
2. **Build & Push** - Builds Docker images and pushes to GHCR
3. **Deploy** - (Optional) Deploys to Kubernetes cluster

### **Triggering the Pipeline**

The pipeline automatically runs on:
- **Push to `main` or `develop` branches**
- **Pull requests to `main` branch**

### **Manual Trigger**
```bash
# Make any change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger CI/CD pipeline"
git push origin main
```

### **Viewing Pipeline Execution**

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on the latest workflow run
4. View logs for each job

### **Pipeline Stages Explained**

#### **Stage 1: Test & Lint (Matrix: backend + frontend)**
```yaml
✓ Checkout code
✓ Setup Node.js 18
✓ Install dependencies (npm ci)
✓ Run ESLint linter
✓ Run Jest tests (backend only)
✓ Upload coverage report
```

**What it validates:**
- Code follows linting rules (ESLint)
- All unit tests pass (Jest)
- Test coverage meets thresholds

#### **Stage 2: Build & Push Images**
```yaml
✓ Checkout code
✓ Setup Docker Buildx
✓ Login to GHCR
✓ Build backend Docker image
✓ Build frontend Docker image
✓ Tag images (latest, branch, git-sha)
✓ Push to ghcr.io
```

**Image tags created:**
- `latest` (only on main branch)
- `main` or `develop` (branch name)
- `main-abc123def` (branch + git SHA)

#### **Stage 3: Deploy to Kubernetes (Optional)**
```yaml
✓ Checkout code
✓ Setup kubectl
✓ Configure kubeconfig (if KUBE_CONFIG secret exists)
✓ Update K8s manifests with new image tags
✓ Apply manifests to cluster
✓ Wait for rollout completion
✓ Run smoke tests
✓ Generate deployment summary
```

**Runs only when:**
- Branch is `main`
- Event is `push` (not PR)
- `KUBE_CONFIG` secret is set (optional)

### **Setting Up Deployment (Optional)**

For **cloud Kubernetes clusters** (AWS EKS, GKE, AKS):

#### **Step 1: Get kubeconfig**
```bash
# AWS EKS
aws eks update-kubeconfig --name your-cluster-name --region us-east-1

# GKE
gcloud container clusters get-credentials your-cluster-name --region us-central1

# Azure AKS
az aks get-credentials --resource-group your-rg --name your-cluster-name

# Export as base64
kubectl config view --raw | base64 -w 0
```

#### **Step 2: Add GitHub Secret**
1. Go to repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `KUBE_CONFIG`
4. Value: Paste base64 kubeconfig
5. Save

#### **Step 3: Push to main**
```bash
git push origin main
```

The pipeline will now deploy to your cloud cluster automatically!

### **Monitoring Pipeline Health**

**View test coverage:**
1. Go to Actions → Workflow run
2. Scroll to **Artifacts**
3. Download `coverage-report`

**View deployment summary:**
1. Go to Actions → Workflow run → Deploy job
2. Scroll to bottom - see deployment summary

**Check image tags in GHCR:**
1. Go to https://github.com/YOUR_USERNAME?tab=packages
2. Click on package
3. See all tags (latest, main, main-sha, etc.)

---

## 🌐 Accessing Services

### **Docker Compose**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React dashboard |
| Backend API | http://localhost:8080 | Express REST API |
| Health Check | http://localhost:8080/health | Backend health status |
| Current Metrics | http://localhost:8080/metrics | Real-time metrics |
| Metrics History | http://localhost:8080/metrics/history | Last 20 metrics from DB |
| App Info | http://localhost:8080/info | Application metadata |
| MongoDB | mongodb://localhost:27017 | MongoDB connection |

### **Kubernetes (Port-Forward)**

```bash
# Access Frontend
kubectl port-forward -n monitoring svc/frontend-service 8081:80
# URL: http://localhost:8081

# Access Backend
kubectl port-forward -n monitoring svc/backend-service 8080:8080
# URL: http://localhost:8080

# Access MongoDB
kubectl port-forward -n monitoring svc/mongodb 27017:27017
# URL: mongodb://localhost:27017
```

### **Kubernetes (NodePort - Hyper-V Only)**

```bash
# Get Minikube IP
minikube ip
# Example: 192.168.49.2

# Access Frontend: http://MINIKUBE_IP:30080
```

### **API Endpoints**

#### **GET /health**
Health check endpoint for load balancers and monitoring.

**Request:**
```bash
curl http://localhost:8080/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-03T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

#### **GET /metrics**
Returns current system metrics (mock data).

**Request:**
```bash
curl http://localhost:8080/metrics
```

**Response:**
```json
{
  "timestamp": "2025-12-03T10:30:00.000Z",
  "cpu_usage": 45.2,
  "memory_usage": 62.8,
  "api_latency": 120,
  "request_count": 1543
}
```

#### **GET /metrics/history?limit=20**
Returns historical metrics from MongoDB.

**Request:**
```bash
curl http://localhost:8080/metrics/history?limit=50
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "cpu_usage": 45.2,
    "memory_usage": 62.8,
    "api_latency": 120,
    "request_count": 1543,
    "timestamp": "2025-12-03T10:30:00.000Z"
  },
  ...
]
```

#### **GET /info**
Returns application metadata.

**Request:**
```bash
curl http://localhost:8080/info
```

**Response:**
```json
{
  "name": "monitoring-backend",
  "version": "1.0.0",
  "environment": "production",
  "node_version": "18.17.0",
  "timestamp": "2025-12-03T10:30:00.000Z"
}
```

---

## 📋 Logs & Troubleshooting

### **Docker Compose Logs**

```bash
# View all logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# View last 100 lines
docker-compose logs --tail=100 backend

# View logs since timestamp
docker-compose logs --since 2025-12-03T10:00:00 backend
```

### **Kubernetes Logs**

```bash
# View logs for all backend pods
kubectl logs -n monitoring -l app=backend -f

# View logs for all frontend pods
kubectl logs -n monitoring -l app=frontend -f

# View logs for MongoDB
kubectl logs -n monitoring mongodb-0 -f

# View logs for specific pod
kubectl logs -n monitoring POD_NAME -f

# View previous container logs (if crashed)
kubectl logs -n monitoring POD_NAME --previous

# View logs from last 1 hour
kubectl logs -n monitoring POD_NAME --since=1h

# Save logs to file
kubectl logs -n monitoring POD_NAME > pod-logs.txt
```

### **Common Issues & Solutions**

#### **Issue 1: Docker Compose - MongoDB Connection Failed**

**Error:**
```
MongoServerError: connect ECONNREFUSED mongodb:27017
```

**Solution:**
```bash
# Check if MongoDB container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart services
docker-compose restart

# If persists, remove volumes and restart
docker-compose down -v
docker-compose up
```

---

#### **Issue 2: Kubernetes - ImagePullBackOff**

**Error:**
```
Error: ErrImagePull
Status: ImagePullBackOff
```

**Solution:**
```bash
# Check pod description
kubectl describe pod -n monitoring POD_NAME

# Verify image exists in GHCR
# Go to https://github.com/YOUR_USERNAME?tab=packages

# Make images public on GitHub
# Package settings → Change visibility → Public

# Delete and recreate pod
kubectl delete pod -n monitoring POD_NAME
```

---

#### **Issue 3: Kubernetes - CrashLoopBackOff**

**Error:**
```
Status: CrashLoopBackOff
```

**Solution:**
```bash
# Check logs
kubectl logs -n monitoring POD_NAME

# Check previous logs
kubectl logs -n monitoring POD_NAME --previous

# Describe pod for events
kubectl describe pod -n monitoring POD_NAME

# Common causes:
# - Missing environment variables (check ConfigMap)
# - Wrong service names in nginx.conf
# - Port conflicts
```

---

#### **Issue 4: Frontend Shows "Cannot GET /api/metrics"**

**Cause:** Backend service name mismatch in nginx.conf

**Solution:**
```bash
# In Docker Compose, nginx.conf should have:
proxy_pass http://backend:8080;

# In Kubernetes, nginx.conf should have:
proxy_pass http://backend-service:8080;

# Rebuild frontend after fixing
docker-compose up --build frontend
# OR
docker build -t ghcr.io/USERNAME/monitoring-frontend:latest ./frontend
docker push ghcr.io/USERNAME/monitoring-frontend:latest
kubectl rollout restart deployment frontend-deployment -n monitoring
```

---

#### **Issue 5: NodePort Not Accessible**

**Cause:** Minikube using Docker driver

**Solution:**
```bash
# Check driver
minikube profile list

# If driver is "docker", use port-forward instead
kubectl port-forward -n monitoring svc/frontend-service 8081:80

# OR use minikube service command
minikube service frontend-service -n monitoring

# OR switch to Hyper-V driver (Windows Pro)
minikube delete
minikube start --driver=hyperv
```

---

#### **Issue 6: MongoDB Data Lost After Restart**

**Cause:** Docker volume not created or deleted

**Solution:**
```bash
# Check volumes exist
docker volume ls | grep mongo

# In docker-compose.yml, ensure volumes section exists:
volumes:
  mongo-data:
    driver: local

# Don't use -v flag when stopping
docker-compose down  # ✓ Keeps data
docker-compose down -v  # ✗ Deletes data

# For Kubernetes, check PVC
kubectl get pvc -n monitoring
```

---

#### **Issue 7: CI/CD Pipeline Failing**

**Test Stage Fails:**
```bash
# Run tests locally
cd backend
npm test

# Fix lint errors
npm run lint
npm run lint -- --fix
```

**Build Stage Fails:**
```bash
# Check Dockerfile syntax
docker build -t test ./backend

# Check .dockerignore isn't excluding needed files
cat backend/.dockerignore
cat frontend/.dockerignore
```

**Deploy Stage Fails:**
```bash
# Verify KUBE_CONFIG secret is correct
# Re-generate and update:
kubectl config view --raw | base64 -w 0

# Check image paths in deployment files
grep "image:" k8s/*deployment.yaml
```

---

### **Debugging Commands Cheat Sheet**

#### **Docker Compose**
```bash
# Enter container shell
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Check container resource usage
docker stats

# Inspect container
docker inspect monitoring-backend

# Check networks
docker network ls
docker network inspect infilect_monitoring-network

# Check volumes
docker volume ls
docker volume inspect infilect_mongo-data
```

#### **Kubernetes**
```bash
# Get all resources
kubectl get all -n monitoring

# Describe resources
kubectl describe pod POD_NAME -n monitoring
kubectl describe svc SERVICE_NAME -n monitoring
kubectl describe deployment DEPLOYMENT_NAME -n monitoring

# Execute commands in pod
kubectl exec -it POD_NAME -n monitoring -- sh
kubectl exec -it mongodb-0 -n monitoring -- mongosh

# Check resource usage
kubectl top nodes
kubectl top pods -n monitoring

# Check events
kubectl get events -n monitoring --sort-by='.lastTimestamp'

# Port forward multiple services
kubectl port-forward -n monitoring svc/frontend-service 8081:80 &
kubectl port-forward -n monitoring svc/backend-service 8080:8080 &

# Watch resources
kubectl get pods -n monitoring -w

# Check ConfigMap
kubectl get configmap monitoring-config -n monitoring -o yaml

# Check endpoints
kubectl get endpoints -n monitoring
```

---

## 📦 Project Structure

```
devops-monitoring-dashboard/
├── backend/                      # Node.js Express API
│   ├── src/
│   │   ├── index.js             # Main server file
│   │   └── database.js          # MongoDB connection & schema
│   ├── tests/
│   │   └── api.test.js          # Jest tests
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── App.jsx              # Main component
│   │   ├── App.css              # Styles
│   │   └── main.jsx             # Entry point
│   ├── public/
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── .dockerignore
│   ├── nginx.conf               # nginx configuration
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml           # monitoring namespace
│   ├── configmap.yaml           # Environment variables
│   ├── mongodb-statefulset.yaml # MongoDB with PVC
│   ├── mongodb-service.yaml     # Headless service
│   ├── backend-deployment.yaml  # Backend 2 replicas
│   ├── backend-service.yaml     # ClusterIP service
│   ├── frontend-deployment.yaml # Frontend 2 replicas
│   └── frontend-service.yaml    # NodePort service
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions pipeline
│
├── docker-compose.yml           # Local development stack
├── README.md                    # This file
├── DOCKER_GUIDE.md              # Docker documentation
├── K8S_GUIDE.md                 # Kubernetes documentation
├── CICD_GUIDE.md                # CI/CD documentation
└── MONGODB_SETUP.md             # MongoDB setup guide
```

---

## 🎯 Assignment Checklist

- ✅ **Backend API** - Node.js/Express with 4 endpoints
- ✅ **Frontend Dashboard** - React with real-time charts
- ✅ **Database** - MongoDB with persistent storage
- ✅ **Docker Compose** - Multi-container local deployment
- ✅ **Kubernetes Manifests** - 8 files (namespace, configmap, statefulsets, deployments, services)
- ✅ **CI/CD Pipeline** - GitHub Actions with test/build/deploy stages
- ✅ **Container Registry** - GHCR integration
- ✅ **Documentation** - Complete guides with troubleshooting
- ✅ **System Architecture** - Diagrams included
- ✅ **Logging & Monitoring** - Health checks, probes, logs

---

## 🚀 Quick Start Summary

**For quick testing (5 minutes):**
```bash
git clone https://github.com/varuns261201/devops-monitoring-dashboard.git
cd devops-monitoring-dashboard
docker-compose up -d
# Access: http://localhost:3000
```

**For Kubernetes deployment (15 minutes):**
```bash
minikube start
kubectl apply -f k8s/
kubectl port-forward -n monitoring svc/frontend-service 8081:80
# Access: http://localhost:8081
```

**For CI/CD (20 minutes):**
```bash
# Push to GitHub and watch Actions tab
git push origin main
```

---

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev/

---

## 👤 Author

**Varun S**
- GitHub: [@varuns261201](https://github.com/varuns261201)

---

## 📄 License

This project is created for educational purposes as part of a DevOps assignment.

---

## 🙏 Acknowledgments

- Assignment requirements provided by Infilect
- Built with modern DevOps best practices
- Follows 12-factor app methodology
