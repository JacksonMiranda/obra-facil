Write-Host "[BUILD] Iniciando instalacao otimizada de skills..."
$ErrorActionPreference = "Stop"

$baseDir = (Get-Item .).FullName

# 1. Limpeza de diretórios antigos de agentes
Write-Host "[CRÍTICO] Limpando diretorios de agentes externos..."

# Nível local
$localAgentsPath = Join-Path $baseDir ".agents"
if (Test-Path $localAgentsPath) { 
    Write-Host "Removendo $localAgentsPath"
    Remove-Item -Recurse -Force $localAgentsPath 
}
$localCursorPath = Join-Path $baseDir ".cursor"
if (Test-Path $localCursorPath) { 
    Write-Host "Removendo $localCursorPath"
    Remove-Item -Recurse -Force $localCursorPath 
}

# Nível global
$homeDir = [System.Environment]::GetFolderPath('UserProfile')
$globalAgentsPath = Join-Path $homeDir ".agents"
if (Test-Path $globalAgentsPath) { 
    Write-Host "Removendo $globalAgentsPath"
    Remove-Item -Recurse -Force $globalAgentsPath 
}
$globalCursorPath = Join-Path $homeDir ".cursor"
if (Test-Path $globalCursorPath) { 
    Write-Host "Removendo $globalCursorPath"
    Remove-Item -Recurse -Force $globalCursorPath 
}

# 2. Setup dos diretórios da skill
$agentDir = Join-Path $baseDir ".agent"
$skillsDir = Join-Path $agentDir "skills"
if (-not (Test-Path $skillsDir)) { 
    New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null 
}

$tempDir = Join-Path $baseDir "tmp_skills_clone"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$repos = @(
    @{ 
        Url = "https://github.com/vercel-labs/next-skills.git"
        Subdirs = @( 
            @{ Source = "skills/next-best-practices"; Dest = "next-best-practices" }, 
            @{ Source = "skills/next-cache-components"; Dest = "next-cache-components" } 
        ) 
    },
    @{ 
        Url = "https://github.com/vercel-labs/agent-skills.git"
        Subdirs = @( 
            @{ Source = "skills/deploy-to-vercel"; Dest = "deploy-to-vercel" }, 
            @{ Source = "skills/react-best-practices"; Dest = "react-best-practices" }, 
            @{ Source = "skills/web-design-guidelines"; Dest = "web-design-guidelines" }, 
            @{ Source = "skills/composition-patterns"; Dest = "composition-patterns" } 
        ) 
    },
    @{ 
        Url = "https://github.com/prisma/skills.git"
        Subdirs = @( 
            @{ Source = "prisma-database-setup"; Dest = "prisma-database-setup" } 
        ) 
    },
    @{ 
        Url = "https://github.com/google-labs-code/stitch-skills.git"
        Subdirs = @( 
            @{ Source = ""; Dest = "stitch-skills" } 
        ) 
    },
    @{ 
        Url = "https://github.com/supabase/agent-skills.git"
        Subdirs = @( 
            @{ Source = ""; Dest = "supabase" } 
        ) 
    },
    @{ 
        Url = "https://github.com/clerk/skills.git"
        Subdirs = @( 
            @{ Source = ""; Dest = "clerk" } 
        ) 
    },
    @{ 
        Url = "https://github.com/sickn33/antigravity-awesome-skills.git"
        Subdirs = @( 
            @{ Source = "skills/frontend-design"; Dest = "frontend-design" },
            @{ Source = "skills/backend-architect"; Dest = "backend-architect" },
            @{ Source = "skills/nestjs-expert"; Dest = "nestjs-expert" },
            @{ Source = "skills/docker-expert"; Dest = "docker-expert" },
            @{ Source = "skills/github-actions-templates"; Dest = "github-actions-templates" }
        ) 
    }
)

foreach ($repo in $repos) {
    if (-not $repo.Url) { continue }
    $repoName = ($repo.Url -split '/')[-1] -replace '\.git$', ''
    $repoOwner = ($repo.Url -split '/')[-2]
    $uniqueRepoName = "$repoOwner-$repoName"
    $clonePath = Join-Path $tempDir $uniqueRepoName
    
    Write-Host "- [BUILD] Processando repositorio: $uniqueRepoName"
    
    # Usando clone blobless + sparse checkout para máxima otimização
    git clone --no-checkout --depth 1 --filter=blob:none $repo.Url $clonePath | Out-Null
    
    Push-Location $clonePath
    
    # Verifica caminhos específicos (subdiretórios)
    $hasSpecificPaths = $false
    $pathsToSparse = @()
    foreach ($subdir in $repo.Subdirs) {
        if ($subdir.Source -ne "") {
            $hasSpecificPaths = $true
            $pathsToSparse += "`"$($subdir.Source)`""
        }
    }
    
    if ($hasSpecificPaths) {
        git sparse-checkout init --cone | Out-Null
        $pathsArgs = $pathsToSparse -join " "
        $env:GIT_TERMINAL_PROMPT = 0
        Invoke-Expression "git sparse-checkout set $pathsArgs" | Out-Null
    }
    
    git checkout | Out-Null
    Pop-Location
    
    # Copiando para destino
    foreach ($subdir in $repo.Subdirs) {
        $sourcePath = $clonePath
        if ($subdir.Source -ne "") { 
            # Na estrutura sparse com cone, os arquivos estão nos caminhos originais
            $sourcePath = Join-Path $clonePath $subdir.Source 
            # Como em paths com barra o path é exato, precisamos converter as / para o Join-Path
            $sourceParts = $subdir.Source -split '/'
            $sourcePath = $clonePath
            foreach ($part in $sourceParts) {
                $sourcePath = Join-Path $sourcePath $part
            }
        }
        $destPath = Join-Path $skillsDir $subdir.Dest
        
        if (Test-Path $destPath) { Remove-Item -Recurse -Force $destPath }
        
        if (Test-Path $sourcePath) {
            Write-Host "  -> Instalando $($subdir.Dest) em .agent/skills/$($subdir.Dest)"
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        } else {
            Write-Host "  [!] Aviso: Nao encontrou $sourcePath"
        }
        
        # Garantindo limpeza de qualquer .git que possa ter vindo
        $gitFolder = Join-Path $destPath ".git"
        if (Test-Path $gitFolder) { Remove-Item -Recurse -Force $gitFolder }
    }
}

Write-Host "- [BUILD] Limpando diretorio temporario: $tempDir"
Remove-Item -Recurse -Force $tempDir

Write-Host "[BUILD] Instalacao e otimizacao das skills concluiram com sucesso!"
