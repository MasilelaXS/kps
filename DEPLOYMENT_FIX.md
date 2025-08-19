# Frontend & API Deployment Fix Guide

## Problem
When visiting `portal.kpspestcontrol.co.za`, you see the API instead of the React frontend.

## Root Cause
The root `.htaccess` is routing everything to `index.php` (API), instead of serving the React app and routing API calls to `/api/`.

## Solution Steps

### 1. Build the React App (if not already done)
```bash
npm run build
```
This creates the `dist` folder with your built React app.

### 2. Update Root .htaccess
Replace your current root `.htaccess` with the content from `.htaccess-new`:

**New Root .htaccess** (serves React app at root, API at /api/):
- Serves React app files from `dist/` directory
- Routes `/api/*` requests to the `api/` directory  
- Handles React Router client-side routing
- Sets proper CORS headers
- Optimizes caching for static assets

### 3. Update API .htaccess  
Replace your current `api/.htaccess` with the content from `api/.htaccess-new`:

**New API .htaccess** (improved for API serving):
- Better CORS handling
- Security headers
- Proper JSON content types

### 4. Directory Structure After Fix
```
portal.kpspestcontrol.co.za/
├── dist/                    # React app files (served at root)
│   ├── index.html
│   ├── assets/
│   └── ...
├── api/                     # PHP API (served at /api/)
│   ├── index.php
│   ├── .htaccess
│   └── ...
├── .htaccess               # Root routing config
└── ...
```

### 5. Expected Behavior After Fix
- `portal.kpspestcontrol.co.za` → React frontend 
- `portal.kpspestcontrol.co.za/api/admin/clients` → API endpoint
- `portal.kpspestcontrol.co.za/admin/dashboard` → React route (handled by React Router)

### 6. Testing
1. Visit `portal.kpspestcontrol.co.za` → Should show React app
2. Visit `portal.kpspestcontrol.co.za/api/` → Should show API response
3. Navigate in the app → React Router should handle routes properly

## Backup Instructions
Before making changes:
1. Backup current `.htaccess` files
2. Test the API endpoints after deployment
3. Verify frontend routes work correctly

## Troubleshooting

### "File not found" on page refresh
If you get "file not found" when refreshing pages like `/admin/dashboard`:

**Cause**: Server is looking for a real file instead of serving React's index.html

**Solutions** (try in order):
1. **Use the simple .htaccess**: Replace root `.htaccess` with content from `.htaccess-simple`
2. **Check file paths**: Ensure your `dist/index.html` file exists and is readable
3. **Test the rules**: Check if `.htaccess` rules are being processed:
   ```bash
   # Add this line temporarily to your .htaccess to test
   RewriteRule ^test$ - [R=200,L]
   # Visit yoursite.com/test - should return 200 OK
   ```

### Other common issues:
1. **Clear browser cache** and hard refresh (Ctrl+F5)
2. **Check server error logs** for detailed error messages
3. **Verify file permissions** on `dist/` folder (should be readable)
4. **Ensure `dist/index.html` exists** - run `npm run build` if missing
5. **Check .htaccess syntax** - any syntax errors will break routing

### Testing checklist:
- ✅ `portal.kpspestcontrol.co.za` → Shows React app
- ✅ `portal.kpspestcontrol.co.za/admin/dashboard` → Shows React route  
- ✅ **Refresh `/admin/dashboard`** → Should still show React route (not 404)
- ✅ `portal.kpspestcontrol.co.za/api/admin/clients` → Shows API response
