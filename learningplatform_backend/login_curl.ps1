Write-Host "Attempting login with admin:adminpassword..."
Invoke-WebRequest -Uri 'http://localhost:8000/auth/login/' -Method POST -Body '{"username":"admin","password":"adminpassword"}' -ContentType 'application/json' -UseBasicParsing

Write-Host "`nAttempting login with student:student123..."
Invoke-WebRequest -Uri 'http://localhost:8000/auth/login/' -Method POST -Body '{"username":"student","password":"student123"}' -ContentType 'application/json' -UseBasicParsing

Write-Host "`nAttempting login with instructor:instructor123..."
Invoke-WebRequest -Uri 'http://localhost:8000/auth/login/' -Method POST -Body '{"username":"instructor","password":"instructor123"}' -ContentType 'application/json' -UseBasicParsing