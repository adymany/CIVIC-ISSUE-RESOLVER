# Script to start ngrok tunnel for local development
Write-Host "Starting ngrok tunnel for port 3001..."
Write-Host "Make sure your Next.js development server is running on port 3001"
Write-Host "Press Ctrl+C to stop the tunnel"

# Start ngrok in a new window to prevent it from closing
Start-Process -FilePath "ngrok" -ArgumentList "http", "3001" -NoNewWindow -Wait