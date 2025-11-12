# Script para configurar base de datos MySQL local
# Módulo de Reportes

Write-Host "🔧 Configurando Base de Datos para Módulo de Reportes..." -ForegroundColor Cyan

# Verificar si MySQL está instalado
try {
    $mysqlVersion = mysql --version 2>$null
    if ($mysqlVersion) {
        Write-Host "✓ MySQL encontrado: $mysqlVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ MySQL no encontrado. Instalando..." -ForegroundColor Red
    Write-Host "📥 Descargando MySQL..." -ForegroundColor Yellow
    
    # Usar winget para instalar MySQL si está disponible
    try {
        winget install Oracle.MySQL
        Write-Host "✓ MySQL instalado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ No se pudo instalar MySQL automáticamente" -ForegroundColor Yellow
        Write-Host "Opciones manuales:" -ForegroundColor Cyan
        Write-Host "1. Descargar desde: https://dev.mysql.com/downloads/mysql/" -ForegroundColor White
        Write-Host "2. O usar XAMPP: https://www.apachefriends.org/" -ForegroundColor White
        Write-Host "3. O usar MySQL Workbench" -ForegroundColor White
        Read-Host "Presiona Enter después de instalar MySQL manualmente..."
    }
}

# Función para ejecutar SQL
function Execute-SQL {
    param(
        [string]$SqlFile,
        [string]$User = "root",
        [string]$Password = ""
    )
    
    try {
        if ($Password -eq "") {
            mysql -u $User < $SqlFile
        } else {
            mysql -u $User -p$Password < $SqlFile
        }
        return $true
    } catch {
        return $false
    }
}

# Intentar crear la base de datos
$sqlFile = "database\setup.sql"
$currentDir = Get-Location

Write-Host "🗄️ Creando base de datos..." -ForegroundColor Yellow

# Intentar con diferentes configuraciones
$configurations = @(
    @{ User = "root"; Password = "" },
    @{ User = "root"; Password = "root" },
    @{ User = "root"; Password = "admin" },
    @{ User = "mysql"; Password = "" }
)

$success = $false
foreach ($config in $configurations) {
    Write-Host "Intentando con usuario: $($config.User)" -ForegroundColor Gray
    
    if (Execute-SQL -SqlFile $sqlFile -User $config.User -Password $config.Password) {
        Write-Host "✓ Base de datos creada exitosamente" -ForegroundColor Green
        
        # Actualizar .env con la configuración correcta
        $envContent = @"
DB_HOST=localhost
DB_USER=$($config.User)
DB_PASSWORD=$($config.Password)
DB_NAME=reportes_db
DB_PORT=3306
PORT=5001
NODE_ENV=development
"@
        
        $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
        Write-Host "✓ Archivo .env actualizado" -ForegroundColor Green
        $success = $true
        break
    }
}

if (-not $success) {
    Write-Host "❌ No se pudo crear la base de datos automáticamente" -ForegroundColor Red
    Write-Host "Configuración manual requerida:" -ForegroundColor Yellow
    Write-Host "1. Inicia MySQL Workbench o línea de comandos MySQL" -ForegroundColor White
    Write-Host "2. Ejecuta el archivo: database\setup.sql" -ForegroundColor White
    Write-Host "3. Actualiza el archivo backend\.env con tus credenciales" -ForegroundColor White
    
    # Abrir el archivo SQL para edición manual
    try {
        notepad $sqlFile
    } catch {
        Write-Host "Archivo SQL ubicado en: $currentDir\$sqlFile" -ForegroundColor Cyan
    }
}

Write-Host "🚀 Configuración completada!" -ForegroundColor Green
Write-Host "Próximo paso: Reinicia el backend con 'npm start'" -ForegroundColor Cyan