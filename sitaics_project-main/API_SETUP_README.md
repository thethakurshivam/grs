# 🚀 API Setup & Management Guide

This guide explains how to set up and manage all three APIs for the SITAICS project.

## 📋 **API Architecture Overview**

| API | Port | File | Purpose | Environment File |
|-----|------|------|---------|------------------|
| **Admin API** | 3002 | `admin_routes/api.js` | Admin authentication & management | `.env.admin` |
| **BPRND POC API** | 3003 | `api3.js` | BPRND POC authentication & management | `.env.poc` |
| **BPRND Student API** | 3004 | `api4.js` | BPRND Student authentication & management | `.env.api4` |

## 🎯 **Frontend Proxy Configuration**

The Vite frontend (port 8080) uses the following proxy rules:

```typescript
proxy: {
  '/api/poc': 'http://localhost:3003',           // BPRND POC endpoints
  '/api/bprnd/student': 'http://localhost:3004', // BPRND Student endpoints  
  '/api/bprnd': 'http://localhost:3002',         // Admin BPRND endpoints
  '/api': 'http://localhost:3002',               // General admin endpoints
}
```

## 🚀 **Quick Start Scripts**

### **Start All APIs**
```bash
chmod +x start-all-apis.sh
./start-all-apis.sh
```

### **Stop All APIs**
```bash
chmod +x stop-all-apis.sh
./stop-all-apis.sh
```

### **Check API Health**
```bash
chmod +x check-api-health.sh
./check-api-health.sh
```

## 🔧 **Manual Setup (if scripts don't work)**

### **1. Start Admin API (Port 3002)**
```bash
cp .env.admin .env
nohup node admin_routes/api.js > admin_api.log 2>&1 &
```

### **2. Start BPRND POC API (Port 3003)**
```bash
cp .env.poc .env
nohup node api3.js > poc_api.log 2>&1 &
```

### **3. Start BPRND Student API (Port 3004)**
```bash
cp .env.api4 .env
nohup node api4.js > student_api.log 2>&1 &
```

## 📊 **Key Endpoints**

### **Admin API (Port 3002)**
- `POST /api/login` - Admin login
- `GET /api/bprnd/claims` - BPRND claims
- `POST /api/bprnd/claims/:id/approve` - Approve claims
- `GET /api/certificate-course-mappings` - Certificate mappings

### **BPRND POC API (Port 3003)**
- `POST /api/poc/login` - POC login
- `GET /api/bprnd/pending-credits` - Pending credits
- `POST /api/bprnd/pending-credits/:id/accept` - Accept credits
- `GET /api/bprnd/claims` - BPRND claims

### **BPRND Student API (Port 3004)**
- `POST /api/bprnd/student/login` - Student login
- `GET /health` - Health check
- `GET /api/bprnd/pending-credits/student/:id` - Student pending credits

## 🐛 **Troubleshooting**

### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3002
lsof -i :3003
lsof -i :3004

# Kill processes using specific ports
pkill -f ":3002"
pkill -f ":3003"
pkill -f ":3004"
```

### **API Not Responding**
1. Check if the API is running: `lsof -i :PORT`
2. Check logs: `tail -f api_name_api.log`
3. Verify environment file is correct
4. Restart the specific API

### **Frontend Connection Issues**
1. Ensure all APIs are running
2. Check Vite proxy configuration
3. Verify frontend is using relative URLs (not hardcoded localhost)
4. Restart frontend dev server

## 📝 **Log Files**

Each API creates its own log file:
- `admin_api.log` - Admin API logs
- `bprnd_poc_api.log` - BPRND POC API logs  
- `bprnd_student_api.log` - BPRND Student API logs

## 🔒 **Environment Variables**

Each API has its own environment file with specific configurations:

### **`.env.admin`**
- `PORT=3002`
- `JWT_SECRET=admin-secret-key`
- `MONGODB_URI=mongodb://localhost:27017/sitaics`

### **`.env.poc`**
- `PORT=3003`
- `JWT_SECRET=bprnd-poc-secret-key`
- `MONGODB_URI=mongodb://localhost:27017/sitaics`

### **`.env.api4`**
- `PORT=3004`
- `JWT_SECRET=bprnd-student-secret-key`
- `MONGODB_URI=mongodb://localhost:27017/sitaics`

## 🚨 **Common Issues & Solutions**

### **"Cannot find module" Error**
- Ensure you're in the correct directory (`sitaics_project-main`)
- Check if the file exists: `ls -la api3.js`

### **"Port already in use" Error**
- Use the stop script: `./stop-all-apis.sh`
- Or manually kill processes: `pkill -f "node api3.js"`

### **"Network error" in Frontend**
- Check if all APIs are running: `./check-api-health.sh`
- Verify Vite proxy configuration
- Ensure frontend uses relative URLs

### **"Endpoint not found" Error**
- Check if the API is running on the correct port
- Verify the endpoint exists in the API file
- Check Vite proxy routing

## 💡 **Best Practices**

1. **Always use the startup script** to ensure correct environment configuration
2. **Check API health regularly** using the health check script
3. **Use relative URLs in frontend** to leverage Vite proxy
4. **Keep environment files separate** for each API
5. **Monitor log files** for debugging

## 🆘 **Getting Help**

If you encounter issues:

1. Run `./check-api-health.sh` to diagnose problems
2. Check the relevant log files
3. Verify all environment files exist and are correct
4. Ensure MongoDB is running
5. Restart all APIs using `./start-all-apis.sh`

---

**Happy Coding! 🎉**
