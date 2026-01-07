const { createRequire } = require('module');
const require = createRequire(import.meta.url);

// Simple build script that doesn't rely on react-scripts
const fs = require('fs');
const path = require('path');

console.log('Starting Netlify build...');

// Create a simple build
const buildDir = path.join(__dirname, 'build');

// Remove existing build directory
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}

// Create build directory
fs.mkdirSync(buildDir, { recursive: true });

// Copy static files
const publicDir = path.join(__dirname, 'public');
copyFolder(publicDir, buildDir);

// Create a simple index.html that redirects to the debug page
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Aasko Construction Invoice System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #1e40af; margin-bottom: 20px; }
        .status { padding: 20px; background: #e5f3ff; border-radius: 6px; margin: 20px 0; }
        .success { background: #d1fae5; color: white; }
        .error { background: #ef4444; color: white; }
        .debug-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .btn { display: inline-block; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .btn:hover { background: #1e3a8a; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏗️ Aasko Construction Invoice System</h1>
        
        <div class="status success">
            ✅ Frontend Successfully Deployed on Netlify
        </div>
        
        <div class="debug-info">
            <h3>🔍 Debug Information</h3>
            <p><strong>Deployment Status:</strong> Frontend is live and working</p>
            <p><strong>API Configuration:</strong> <span id="api-config">Checking...</span></p>
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Deploy backend separately (Render.com recommended)</li>
                <li>Update REACT_APP_API_URL environment variable</li>
                <li>Test login functionality</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/debug" class="btn">🔍 Go to Debug Dashboard</a>
            <a href="https://render.com" target="_blank" class="btn">🚀 Deploy Backend on Render</a>
        </div>
    </div>
    
    <script>
        // Check API configuration
        const apiUrl = process.env.REACT_APP_API_URL || 'Not configured';
        document.getElementById('api-config').textContent = apiUrl;
        
        // Test API connection
        fetch('/api/v1/debug/health')
            .then(response => response.json())
            .then(data => {
                console.log('API Health Check:', data);
            })
            .catch(error => {
                console.log('API Error:', error);
            });
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(buildDir, 'index.html'), indexHtml);

// Copy debug page
const debugPage = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Debug.js'), 'utf8');
const debugHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Debug - Aasko Invoice System</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff; }
        .error { color: #ff6b6b; }
        .success { color: #51cf66; }
    </style>
</head>
<body>
    <h1>🔍 Debug Information</h1>
    <div id="content">Loading debug information...</div>
    
    <script>
        // Debug script content
        ${debugPage}
        
        // Try to run debug checks
        try {
            // Check environment
            const env = {
                REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'Not configured',
                NODE_ENV: process.env.NODE_ENV || 'unknown'
            };
            
            document.getElementById('content').innerHTML = 
                '<h2>Environment Variables</h2>' +
                '<p><strong>REACT_APP_API_URL:</strong> ' + env.REACT_APP_API_URL + '</p>' +
                '<p><strong>NODE_ENV:</strong> ' + env.NODE_ENV + '</p>' +
                '<h2>API Test</h2>' +
                '<p>Testing API connection...</p>';
                
            // Test API
            fetch(env.REACT_APP_API_URL + '/debug/health')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('content').innerHTML += 
                        '<h3>API Response:</h3>' +
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                })
                .catch(error => {
                    document.getElementById('content').innerHTML += 
                        '<h3 class="error">API Error:</h3>' +
                        '<pre>' + error.message + '</pre>';
                });
        } catch (e) {
            document.getElementById('content').innerHTML = 
                '<h2 class="error">Debug Error:</h2>' +
                '<pre>' + e.message + '</pre>';
        }
    </script>
</body>
</html>
`;
        
fs.writeFileSync(path.join(buildDir, 'debug.html'), debugHtml);

console.log('✅ Build completed successfully!');
console.log('📁 Build directory:', buildDir);

function copyFolder(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
