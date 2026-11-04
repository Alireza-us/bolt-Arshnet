# ============================================================
# Git Manager - Robust Git CLI Manager
# PowerShell 5.1+ / PowerShell 7+
# ============================================================
$ErrorActionPreference = "Continue"
$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Definition

# ------------------------------------------------------------
# UI
# ------------------------------------------------------------
function Write-Title {
    param([string]$Text)
    Clear-Host
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "                       GIT MANAGER" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $Text -ForegroundColor White
    Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
}

function Write-Success { param([string]$Text) Write-Host $Text -ForegroundColor Green }
function Write-WarningMsg { param([string]$Text) Write-Host $Text -ForegroundColor Yellow }
function Write-ErrorMsg { param([string]$Text) Write-Host $Text -ForegroundColor Red }
function Write-Info { param([string]$Text) Write-Host $Text -ForegroundColor Cyan }

function Pause-Menu {
    Write-Host ""
    [void](Read-Host)
}

# ------------------------------------------------------------
# Git helpers
# ------------------------------------------------------------
function Invoke-Git {
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$Arguments,
        [switch]$Quiet
    )
    $gitOutput = @(& git @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
    if (-not $Quiet) {
        foreach ($line in $gitOutput) {
            if ($null -ne $line) {
                Write-Host ([string]$line)
            }
        }
    }
    return [int]$exitCode
}

function Test-GitInstalled {
    return $null -ne (Get-Command git -ErrorAction SilentlyContinue)
}

function Find-GitRepository {
    $root = & git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $root) {
        return ([string]$root).Trim()
    }
    return $null
}

function Get-GitRoot {
    $root = Find-GitRepository
    if ($root) { return $root }
    return (Get-Location).Path
}

function Get-CurrentBranch {
    $branch = & git symbolic-ref --quiet --short HEAD 2>$null
    if ($LASTEXITCODE -eq 0 -and $branch) {
        return ([string]$branch).Trim()
    }
    return $null
}

function Get-RemoteURL {
    $remote = & git remote get-url origin 2>$null
    if ($LASTEXITCODE -eq 0 -and $remote) {
        return ([string]$remote).Trim()
    }
    return $null
}

function Get-Upstream {
    $upstream = & git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null
    if ($LASTEXITCODE -eq 0 -and $upstream) {
        return ([string]$upstream).Trim()
    }
    return $null
}

function Test-RemoteBranchExists {
    param([Parameter(Mandatory=$true)][string]$Branch)
    & git ls-remote --exit-code --heads origin $Branch *> $null
    return $LASTEXITCODE -eq 0
}

function Set-UpstreamIfRemoteBranchExists {
    param([Parameter(Mandatory=$true)][string]$Branch)
    if (Get-Upstream) { return $true }
    if (Test-RemoteBranchExists -Branch $Branch) {
        Write-Info "Remote branch origin/$Branch exists. Configuring it as upstream..."
        $code = Invoke-Git @("branch", "--set-upstream-to=origin/$Branch", $Branch)
        if ($code -eq 0) {
            Write-Success "Upstream configured: origin/$Branch"
            return $true
        }
        Write-ErrorMsg "Could not configure the upstream branch."
        return $false
    }
    return $false
}

function Test-DetachedHead {
    return [string]::IsNullOrWhiteSpace((Get-CurrentBranch))
}

function Require-Repository {
    $repo = Find-GitRepository
    if (-not $repo) {
        Write-ErrorMsg ""
        Write-ErrorMsg "This folder is NOT a Git repository."
        Write-Host ""
        Write-Host "Current directory: $((Get-Location).Path)"
        Write-Host ""
        Write-Host "Navigate to your repository first."
        Pause-Menu
        return $false
    }
    return $true
}

function Require-BranchForPush {
    if (Test-DetachedHead) {
        Write-ErrorMsg "HEAD is detached. Push requires a checked-out branch."
        Write-Host "Checkout a branch first, then retry."
        return $false
    }
    return $true
}

function Test-Conflict {
    $files = @(git diff --name-only --diff-filter=U 2>$null)
    return $files.Count -gt 0
}

function Get-ConflictedFiles {
    return @(git diff --name-only --diff-filter=U 2>$null)
}

function Test-OperationInProgress {
    $gitDir = git rev-parse --git-dir 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $gitDir) { return $false }
    $markers = @(
        (Join-Path $gitDir "MERGE_HEAD"),
        (Join-Path $gitDir "CHERRY_PICK_HEAD"),
        (Join-Path $gitDir "REVERT_HEAD"),
        (Join-Path $gitDir "rebase-merge"),
        (Join-Path $gitDir "rebase-apply")
    )
    foreach ($marker in $markers) {
        if (Test-Path $marker) { return $true }
    }
    return $false
}

function Show-ConflictFiles {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "                         CONFLICTS" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    $files = Get-ConflictedFiles
    if ($files.Count -eq 0) {
        Write-Success "No conflicted files found."
        return
    }
    foreach ($file in $files) {
        Write-Host "  [CONFLICT] " -NoNewline -ForegroundColor Red
        Write-Host $file
    }
    Write-Host ""
}

function Show-RepositoryInfo {
    $repo = Find-GitRepository
    if (-not $repo) {
        Write-Host "Repository: NOT FOUND" -ForegroundColor Red
        return
    }
    $branch = Get-CurrentBranch
    $remote = Get-RemoteURL
    $upstream = Get-Upstream
    Write-Host "Repository : " -NoNewline
    Write-Host $repo -ForegroundColor Green
    Write-Host "Branch     : " -NoNewline
    Write-Host $(if ($branch) { $branch } else { "DETACHED HEAD" }) -ForegroundColor Green
    Write-Host "Remote     : " -NoNewline
    Write-Host $(if ($remote) { $remote } else { "No origin configured" }) -ForegroundColor DarkCyan
    Write-Host "Upstream   : " -NoNewline
    Write-Host $(if ($upstream) { $upstream } else { "Not configured" }) -ForegroundColor DarkCyan
    $account = Resolve-RepositoryAccount
    if ($account) {
        Write-Host "GitHub     : " -NoNewline
        Write-Host "$(Get-AccountDisplayName $account)" -ForegroundColor Magenta
    }
    Write-Host ""
}

function Get-WorkingTreeState {
    $status = @(git status --porcelain=v1 --untracked-files=all 2>$null)
    return $status
}

function Test-WorkingTreeDirty {
    return (Get-WorkingTreeState).Count -gt 0
}

function Test-StagedChanges {
    $files = @(git diff --cached --name-only 2>$null)
    return $files.Count -gt 0
}

function Test-LocalCommitsAhead {
    $upstream = Get-Upstream
    if (-not $upstream) { return $false }
    $counts = git rev-list --left-right --count "$upstream...HEAD" 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $counts) { return $false }
    $parts = ([string]$counts).Trim() -split "\s+"
    if ($parts.Count -ge 2) {
        return ([int]$parts[1] -gt 0)
    }
    return $false
}

function Show-StatusSummary {
    Write-Host ""
    $status = Get-WorkingTreeState
    if ($status.Count -eq 0) {
        Write-Success "Working tree is clean."
    } else {
        Write-WarningMsg "Working tree has changes:"
        $status | ForEach-Object { Write-Host "  $_" }
    }
    Write-Host ""
}

# ------------------------------------------------------------
# Multi-account GitHub authentication
# ------------------------------------------------------------
$GitManagerDataDirectory = Join-Path $env:USERPROFILE ".gitmanager"
$GitManagerAccountsFile = Join-Path $GitManagerDataDirectory "accounts.json"
$GitManagerRepositoriesFile = Join-Path $GitManagerDataDirectory "repositories.json"

function Initialize-GitManagerData {
    if (-not (Test-Path $GitManagerDataDirectory)) {
        New-Item -ItemType Directory -Path $GitManagerDataDirectory -Force | Out-Null
    }
    if (-not (Test-Path $GitManagerAccountsFile)) {
        @() | ConvertTo-Json | Set-Content -Path $GitManagerAccountsFile -Encoding UTF8
    }
    if (-not (Test-Path $GitManagerRepositoriesFile)) {
        @() | ConvertTo-Json | Set-Content -Path $GitManagerRepositoriesFile -Encoding UTF8
    }
}

function Get-GitManagerAccounts {
    Initialize-GitManagerData
    try {
        $raw = Get-Content -Raw -Path $GitManagerAccountsFile -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
        $data = $raw | ConvertFrom-Json
        if ($null -eq $data) { return @() }
        return @($data)
    }
    catch {
        Write-ErrorMsg "Git Manager account configuration is invalid."
        Write-Host "File: $GitManagerAccountsFile"
        return @()
    }
}

function Save-GitManagerAccounts {
    param([Parameter(Mandatory=$true)][AllowEmptyCollection()][array]$Accounts)
    Initialize-GitManagerData
    $temp = "$GitManagerAccountsFile.tmp"
    $items = @($Accounts | Where-Object { $null -ne $_ })
    if ($items.Count -eq 0) { $json = "[]" }
    else { $json = ConvertTo-Json -InputObject $items -Depth 6 }
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($temp, [string]$json, $utf8NoBom)
        Move-Item -LiteralPath $temp -Destination $GitManagerAccountsFile -Force -ErrorAction Stop
    }
    catch {
        Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
        throw
    }
}

function Backup-GitManagerAccounts {
    Initialize-GitManagerData
    if (-not (Test-Path $GitManagerAccountsFile)) { return $null }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backup = Join-Path $GitManagerDataDirectory "accounts.backup.$stamp.json"
    Copy-Item -LiteralPath $GitManagerAccountsFile -Destination $backup -Force
    return $backup
}

function Get-GitManagerRepositories {
    Initialize-GitManagerData
    try {
        $raw = Get-Content -Raw -Path $GitManagerRepositoriesFile -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
        $data = $raw | ConvertFrom-Json
        if ($null -eq $data) { return @() }
        return @($data)
    }
    catch {
        Write-ErrorMsg "Git Manager repository registry is invalid."
        Write-Host "File: $GitManagerRepositoriesFile"
        return @()
    }
}

function Save-GitManagerRepositories {
    param([Parameter(Mandatory=$true)][array]$Repositories)
    Initialize-GitManagerData
    $temp = "$GitManagerRepositoriesFile.tmp"
    $json = @($Repositories) | ConvertTo-Json -Depth 8
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($temp, [string]$json, $utf8NoBom)
        Move-Item -LiteralPath $temp -Destination $GitManagerRepositoriesFile -Force
    }
    catch {
        Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
        throw
    }
}

function Register-Repository {
    param(
        [string]$RepositoryPath,
        [string]$AccountName,
        [string]$GitHubUser,
        [string]$Remote
    )
    if ([string]::IsNullOrWhiteSpace($RepositoryPath)) { return $false }
    try {
        $fullPath = [System.IO.Path]::GetFullPath($RepositoryPath).TrimEnd('\','/')
    }
    catch {
        return $false
    }
    if (-not (Test-Path -LiteralPath $fullPath -PathType Container)) {
        return $false
    }
    $items = @(Get-GitManagerRepositories)
    $existing = $null
    foreach ($item in $items) {
        if ([string]::Equals(
            ([string]$item.Path).TrimEnd('\','/'),
            $fullPath,
            [System.StringComparison]::OrdinalIgnoreCase
        )) {
            $existing = $item
            break
        }
    }
    $name = Split-Path -Leaf $fullPath
    if ([string]::IsNullOrWhiteSpace($name)) { $name = $fullPath }
    if ($existing) {
        $existing.Path = $fullPath
        $existing.Name = $name
        if (-not [string]::IsNullOrWhiteSpace($AccountName)) { $existing.AccountName = $AccountName }
        if (-not [string]::IsNullOrWhiteSpace($GitHubUser)) { $existing.GitHubUser = $GitHubUser }
        if (-not [string]::IsNullOrWhiteSpace($Remote)) { $existing.Remote = $Remote }
        $existing.UpdatedAt = (Get-Date).ToString("s")
    }
    else {
        $items += [pscustomobject]@{
            Name        = $name
            Path        = $fullPath
            AccountName = $AccountName
            GitHubUser  = $GitHubUser
            Remote      = $Remote
            UpdatedAt   = (Get-Date).ToString("s")
        }
    }
    try {
        Save-GitManagerRepositories -Repositories $items
        return $true
    }
    catch {
        Write-WarningMsg "Could not update repository registry: $($_.Exception.Message)"
        return $false
    }
}

function Remove-StaleRepositoryEntries {
    $items = @(Get-GitManagerRepositories)
    if ($items.Count -eq 0) { return @() }
    $valid = @()
    foreach ($item in $items) {
        if (-not [string]::IsNullOrWhiteSpace([string]$item.Path) -and
            (Test-Path -LiteralPath ([string]$item.Path) -PathType Container) -and
            (Test-Path -LiteralPath (Join-Path ([string]$item.Path) ".git"))) {
            $valid += $item
        }
    }
    if ($valid.Count -ne $items.Count) {
        try { Save-GitManagerRepositories -Repositories $valid } catch {}
    }
    return @($valid)
}

function Select-RepositoryFromList {
    Write-Title "REPOSITORY LIST"
    $items = @(Remove-StaleRepositoryEntries)
    if ($items.Count -eq 0) {
        Write-WarningMsg "No repositories have been registered yet."
        Write-Host ""
        Write-Host "Repositories are added automatically when you clone one with GitManager"
        Write-Host "or assign an account to an existing repository."
        Pause-Menu
        return
    }
    foreach ($item in $items) {
        if (Test-Path -LiteralPath ([string]$item.Path) -PathType Container) {
            Push-Location -LiteralPath ([string]$item.Path)
            try {
                $remote = Get-RemoteURL
                $account = Get-AccountForCurrentRepository
                if ($account) {
                    $item.AccountName = $account.Name
                    $item.GitHubUser = $account.GitHubUser
                }
                if ($remote) { $item.Remote = $remote }
                $item.UpdatedAt = (Get-Date).ToString("s")
            }
            finally {
                Pop-Location
            }
        }
    }
    try { Save-GitManagerRepositories -Repositories $items } catch {}
    Write-Host ""
    Write-Host ("{0,-4} {1,-24} {2,-24} {3}" -f "#","Repository","Account","Path") -ForegroundColor Cyan
    Write-Host ("{0,-4} {1,-24} {2,-24} {3}" -f "--","------------------------","------------------------","------------------------------") -ForegroundColor DarkGray
    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $accountText = if ([string]::IsNullOrWhiteSpace([string]$item.AccountName)) { "Not assigned" } else { [string]$item.AccountName }
        $displayPath = [string]$item.Path
        if ($displayPath.Length -gt 55) {
            $displayPath = "..." + $displayPath.Substring($displayPath.Length - 52)
        }
        Write-Host ("{0,-4} {1,-24} {2,-24} {3}" -f ($i + 1), $item.Name, $accountText, $displayPath)
    }
    Write-Host ""
    $choice = Read-Host "Select repository number (ENTER = cancel)"
    if ([string]::IsNullOrWhiteSpace($choice)) { return }
    $number = 0
    if (-not [int]::TryParse($choice, [ref]$number) -or $number -lt 1 -or $number -gt $items.Count) {
        Write-ErrorMsg "Invalid repository selection."
        Pause-Menu
        return
    }
    $selected = $items[$number - 1]
    if (-not (Test-Path -LiteralPath ([string]$selected.Path) -PathType Container)) {
        Write-ErrorMsg "Repository folder no longer exists."
        Pause-Menu
        return
    }
    Set-Location -LiteralPath ([string]$selected.Path)
    Write-Host ""
    Write-Success "Repository selected:"
    Write-Host "  $($selected.Name)"
    Write-Info "Path    : $($selected.Path)"
    if ([string]::IsNullOrWhiteSpace([string]$selected.AccountName)) {
        Write-WarningMsg "Account  : Not assigned"
    }
    else {
        Write-Info "Account : $($selected.AccountName) [$($selected.GitHubUser)]"
    }
    if ($selected.Remote) { Write-Info "Remote  : $($selected.Remote)" }
    Write-Host ""
    Write-Success "Current directory changed to the selected repository."
    Pause-Menu
}

function Reset-GitManagerData {
    Write-Title "RESET GIT MANAGER DATA"
    Write-WarningMsg "This resets GitManager's local account database only."
    Write-Host "It does NOT delete the repository, commits, branches, remotes, or SSH keys."
    Write-Host "Repository account mappings stored in .git/config are also kept."
    Write-Host ""
    $answer = Read-Host "Type RESET to continue"
    if ($answer -cne "RESET") {
        Write-WarningMsg "Reset cancelled."
        Pause-Menu
        return
    }
    $backup = Backup-GitManagerAccounts
    try {
        if (Test-Path $GitManagerAccountsFile) {
            Remove-Item -LiteralPath $GitManagerAccountsFile -Force -ErrorAction Stop
        }
        Initialize-GitManagerData
        Write-Success "GitManager account database has been reset."
        if ($backup) { Write-Info "Backup: $backup" }
        Write-Host "You can now add the GitHub account again from Account Manager."
    }
    catch {
        Write-ErrorMsg "Could not reset GitManager data: $($_.Exception.Message)"
    }
    Pause-Menu
}

function Test-GitManagerConfiguration {
    Write-Title "GIT MANAGER DIAGNOSTICS"
    Write-Host ""
    $checks = @()
    $git = Get-Command git -ErrorAction SilentlyContinue
    $checks += [pscustomobject]@{ Check = "Git executable"; Status = if ($git) { "OK" } else { "FAIL" }; Detail = if ($git) { $git.Source } else { "git not found in PATH" } }
    $repo = Find-GitRepository
    $checks += [pscustomobject]@{ Check = "Git repository"; Status = if ($repo) { "OK" } else { "FAIL" }; Detail = if ($repo) { $repo } else { (Get-Location).Path } }
    if ($repo) {
        $branch = Get-CurrentBranch
        $remote = Get-RemoteURL
        $upstream = Get-Upstream
        $checks += [pscustomobject]@{ Check = "Current branch"; Status = if ($branch) { "OK" } else { "FAIL" }; Detail = if ($branch) { $branch } else { "Detached HEAD" } }
        $checks += [pscustomobject]@{ Check = "Origin remote"; Status = if ($remote) { "OK" } else { "FAIL" }; Detail = if ($remote) { $remote } else { "Missing" } }
        $checks += [pscustomobject]@{ Check = "Upstream"; Status = if ($upstream) { "OK" } else { "WARN" }; Detail = if ($upstream) { $upstream } else { "Not configured" } }
        $checks += [pscustomobject]@{ Check = "Merge conflicts"; Status = if (Test-Conflict) { "FAIL" } else { "OK" }; Detail = if (Test-Conflict) { (Get-ConflictedFiles -join ", ") } else { "None" } }
        $checks += [pscustomobject]@{ Check = "Operation in progress"; Status = if (Test-OperationInProgress) { "WARN" } else { "OK" }; Detail = if (Test-OperationInProgress) { "Merge/rebase/cherry-pick/revert active" } else { "None" } }
        $checks += [pscustomobject]@{ Check = "Working tree"; Status = if (Test-WorkingTreeDirty) { "WARN" } else { "OK" }; Detail = if (Test-WorkingTreeDirty) { "Changes present" } else { "Clean" } }
    }
    $accounts = @(Get-GitManagerAccounts)
    $checks += [pscustomobject]@{ Check = "GitManager accounts"; Status = "OK"; Detail = "$($accounts.Count) profile(s)" }
    foreach ($row in $checks) {
        $color = switch ($row.Status) { "OK" { "Green" } "WARN" { "Yellow" } default { "Red" } }
        Write-Host ("{0,-24} {1,-6} {2}" -f $row.Check, $row.Status, $row.Detail) -ForegroundColor $color
    }
    Write-Host ""
    if ($repo) {
        Write-Info "Git identity:"
        git config --local --get user.name
        git config --local --get user.email
        Write-Host ""
        Write-Info "Remote:"
        git remote -v
    }
    Pause-Menu
}

function Get-AccountByName {
    param([string]$Name)
    if ([string]::IsNullOrWhiteSpace($Name)) { return $null }
    foreach ($account in Get-GitManagerAccounts) {
        if ([string]::Equals([string]$account.Name, $Name, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $account
        }
    }
    return $null
}

function Get-AccountForCurrentRepository {
    if (-not (Find-GitRepository)) { return $null }
    $name = & git config --local --get gitmanager.account 2>$null
    if ($LASTEXITCODE -eq 0 -and $name) {
        return Get-AccountByName ([string]$name).Trim()
    }
    $legacy = Join-Path (Get-GitRoot) ".gitmanager-account"
    if (Test-Path $legacy) {
        $legacyName = (Get-Content -Raw -Path $legacy -ErrorAction SilentlyContinue).Trim()
        if ($legacyName) {
            $legacyAccount = Get-AccountByName $legacyName
            if ($legacyAccount) {
                [void](Save-RepositoryAccount -AccountName $legacyAccount.Name)
                $gitInfo = git rev-parse --git-path info 2>$null
                if ($LASTEXITCODE -eq 0 -and $gitInfo) {
                    $exclude = Join-Path ([string]$gitInfo).Trim() "exclude"
                    if (-not (Test-Path $exclude)) { New-Item -ItemType File -Path $exclude -Force | Out-Null }
                    $lines = @(Get-Content $exclude -ErrorAction SilentlyContinue)
                    if ($lines -notcontains ".gitmanager-account") { Add-Content -Path $exclude -Value ".gitmanager-account" }
                }
                return $legacyAccount
            }
        }
    }
    return $null
}

function Save-RepositoryAccount {
    param([Parameter(Mandatory=$true)][string]$AccountName)
    $code = Invoke-Git @("config", "--local", "gitmanager.account", $AccountName)
    if ($code -ne 0) {
        Write-WarningMsg "Could not save the repository account mapping in local Git config."
        return $false
    }
    try {
        $account = Get-AccountByName $AccountName
        $repoRoot = Find-GitRepository
        if ($repoRoot) {
            $remote = Get-RemoteURL
            [void](Register-Repository `
                -RepositoryPath $repoRoot `
                -AccountName $AccountName `
                -GitHubUser $(if ($account) { [string]$account.GitHubUser } else { "" }) `
                -Remote $remote)
        }
    }
    catch {
        Write-WarningMsg "Repository was mapped, but the repository list could not be updated."
    }
    return $true
}

function Get-GitHubPathFromRemote {
    param([string]$Remote)
    if ([string]::IsNullOrWhiteSpace($Remote)) { return $null }
    $r = $Remote.Trim()
    if ($r -match '^(?:[^@]+@)?(?<host>[^:\/]+):(?<path>.+)$') {
        return [pscustomobject]@{
            Host = $matches.host
            Path = $matches.path.TrimStart("/")
        }
    }
    try {
        $u = [Uri]$r
        return [pscustomobject]@{
            Host = $u.Host
            Path = $u.AbsolutePath.TrimStart("/")
        }
    }
    catch {
        return $null
    }
}

function Convert-ToAccountRemote {
    param(
        [Parameter(Mandatory=$true)][string]$Remote,
        [Parameter(Mandatory=$true)]$Account
    )
    $parts = Get-GitHubPathFromRemote $Remote
    if (-not $parts) { return $Remote }
    $path = $parts.Path.TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($path)) { return $Remote }
    return "git@$($Account.HostAlias):$path"
}

function Get-AccountDisplayName {
    param($Account)
    if ($null -eq $Account) { return "Unknown" }
    if ($Account -is [bool]) { return "External repository" }
    return "$($Account.Name) [$($Account.GitHubUser)]"
}

function Is-GitHubRemote {
    param([string]$Remote)
    $parts = Get-GitHubPathFromRemote $Remote
    if (-not $parts) { return $false }
    $remoteHost = ([string]$parts.Host).ToLowerInvariant()
    return ($remoteHost -eq "github.com" -or $remoteHost -like "github-*")
}

function Ensure-SSHDirectory {
    $ssh = Join-Path $env:USERPROFILE ".ssh"
    if (-not (Test-Path $ssh)) {
        New-Item -ItemType Directory -Path $ssh -Force | Out-Null
    }
    return $ssh
}

function Ensure-SSHConfigForAccount {
    param([Parameter(Mandatory=$true)]$Account)
    if ([string]::IsNullOrWhiteSpace($Account.SSHKey)) {
        return $false
    }
    $sshDir = Ensure-SSHDirectory
    $configPath = Join-Path $sshDir "config"
    if (-not (Test-Path $configPath)) {
        New-Item -ItemType File -Path $configPath -Force | Out-Null
    }
    $config = Get-Content -Raw -Path $configPath -ErrorAction SilentlyContinue
    if ($null -eq $config) { $config = "" }
    $config = [string]$config -replace '^', ''
    $alias = ([string]$Account.HostAlias).Trim()
    $escapedAlias = [regex]::Escape($alias)
    $sshKeyPath = ([string]$Account.SSHKey).Trim().Replace('\', '/')
    $sshKeyPath = $sshKeyPath.Replace('"', '\"')
    $blockPattern = "(?ms)^\s*Host\s+$escapedAlias\s*$.*?(?=^\s*Host\s+|\z)"
    $block = @"
Host $alias
HostName github.com
User git
IdentityFile "$sshKeyPath"
IdentitiesOnly yes
"@
    if ($config -match $blockPattern) {
        $config = [regex]::Replace($config, $blockPattern, $block.TrimEnd() + "`r`n")
    } else {
        if ($config.Length -gt 0 -and -not $config.EndsWith("`n")) {
            $config += "`r`n"
        }
        $config += "`r`n" + $block.TrimEnd() + "`r`n"
    }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($configPath, $config, $utf8NoBom)
    return $true
}

function Test-SSHKeyExists {
    param([Parameter(Mandatory=$true)]$Account)
    if ([string]::IsNullOrWhiteSpace($Account.SSHKey)) { return $false }
    $expanded = $Account.SSHKey.Replace("~", $env:USERPROFILE)
    return Test-Path $expanded
}

function Ensure-AccountSSH {
    param([Parameter(Mandatory=$true)]$Account)
    if (-not (Test-SSHKeyExists $Account)) {
        Write-ErrorMsg "SSH private key was not found for account '$($Account.Name)'."
        Write-Host "Expected: $($Account.SSHKey)"
        Write-Host "Use Account Manager to create/configure the key."
        return $false
    }
    if (-not (Ensure-SSHConfigForAccount $Account)) {
        Write-ErrorMsg "Could not configure SSH for '$($Account.Name)'."
        return $false
    }
    return $true
}

function Set-RepositoryGitIdentity {
    param([Parameter(Mandatory=$true)]$Account)
    $name = [string]$Account.GitName
    $email = [string]$Account.Email
    if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-ErrorMsg "Account '$($Account.Name)' is missing Git name or email."
        return $false
    }
    $code1 = Invoke-Git @("config", "user.name", $name)
    $code2 = Invoke-Git @("config", "user.email", $email)
    return ($code1 -eq 0 -and $code2 -eq 0)
}

function Select-GitHubAccount {
    param([switch]$AllowCancel)
    $accounts = @(Get-GitManagerAccounts)
    if ($accounts.Count -eq 0) {
        Write-WarningMsg "No GitHub accounts are configured yet."
        if (Read-Host "Create the first account now? (Y/N)" -match "^(Y|y)$") {
            Add-OrUpdateAccount
            $accounts = @(Get-GitManagerAccounts)
        }
    }
    if ($accounts.Count -eq 0) { return $null }
    Write-Host ""
    Write-Host "GitHub accounts:"
    for ($i = 0; $i -lt $accounts.Count; $i++) {
        $a = $accounts[$i]
        Write-Host "$($i + 1). $($a.Name)  [$($a.GitHubUser)]"
    }
    if ($AllowCancel) { Write-Host "0. Cancel" }
    Write-Host ""
    $answer = Read-Host "Select account"
    $n = 0
    if (-not [int]::TryParse($answer, [ref]$n)) { return $null }
    if ($AllowCancel -and $n -eq 0) { return $null }
    if ($n -lt 1 -or $n -gt $accounts.Count) { return $null }
    return $accounts[$n - 1]
}

function Resolve-RepositoryAccount {
    if (-not (Find-GitRepository)) { return $null }
    $accounts = @(Get-GitManagerAccounts)
    if ($accounts.Count -eq 0) { return $null }
    $saved = Get-AccountForCurrentRepository
    if ($saved) { return $saved }
    $remote = Get-RemoteURL
    $parts = Get-GitHubPathFromRemote $remote
    if (-not $parts) { return $null }
    $owner = ($parts.Path -split "/")[0]
    $remoteHost = $parts.Host
    foreach ($account in $accounts) {
        if ([string]::Equals([string]$remoteHost, [string]$account.HostAlias, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $account
        }
    }
    foreach ($account in $accounts) {
        if ($account.GitHubUser -and
            [string]::Equals([string]$owner, [string]$account.GitHubUser, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $account
        }
    }
    return $null
}

function Ensure-RepositoryAccount {
    param([switch]$Interactive)
    if (-not (Find-GitRepository)) { return $null }
    $remote = Get-RemoteURL
    if ([string]::IsNullOrWhiteSpace($remote)) {
        Write-ErrorMsg "No 'origin' remote is configured."
        return $null
    }
    if (-not (Is-GitHubRemote $remote)) {
        return [pscustomobject]@{
            Name = "External"
            GitHubUser = ""
            Email = ""
            GitName = ""
            HostAlias = ""
            SSHKey = ""
            External = $true
        }
    }
    $accounts = @(Get-GitManagerAccounts)
    if ($accounts.Count -eq 0) {
        Write-WarningMsg "No GitHub accounts are configured yet."
        if ($Interactive) {
            $create = Read-Host "Create a GitHub account profile now? (Y/N)"
            if ($create -match "^(Y|y)$") {
                Add-OrUpdateAccount
                $accounts = @(Get-GitManagerAccounts)
            }
        }
    }
    if ($accounts.Count -eq 0) {
        Write-ErrorMsg "No GitHub account profiles are configured."
        return $null
    }
    $account = Resolve-RepositoryAccount
    if (-not $account -and $Interactive) {
        Write-WarningMsg "GitHub account could not be determined automatically."
        $account = Select-GitHubAccount -AllowCancel
        if (-not $account) {
            Write-ErrorMsg "No GitHub account selected. Operation cancelled."
            return $null
        }
    }
    if (-not $account) {
        Write-ErrorMsg "No GitHub account is mapped to this repository."
        Write-Host "Use Account Manager -> Assign current repository to account."
        return $null
    }
    if (-not (Ensure-AccountSSH $account)) { return $null }
    if (-not (Set-RepositoryGitIdentity $account)) { return $null }
    $desiredRemote = Convert-ToAccountRemote -Remote $remote -Account $account
    if ($desiredRemote -and $desiredRemote -ne $remote) {
        $code = Invoke-Git @("remote", "set-url", "origin", $desiredRemote)
        if ($code -ne 0) {
            Write-ErrorMsg "Could not assign origin to account '$($account.Name)'."
            return $null
        }
        Write-Info "Origin assigned to GitHub account: $($account.Name) [$($account.GitHubUser)]"
    }
    [void](Save-RepositoryAccount -AccountName $account.Name)
    return $account
}

function Test-GitHubAccountSSH {
    param([Parameter(Mandatory=$true)]$Account)
    if (-not (Ensure-AccountSSH $Account)) { return $false }
    Write-Host ""
    Write-Info "Testing GitHub authentication for '$($Account.Name)'..."
    Write-Host ""
    if ($null -eq (Get-Command ssh -ErrorAction SilentlyContinue)) {
        Write-ErrorMsg "OpenSSH client was not found in PATH."
        return $false
    }
    $output = & ssh -o BatchMode=yes -o ConnectTimeout=10 -T "git@$($Account.HostAlias)" 2>&1 | Out-String
    if ($output -match "successfully authenticated|You've successfully authenticated|Hi\s+$([regex]::Escape([string]$Account.GitHubUser))") {
        Write-Success "SSH authentication appears to be working for $($Account.GitHubUser)."
        return $true
    }
    Write-ErrorMsg "SSH authentication test did not confirm the GitHub account."
    Write-Host $output
    return $false
}

function Show-AccountPublicKey {
    param([Parameter(Mandatory=$true)]$Account)
    if (-not (Test-SSHKeyExists $Account)) {
        Write-ErrorMsg "Private key not found: $($Account.SSHKey)"
        return
    }
    $pub = "$($Account.SSHKey).pub"
    if (-not (Test-Path $pub)) {
        Write-ErrorMsg "Public key not found: $pub"
        return
    }
    Write-Host ""
    Write-Host "============================================================"
    Write-Host "PUBLIC SSH KEY - ADD THIS TO GITHUB"
    Write-Host "============================================================"
    Write-Host ""
    Get-Content -Raw -Path $pub
    Write-Host ""
    Write-Host "GitHub: Settings -> SSH and GPG keys -> New SSH key"
}

function Add-OrUpdateAccount {
    Write-Title "GITHUB ACCOUNT MANAGER"
    $existing = @(Get-GitManagerAccounts)
    Write-Host "Existing accounts:"
    if ($existing.Count -eq 0) {
        Write-Host "  None"
    } else {
        foreach ($a in $existing) {
            Write-Host "  - $($a.Name) [$($a.GitHubUser)]"
        }
    }
    Write-Host ""
    $name = Read-Host "Profile name (example: Personal or Work)"
    if ([string]::IsNullOrWhiteSpace($name)) { return }
    $old = Get-AccountByName $name
    $user = Read-Host "GitHub username"
    $email = Read-Host "Git email"
    $gitName = Read-Host "Git author name"
    if ([string]::IsNullOrWhiteSpace($gitName)) { $gitName = $user }
    $defaultAlias = "github-" + (($name -replace "[^A-Za-z0-9_-]", "-").ToLower())
    $alias = Read-Host "SSH Host alias [$defaultAlias]"
    if ([string]::IsNullOrWhiteSpace($alias)) { $alias = $defaultAlias }
    $sshDir = Ensure-SSHDirectory
    $defaultKey = Join-Path $sshDir ("id_ed25519_github_" + (($name -replace "[^A-Za-z0-9_-]", "_").ToLower()))
    Write-Host "SSH key setup:"
    Write-Host "1. Use an existing SSH private key (recommended if its public key is already added to GitHub)"
    Write-Host "2. Generate a new SSH key"
    Write-Host "3. Enter a private-key path manually"
    $keyChoice = Read-Host "Choose [1/2/3] (default 1)"
    if ([string]::IsNullOrWhiteSpace($keyChoice)) { $keyChoice = "1" }
    if ($keyChoice -eq "1") {
        $keyFiles = @()
        if (Test-Path $sshDir) {
            $keyFiles = @(Get-ChildItem -LiteralPath $sshDir -File -ErrorAction SilentlyContinue | Where-Object {
                $_.Name -notlike "*.pub" -and $_.Name -notin @("config", "known_hosts", "known_hosts.old") -and $_.Extension -notin @(".bak", ".old")
            })
        }
        if ($keyFiles.Count -gt 0) {
            Write-Host "Private keys found in $sshDir :"
            for ($i = 0; $i -lt $keyFiles.Count; $i++) {
                $pubState = if (Test-Path ($keyFiles[$i].FullName + ".pub")) { "public key present" } else { "no .pub file" }
                Write-Host ("{0}. {1} ({2})" -f ($i + 1), $keyFiles[$i].Name, $pubState)
            }
            Write-Host "M. Enter another path manually"
            $keyPick = Read-Host "Select key number or M"
            if ($keyPick -match '^\d+$' -and [int]$keyPick -ge 1 -and [int]$keyPick -le $keyFiles.Count) {
                $key = $keyFiles[[int]$keyPick - 1].FullName
            } elseif ($keyPick -match '^(M|m)$') {
                $key = Read-Host "Full path to existing SSH PRIVATE key (not the .pub file)"
            } else {
                Write-WarningMsg "Invalid key selection. Account creation cancelled."
                Pause-Menu
                return
            }
        } else {
            Write-WarningMsg "No existing private keys were found in $sshDir."
            $key = Read-Host "Enter full path to existing SSH PRIVATE key, or press Enter to use the default path"
            if ([string]::IsNullOrWhiteSpace($key)) { $key = $defaultKey }
        }
    } elseif ($keyChoice -eq "2") {
        $key = Read-Host "New SSH private key path [$defaultKey]"
        if ([string]::IsNullOrWhiteSpace($key)) { $key = $defaultKey }
    } elseif ($keyChoice -eq "3") {
        $key = Read-Host "Full path to SSH PRIVATE key (not the .pub file)"
        if ([string]::IsNullOrWhiteSpace($key)) { Write-WarningMsg "Key path is required. Account creation cancelled."; Pause-Menu; return }
    } else {
        Write-WarningMsg "Invalid selection. Account creation cancelled."
        Pause-Menu
        return
    }
    $key = $key.Replace("~", $env:USERPROFILE)
    if ($key -match '\.pub$') {
        Write-ErrorMsg "Select the private key file, not the .pub public-key file."
        Pause-Menu
        return
    }
    $account = [pscustomobject]@{
        Name = $name
        GitHubUser = $user
        Email = $email
        GitName = $gitName
        HostAlias = $alias
        SSHKey = $key
    }
    if (-not (Test-Path $key)) {
        $create = "N"
        if ($keyChoice -eq "2") { $create = Read-Host "SSH key does not exist. Generate it now? (Y/N)" }
        else { Write-ErrorMsg "The selected private key was not found: $key" }
        if ($create -match "^(Y|y)$") {
            $sshDir = Split-Path -Parent $key
            if (-not (Test-Path $sshDir)) {
                New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
            }
            $code = & ssh-keygen -t ed25519 -C $email -f $key
            if ($LASTEXITCODE -ne 0) {
                Write-ErrorMsg "SSH key generation failed."
                Pause-Menu
                return
            }
            Write-Success "SSH key created."
        }
        if (-not (Test-Path $key)) {
            Write-ErrorMsg "No usable private key is available. Account was not saved."
            Pause-Menu
            return
        }
    }
    Ensure-SSHConfigForAccount $account | Out-Null
    $newList = @()
    foreach ($a in $existing) {
        if (-not [string]::Equals([string]$a.Name, $name, [System.StringComparison]::OrdinalIgnoreCase)) {
            $newList += $a
        }
    }
    $newList += $account
    Save-GitManagerAccounts -Accounts $newList
    Write-Success "Account '$name' saved."
    Write-Host ""
    Show-AccountPublicKey -Account $account
    Pause-Menu
}

function Remove-GitHubAccount {
    Write-Title "DELETE GITHUB ACCOUNT"
    $account = Select-GitHubAccount -AllowCancel
    if (-not $account) { return }
    $accountName = ([string]$account.Name).Trim()
    $hostAlias = ([string]$account.HostAlias).Trim()
    $githubUser = ([string]$account.GitHubUser).Trim()
    Write-Host "Account: $accountName [$githubUser]" -ForegroundColor Yellow
    Write-Host "This removes the profile from GitManager, its SSH Host alias, and repository mappings."
    Write-Host "The repository folders and GitHub account itself will NOT be deleted."
    Write-Host "SSH key files are a separate choice."
    Write-Host "Database: $GitManagerAccountsFile"
    $confirm = Read-Host "Type DELETE $accountName to continue"
    if ($confirm -cne "DELETE $accountName") {
        Write-WarningMsg "Deletion cancelled."
        Pause-Menu
        return
    }
    try {
        $before = @(Get-GitManagerAccounts)
        $remaining = @($before | Where-Object {
            $sameName = $accountName -and [string]::Equals(([string]$_.Name).Trim(), $accountName, [System.StringComparison]::OrdinalIgnoreCase)
            $sameAlias = $hostAlias -and [string]::Equals(([string]$_.HostAlias).Trim(), $hostAlias, [System.StringComparison]::OrdinalIgnoreCase)
            $sameUser = $githubUser -and [string]::Equals(([string]$_.GitHubUser).Trim(), $githubUser, [System.StringComparison]::OrdinalIgnoreCase)
            -not ($sameName -or $sameAlias -or $sameUser)
        })
        Save-GitManagerAccounts -Accounts $remaining
        $saved = @(Get-GitManagerAccounts)
        $stillExists = @($saved | Where-Object {
            ($accountName -and [string]::Equals(([string]$_.Name).Trim(), $accountName, [System.StringComparison]::OrdinalIgnoreCase)) -or
            ($hostAlias -and [string]::Equals(([string]$_.HostAlias).Trim(), $hostAlias, [System.StringComparison]::OrdinalIgnoreCase)) -or
            ($githubUser -and [string]::Equals(([string]$_.GitHubUser).Trim(), $githubUser, [System.StringComparison]::OrdinalIgnoreCase))
        })
        if ($stillExists.Count -gt 0) {
            throw "Verification failed: the account still exists in $GitManagerAccountsFile"
        }
    }
    catch {
        Write-ErrorMsg "Account deletion failed: $($_.Exception.Message)"
        Write-Host "Database path: $GitManagerAccountsFile" -ForegroundColor Yellow
        Pause-Menu
        return
    }
    $configPath = Join-Path (Join-Path $env:USERPROFILE ".ssh") "config"
    if ($hostAlias -and (Test-Path -LiteralPath $configPath)) {
        try {
            $config = Get-Content -Raw -LiteralPath $configPath -ErrorAction Stop
            $alias = [regex]::Escape($hostAlias)
            $pattern = "(?ms)^\s*Host\s+$alias\s*(?:\r?\n).*?(?=^\s*Host\s+|\z)"
            $updated = [regex]::Replace([string]$config, $pattern, "")
            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText($configPath, $updated.Trim() + "`r`n", $utf8NoBom)
        } catch {
            Write-WarningMsg "Profile removed, but SSH config cleanup failed: $($_.Exception.Message)"
        }
    }
    foreach ($repo in @(Get-GitManagerRepositories)) {
        if ([string]::IsNullOrWhiteSpace([string]$repo.Path)) { continue }
        if (-not (Test-Path -LiteralPath ([string]$repo.Path) -PathType Container)) { continue }
        Push-Location -LiteralPath ([string]$repo.Path)
        try {
            $mapped = & git config --local --get gitmanager.account 2>$null
            if ($LASTEXITCODE -eq 0 -and [string]::Equals(([string]$mapped).Trim(), $accountName, [System.StringComparison]::OrdinalIgnoreCase)) {
                & git config --local --unset gitmanager.account 2>$null
            }
        } finally { Pop-Location }
    }
    $deleteKey = Read-Host "Also permanently delete this profile's SSH private/public key files? Type YES to delete"
    if ($deleteKey -ceq "YES") {
        $key = [string]$account.SSHKey
        if (-not [string]::IsNullOrWhiteSpace($key)) {
            $key = $key.Replace("~", $env:USERPROFILE)
            foreach ($path in @($key, "$key.pub")) {
                if (Test-Path -LiteralPath $path -PathType Leaf) {
                    try { Remove-Item -LiteralPath $path -Force -ErrorAction Stop; Write-Success "Deleted key file: $path" }
                    catch { Write-WarningMsg "Could not delete key file: $path — $($_.Exception.Message)" }
                }
            }
        }
    } else {
        Write-WarningMsg "SSH key files were kept."
    }
    Write-Success "Account '$accountName' was removed and verified absent from the account database."
    Write-Host "Database: $GitManagerAccountsFile"
    Write-Host "Note: revoke the corresponding SSH key in GitHub Settings -> SSH and GPG keys if it must no longer authenticate."
    Pause-Menu
}

function Troubleshoot-GitHubAccount {
    Write-Title "GITHUB ACCOUNT TROUBLESHOOTER"
    $account = Select-GitHubAccount -AllowCancel
    if (-not $account) { return }
    $issues = New-Object System.Collections.Generic.List[string]
    $passed = 0
    Write-Host "Account: $($account.Name) [$($account.GitHubUser)]" -ForegroundColor Cyan
    Write-Host ""
    if ($null -eq (Get-Command ssh -ErrorAction SilentlyContinue)) {
        Write-ErrorMsg "[FAIL] OpenSSH client (ssh.exe) is not available in PATH."
        $issues.Add("Install/enable Windows OpenSSH Client or add ssh.exe to PATH.")
    } else { Write-Success "[ OK ] ssh.exe is available."; $passed++ }
    if (Test-SSHKeyExists $account) {
        Write-Success "[ OK ] Private key exists: $($account.SSHKey)"; $passed++
    } else {
        Write-ErrorMsg "[FAIL] Private key is missing: $($account.SSHKey)"
        $issues.Add("Create or restore the private key, then update the SSHKey path in Account Manager.")
    }
    $pubPath = "$($account.SSHKey).pub"
    if (Test-Path -LiteralPath $pubPath) { Write-Success "[ OK ] Public key exists: $pubPath"; $passed++ }
    else { Write-WarningMsg "[WARN] Public key file is missing: $pubPath"; $issues.Add("If the key is registered on GitHub, a local .pub file is optional; otherwise generate/display the public key and add it to GitHub.") }
    $sshConfig = Join-Path (Join-Path $env:USERPROFILE ".ssh") "config"
    if (Test-Path -LiteralPath $sshConfig) {
        $cfg = Get-Content -Raw -LiteralPath $sshConfig
        if ($cfg -match ("(?m)^\s*Host\s+" + [regex]::Escape([string]$account.HostAlias) + "\s*$")) {
            Write-Success "[ OK ] SSH config contains alias '$($account.HostAlias)'."; $passed++
        } else {
            Write-ErrorMsg "[FAIL] SSH config alias '$($account.HostAlias)' is missing."
            $issues.Add("Re-select/assign this account or use Account Manager to regenerate its SSH config block.")
        }
    } else { Write-ErrorMsg "[FAIL] SSH config file is missing: $sshConfig"; $issues.Add("Create the SSH config by assigning the account to a repository or saving the account again.") }
    Write-Host ""
    Write-Info "Testing SSH authentication (may take up to 10 seconds)..."
    if ((Get-Command ssh -ErrorAction SilentlyContinue) -and (Test-SSHKeyExists $account)) {
        $sshOutput = (& ssh -v -o BatchMode=yes -o ConnectTimeout=10 -T "git@$($account.HostAlias)" 2>&1 | Out-String)
        if ($sshOutput -match "successfully authenticated|You've successfully authenticated|Hi\s+$([regex]::Escape([string]$account.GitHubUser))") {
            Write-Success "[ OK ] GitHub SSH authentication succeeded for $($account.GitHubUser)."; $passed++
        } else {
            Write-ErrorMsg "[FAIL] SSH authentication was not confirmed. Relevant output:"
            ($sshOutput -split "`r?`n" | Where-Object { $_ -match "identity file|Offering public key|Permission denied|Could not resolve|Connection timed out|Connection refused|Host key verification failed|No such file|Authentications that can continue|connect to host|Welcome" } | Select-Object -Last 12) | ForEach-Object { Write-Host "  $_" }
            if ($sshOutput -match "Permission denied \(publickey\)") { $issues.Add("GitHub rejected the key: add the matching public key to the correct GitHub account and verify the configured private key.") }
            elseif ($sshOutput -match "Could not resolve hostname|Could not resolve") { $issues.Add("DNS/network problem: verify internet access, DNS, VPN/proxy, and the SSH HostName setting.") }
            elseif ($sshOutput -match "timed out|Connection refused|connect to host") { $issues.Add("SSH network access may be blocked. Check firewall/VPN and whether outbound TCP port 22 is allowed; consider GitHub SSH over port 443 if appropriate.") }
            elseif ($sshOutput -match "Host key verification failed") { $issues.Add("SSH host-key verification failed. Verify the host identity before carefully updating the stale known_hosts entry.") }
            else { $issues.Add("Review the verbose SSH output above. Confirm alias, key path, key permissions, and that the public key is registered with the intended GitHub account.") }
        }
    }
    Write-Host ""
    if (Find-GitRepository) {
        $remote = Get-RemoteURL
        if ($remote) {
            Write-Host "Current repository remote: $remote"
            $mapped = & git config --local --get gitmanager.account 2>$null
            if ($LASTEXITCODE -eq 0 -and ([string]$mapped).Trim() -ne [string]$account.Name) {
                Write-WarningMsg "[WARN] Current repository is mapped to '$(([string]$mapped).Trim())', not '$($account.Name)'."
                $issues.Add("Use Account Manager -> Assign current repository to account to align the repository with the intended profile.")
            } else { Write-Success "[ OK ] Current repository account mapping is compatible."; $passed++ }
            Write-Info "Checking remote repository access (git ls-remote)..."
            $remoteOutput = & git ls-remote $remote HEAD 2>&1 | Out-String
            if ($LASTEXITCODE -eq 0) { Write-Success "[ OK ] Remote repository is reachable with the current Git configuration."; $passed++ }
            else {
                Write-ErrorMsg "[FAIL] Remote access check failed: $($remoteOutput.Trim())"
                if ($remoteOutput -match "Repository not found|repository .* not found") { $issues.Add("Repository URL may be wrong, the repository may have been deleted, or this GitHub user lacks access.") }
                elseif ($remoteOutput -match "Permission denied \(publickey\)") { $issues.Add("Remote uses SSH but authentication failed. Assign the correct account and verify its key is registered on GitHub.") }
                elseif ($remoteOutput -match "Authentication failed|could not read Username") { $issues.Add("Remote may use HTTPS and credentials are missing/invalid. Check Git Credential Manager or switch the remote to the intended SSH alias.") }
                else { $issues.Add("Check the remote URL, network connection, repository permissions, and Git's credential/SSH configuration.") }
            }
        } else { Write-WarningMsg "[WARN] No origin remote found in the current repository."; $issues.Add("Add or correct the repository remote URL (origin).") }
    } else {
        Write-Info "No repository detected in the current directory; repository-specific tests were skipped."
    }
    Write-Host ""
    Write-Host "================ DIAGNOSIS SUMMARY ================" -ForegroundColor Cyan
    Write-Host "Checks passed: $passed"
    if ($issues.Count -eq 0) {
        Write-Success "No obvious account/connection issue was detected by these checks."
        Write-Host "If the application still cannot connect, inspect the exact error from Git or the application using the account."
    } else {
        for ($i = 0; $i -lt $issues.Count; $i++) {
            Write-Host ("{0}. {1}" -f ($i + 1), $issues[$i]) -ForegroundColor Yellow
        }
    }
    Write-Host "==================================================="
    Pause-Menu
}

function Manage-GitHubAccounts {
    while ($true) {
        Write-Title "GITHUB ACCOUNT MANAGER"
        $accounts = @(Get-GitManagerAccounts)
        if ($accounts.Count -eq 0) {
            Write-WarningMsg "No accounts configured."
        } else {
            Write-Host "Configured accounts:"
            foreach ($a in $accounts) {
                $keyState = if (Test-SSHKeyExists $a) { "KEY OK" } else { "KEY MISSING" }
                Write-Host "  $($a.Name) | GitHub: $($a.GitHubUser) | Alias: $($a.HostAlias) | $keyState"
            }
        }
        Write-Host ""
        Write-Host "1. Add / Edit account"
        Write-Host "2. Test account SSH"
        Write-Host "3. Show public key"
        Write-Host "4. Assign current repository to account"
        Write-Host "5. Re-detect current repository account"
        Write-Host "6. Delete account and its configuration"
        Write-Host "7. Troubleshoot account / connection"
        Write-Host "8. Return"
        Write-Host ""
        $choice = Read-Host "Select an option"
        switch ($choice) {
            "1" { Add-OrUpdateAccount }
            "2" {
                $a = Select-GitHubAccount -AllowCancel
                if ($a) {
                    Test-GitHubAccountSSH $a | Out-Null
                    Pause-Menu
                }
            }
            "3" {
                $a = Select-GitHubAccount -AllowCancel
                if ($a) {
                    Show-AccountPublicKey $a
                    Pause-Menu
                }
            }
            "4" {
                if (-not (Require-Repository)) { continue }
                $a = Select-GitHubAccount -AllowCancel
                if ($a) {
                    if (Ensure-AccountSSH $a) {
                        Set-RepositoryGitIdentity $a | Out-Null
                        $remote = Get-RemoteURL
                        $desired = Convert-ToAccountRemote $remote $a
                        if ($desired -and $desired -ne $remote) {
                            Invoke-Git @("remote","set-url","origin",$desired) | Out-Null
                        }
                        Save-RepositoryAccount -AccountName $a.Name
                        Write-Success "Current repository is now assigned to '$($a.Name)'."
                    }
                    Pause-Menu
                }
            }
            "5" {
                if (Require-Repository) {
                    $a = Resolve-RepositoryAccount
                    if ($a) {
                        Write-Success "Detected account: $($a.Name) [$($a.GitHubUser)]"
                    } else {
                        Write-WarningMsg "Could not auto-detect an account."
                    }
                    Pause-Menu
                }
            }
            "6" { Remove-GitHubAccount }
            "7" { Troubleshoot-GitHubAccount }
            "8" { return }
            default {
                Write-ErrorMsg "Invalid option."
                Start-Sleep -Milliseconds 700
            }
        }
    }
}

# ------------------------------------------------------------
# Folder Compare & Sync
# ------------------------------------------------------------
function Get-FolderFileHash {
    param([string]$FilePath)
    try {
        $hash = Get-FileHash -LiteralPath $FilePath -Algorithm MD5 -ErrorAction Stop
        return $hash.Hash
    } catch {
        return $null
    }
}

function Compare-Folders {
    Write-Title "FOLDER COMPARISON (Read-Only)"
    Write-Info "This tool compares two folders without modifying any files."
    Write-Host ""
    $folder1 = Read-Host "Path to FIRST folder"
    if ([string]::IsNullOrWhiteSpace($folder1)) { return }
    $folder2 = Read-Host "Path to SECOND folder"
    if ([string]::IsNullOrWhiteSpace($folder2)) { return }

    $folder1 = $folder1.Trim().Trim('"')
    $folder2 = $folder2.Trim().Trim('"')

    if (-not (Test-Path -LiteralPath $folder1 -PathType Container)) {
        Write-ErrorMsg "First folder not found: $folder1"
        Pause-Menu; return
    }
    if (-not (Test-Path -LiteralPath $folder2 -PathType Container)) {
        Write-ErrorMsg "Second folder not found: $folder2"
        Pause-Menu; return
    }

    Write-Host ""
    Write-Info "Scanning folders (this may take a moment for large folders)..."

    $files1 = @{}
    Get-ChildItem -LiteralPath $folder1 -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($folder1.Length).TrimStart([char[]]@('\','/'))
        $files1[$rel] = $_.FullName
    }
    $files2 = @{}
    Get-ChildItem -LiteralPath $folder2 -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($folder2.Length).TrimStart([char[]]@('\','/'))
        $files2[$rel] = $_.FullName
    }

    $onlyIn1 = @()
    $onlyIn2 = @()
    $identical = @()
    $different = @()
    $total = 0

    foreach ($rel in $files1.Keys) {
        $total++
        if (-not $files2.ContainsKey($rel)) {
            $onlyIn1 += $rel
        } else {
            $h1 = Get-FolderFileHash $files1[$rel]
            $h2 = Get-FolderFileHash $files2[$rel]
            if ($h1 -and $h2 -and $h1 -eq $h2) { $identical += $rel }
            else { $different += $rel }
        }
    }
    foreach ($rel in $files2.Keys) {
        if (-not $files1.ContainsKey($rel)) { $onlyIn2 += $rel }
    }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "                    COMPARISON REPORT" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Folder 1 : $folder1" -ForegroundColor DarkGray
    Write-Host "Folder 2 : $folder2" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Total files scanned  : $total (in folder 1)" -ForegroundColor White
    Write-Host "Only in Folder 1     : $($onlyIn1.Count)" -ForegroundColor Yellow
    Write-Host "Only in Folder 2     : $($onlyIn2.Count)" -ForegroundColor Yellow
    Write-Host "Identical (same hash): $($identical.Count)" -ForegroundColor Green
    Write-Host "Different content    : $($different.Count)" -ForegroundColor Red
    Write-Host ""

    if ($onlyIn1.Count -gt 0) {
        Write-Host "--- Only in Folder 1 ---" -ForegroundColor Yellow
        $onlyIn1 | ForEach-Object { Write-Host "  $_" }
        Write-Host ""
    }
    if ($onlyIn2.Count -gt 0) {
        Write-Host "--- Only in Folder 2 ---" -ForegroundColor Yellow
        $onlyIn2 | ForEach-Object { Write-Host "  $_" }
        Write-Host ""
    }
    if ($different.Count -gt 0) {
        Write-Host "--- Different Content ---" -ForegroundColor Red
        $different | ForEach-Object { Write-Host "  $_" }
        Write-Host ""
    }
    if ($identical.Count -gt 0 -and $identical.Count -le 50) {
        Write-Host "--- Identical Files ---" -ForegroundColor Green
        $identical | ForEach-Object { Write-Host "  $_" }
        Write-Host ""
    }

    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Success "Comparison complete. No files were modified."
    Pause-Menu
}

function Sync-FoldersOverwrite {
    Write-Title "FOLDER SYNC (Overwrite Matching Files)"
    Write-WarningMsg "This tool overwrites files in the DESTINATION folder with files from the SOURCE folder."
    Write-Host ""
    Write-Host "Modes:"
    Write-Host "  1. Overwrite ONLY files that are IDENTICAL in both folders (safe refresh)"
    Write-Host "  2. Overwrite ALL matching files regardless of content (force sync)"
    Write-Host "  3. Cancel"
    Write-Host ""
    $mode = Read-Host "Select mode [1/2/3]"
    if ($mode -eq "3" -or [string]::IsNullOrWhiteSpace($mode)) { return }

    $source = Read-Host "Path to SOURCE folder (files will be copied FROM here)"
    if ([string]::IsNullOrWhiteSpace($source)) { return }
    $dest = Read-Host "Path to DESTINATION folder (files will be overwritten HERE)"
    if ([string]::IsNullOrWhiteSpace($dest)) { return }

    $source = $source.Trim().Trim('"')
    $dest = $dest.Trim().Trim('"')

    if (-not (Test-Path -LiteralPath $source -PathType Container)) {
        Write-ErrorMsg "Source folder not found: $source"; Pause-Menu; return
    }
    if (-not (Test-Path -LiteralPath $dest -PathType Container)) {
        Write-ErrorMsg "Destination folder not found: $dest"; Pause-Menu; return
    }

    $confirm = Read-Host "Overwrite files in DESTINATION? Type YES to continue"
    if ($confirm -cne "YES") { Write-WarningMsg "Cancelled."; Pause-Menu; return }

    $sourceFiles = @{}
    Get-ChildItem -LiteralPath $source -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($source.Length).TrimStart([char[]]@('\','/'))
        $sourceFiles[$rel] = $_.FullName
    }

    $overwritten = 0
    $skipped = 0
    $errors = 0

    foreach ($rel in $sourceFiles.Keys) {
        $destFile = Join-Path $dest $rel
        if (-not (Test-Path -LiteralPath $destFile -PathType Leaf)) {
            $skipped++; continue
        }
        if ($mode -eq "1") {
            $h1 = Get-FolderFileHash $sourceFiles[$rel]
            $h2 = Get-FolderFileHash $destFile
            if (-not ($h1 -and $h2 -and $h1 -eq $h2)) { $skipped++; continue }
        }
        try {
            Copy-Item -LiteralPath $sourceFiles[$rel] -Destination $destFile -Force -ErrorAction Stop
            $overwritten++
            Write-Host "  [OK] $rel" -ForegroundColor Green
        } catch {
            $errors++
            Write-Host "  [FAIL] $rel : $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Success "Sync complete."
    Write-Host "Overwritten : $overwritten" -ForegroundColor Green
    Write-Host "Skipped     : $skipped" -ForegroundColor Yellow
    Write-Host "Errors      : $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "White" })
    Write-Host "============================================================" -ForegroundColor Cyan
    Pause-Menu
}

# ------------------------------------------------------------
# Delete Committed File
# ------------------------------------------------------------
function Remove-CommittedFile {
    if (-not (Require-Repository)) { return }
    Write-Title "DELETE COMMITTED FILE"
    Write-WarningMsg "This tool removes a file that has already been committed."
    Write-Host ""
    Write-Host "1. Remove from working tree & next commit (safe, keeps history)"
    Write-Host "2. Remove from ENTIRE Git history (destructive, rewrites commits)"
    Write-Host "3. Cancel"
    Write-Host ""
    $mode = Read-Host "Select mode [1/2/3]"
    if ($mode -eq "3" -or [string]::IsNullOrWhiteSpace($mode)) { return }

    $filePath = Read-Host "Relative path of the file to delete (e.g. src/secret.txt)"
    if ([string]::IsNullOrWhiteSpace($filePath)) { return }
    $filePath = $filePath.Trim().Trim('"')

    if (-not (Test-Path -LiteralPath (Join-Path (Get-GitRoot) $filePath))) {
        Write-WarningMsg "File does not exist in working tree. It may only exist in history."
    }

    if ($mode -eq "1") {
        $code = Invoke-Git @("rm", "-f", "--", $filePath)
        if ($code -eq 0) {
            Write-Success "File '$filePath' has been removed and staged for deletion."
            Write-Host "Commit the change to finalize the deletion."
        } else {
            Write-ErrorMsg "git rm failed."
        }
        Pause-Menu; return
    }

    Write-Host ""
    Write-ErrorMsg "WARNING: This will REWRITE commit history!"
    Write-Host "All commits that touched '$filePath' will be rewritten."
    Write-Host "After this, you MUST force-push to update the remote."
    Write-Host "Other collaborators will need to re-clone."
    Write-Host ""
    $confirm = Read-Host "Type PURGE to continue"
    if ($confirm -cne "PURGE") { Write-WarningMsg "Cancelled."; Pause-Menu; return }

    $filterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue
    if ($filterRepo) {
        Write-Info "Using git-filter-repo..."
        $code = Invoke-Git @("filter-repo", "--path", $filePath, "--force")
    } else {
        Write-Info "git-filter-repo not found. Falling back to git filter-branch..."
        $env:FILTER_BRANCH_SQUELCH_WARNING = "1"
        $code = Invoke-Git @("filter-branch", "--force", "--index-filter",
            "git rm --cached --ignore-unmatch `"$filePath`"",
            "--prune-empty", "--tag-name-filter", "cat", "--", "--all")
    }

    if ($code -eq 0) {
        Write-Success "File purged from history."
        Write-Host ""
        Write-WarningMsg "Next steps:"
        Write-Host "  1. Run: git reflog expire --expire=now --all"
        Write-Host "  2. Run: git gc --prune=now --aggressive"
        Write-Host "  3. Force push: git push --force --all"
        Write-Host "  4. Force push tags: git push --force --tags"
        Write-Host "  5. Tell collaborators to re-clone."
    } else {
        Write-ErrorMsg "History rewrite failed."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Branch Manager
# ------------------------------------------------------------
function Manage-Branches {
    if (-not (Require-Repository)) { return }
    while ($true) {
        Write-Title "BRANCH MANAGER"
        Write-Info "Current branch: $(Get-CurrentBranch)"
        Write-Host ""
        Write-Host "Local branches:" -ForegroundColor Cyan
        git branch --list --format="  %(refname:short)%(if)%(upstream)%(then) -> %(upstream:short)%(end)" 2>$null
        Write-Host ""
        Write-Host "1. Create new branch"
        Write-Host "2. Switch branch"
        Write-Host "3. Delete local branch"
        Write-Host "4. Rename current branch"
        Write-Host "5. Return"
        Write-Host ""
        $choice = Read-Host "Select"
        switch ($choice) {
            "1" {
                $name = Read-Host "New branch name"
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $code = Invoke-Git @("checkout", "-b", $name)
                if ($code -eq 0) { Write-Success "Created and switched to '$name'." }
                Pause-Menu
            }
            "2" {
                $name = Read-Host "Branch to switch to"
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $code = Invoke-Git @("checkout", $name)
                if ($code -eq 0) { Write-Success "Switched to '$name'." }
                Pause-Menu
            }
            "3" {
                $name = Read-Host "Branch to delete"
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $force = Read-Host "Force delete (discard unmerged)? (Y/N)"
                $flag = if ($force -match "^(Y|y)$") { "-D" } else { "-d" }
                $code = Invoke-Git @("branch", $flag, $name)
                if ($code -eq 0) { Write-Success "Branch '$name' deleted." }
                Pause-Menu
            }
            "4" {
                $new = Read-Host "New name for current branch"
                if ([string]::IsNullOrWhiteSpace($new)) { continue }
                $code = Invoke-Git @("branch", "-m", $new)
                if ($code -eq 0) { Write-Success "Branch renamed to '$new'." }
                Pause-Menu
            }
            "5" { return }
            default { Write-ErrorMsg "Invalid option." }
        }
    }
}

# ------------------------------------------------------------
# Stash Manager
# ------------------------------------------------------------
function Manage-Stash {
    if (-not (Require-Repository)) { return }
    while ($true) {
        Write-Title "STASH MANAGER"
        Write-Host "Current stash list:" -ForegroundColor Cyan
        git stash list 2>$null
        Write-Host ""
        Write-Host "1. Stash current changes"
        Write-Host "2. Apply latest stash (keep in list)"
        Write-Host "3. Pop latest stash (remove from list)"
        Write-Host "4. Drop a specific stash"
        Write-Host "5. Clear all stashes"
        Write-Host "6. Return"
        Write-Host ""
        $choice = Read-Host "Select"
        switch ($choice) {
            "1" {
                $msg = Read-Host "Stash message (ENTER = auto)"
                if ([string]::IsNullOrWhiteSpace($msg)) { $code = Invoke-Git @("stash","push") }
                else { $code = Invoke-Git @("stash","push","-m",$msg) }
                if ($code -eq 0) { Write-Success "Changes stashed." }
                Pause-Menu
            }
            "2" { $code = Invoke-Git @("stash","apply"); if ($code -eq 0) { Write-Success "Stash applied." }; Pause-Menu }
            "3" { $code = Invoke-Git @("stash","pop"); if ($code -eq 0) { Write-Success "Stash popped." }; Pause-Menu }
            "4" {
                $idx = Read-Host "Stash index to drop (e.g. stash@{0})"
                if ([string]::IsNullOrWhiteSpace($idx)) { continue }
                $code = Invoke-Git @("stash","drop",$idx)
                if ($code -eq 0) { Write-Success "Dropped $idx." }
                Pause-Menu
            }
            "5" {
                $c = Read-Host "Delete ALL stashes? (YES/NO)"
                if ($c -eq "YES") { Invoke-Git @("stash","clear") | Out-Null; Write-Success "All stashes cleared." }
                Pause-Menu
            }
            "6" { return }
            default { Write-ErrorMsg "Invalid option." }
        }
    }
}

# ------------------------------------------------------------
# Tag Manager
# ------------------------------------------------------------
function Manage-Tags {
    if (-not (Require-Repository)) { return }
    while ($true) {
        Write-Title "TAG MANAGER"
        Write-Host "Tags:" -ForegroundColor Cyan
        git tag -l --sort=-v:refname 2>$null
        Write-Host ""
        Write-Host "1. Create tag on HEAD"
        Write-Host "2. Create tag on specific commit"
        Write-Host "3. Delete local tag"
        Write-Host "4. Push all tags to origin"
        Write-Host "5. Return"
        Write-Host ""
        $choice = Read-Host "Select"
        switch ($choice) {
            "1" {
                $name = Read-Host "Tag name (e.g. v1.0.0)"
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $msg = Read-Host "Tag message (ENTER = lightweight tag)"
                if ([string]::IsNullOrWhiteSpace($msg)) { $code = Invoke-Git @("tag",$name) }
                else { $code = Invoke-Git @("tag","-a",$name,"-m",$msg) }
                if ($code -eq 0) { Write-Success "Tag '$name' created." }
                Pause-Menu
            }
            "2" {
                $commit = Read-Host "Commit hash"
                $name = Read-Host "Tag name"
                if ([string]::IsNullOrWhiteSpace($commit) -or [string]::IsNullOrWhiteSpace($name)) { continue }
                $code = Invoke-Git @("tag",$name,$commit)
                if ($code -eq 0) { Write-Success "Tag '$name' created on $commit." }
                Pause-Menu
            }
            "3" {
                $name = Read-Host "Tag to delete"
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $code = Invoke-Git @("tag","-d",$name)
                if ($code -eq 0) { Write-Success "Tag '$name' deleted locally." }
                Pause-Menu
            }
            "4" {
                $code = Invoke-Git @("push","origin","--tags")
                if ($code -eq 0) { Write-Success "Tags pushed to origin." }
                Pause-Menu
            }
            "5" { return }
            default { Write-ErrorMsg "Invalid option." }
        }
    }
}

# ------------------------------------------------------------
# Undo Last Commit
# ------------------------------------------------------------
function Undo-LastCommit {
    if (-not (Require-Repository)) { return }
    Write-Title "UNDO LAST COMMIT"
    Write-Host "Last commit:" -ForegroundColor Cyan
    git log -1 --stat 2>$null
    Write-Host ""
    Write-Host "1. Soft undo (keep changes staged)"
    Write-Host "2. Mixed undo (keep changes unstaged) [default]"
    Write-Host "3. Hard undo (DISCARD all changes - dangerous!)"
    Write-Host "4. Cancel"
    Write-Host ""
    $mode = Read-Host "Select [1/2/3/4]"
    switch ($mode) {
        "1" { $code = Invoke-Git @("reset","--soft","HEAD~1"); if ($code -eq 0) { Write-Success "Last commit undone. Changes are staged." } }
        "2" { $code = Invoke-Git @("reset","HEAD~1"); if ($code -eq 0) { Write-Success "Last commit undone. Changes are unstaged." } }
        "3" {
            $c = Read-Host "This will PERMANENTLY DISCARD changes. Type DANGER to continue"
            if ($c -eq "DANGER") {
                $code = Invoke-Git @("reset","--hard","HEAD~1")
                if ($code -eq 0) { Write-Success "Last commit and its changes were discarded." }
            } else { Write-WarningMsg "Cancelled." }
        }
        default { Write-WarningMsg "Cancelled." }
    }
    Pause-Menu
}

# ------------------------------------------------------------
# .gitignore Manager
# ------------------------------------------------------------
function Manage-Gitignore {
    if (-not (Require-Repository)) { return }
    Write-Title ".GITIGNORE MANAGER"
    $root = Get-GitRoot
    $gi = Join-Path $root ".gitignore"
    if (Test-Path $gi) {
        Write-Host "Current .gitignore:" -ForegroundColor Cyan
        Get-Content $gi
    } else {
        Write-WarningMsg "No .gitignore file exists yet."
    }
    Write-Host ""
    Write-Host "1. Add a pattern"
    Write-Host "2. Remove a pattern"
    Write-Host "3. Add common templates (node_modules, .env, bin/obj, etc.)"
    Write-Host "4. Return"
    Write-Host ""
    $choice = Read-Host "Select"
    switch ($choice) {
        "1" {
            $p = Read-Host "Pattern to add (e.g. *.log, build/, .env)"
            if ([string]::IsNullOrWhiteSpace($p)) { return }
            Add-Content -Path $gi -Value "`n$p" -Encoding UTF8
            Write-Success "Added '$p' to .gitignore."
            Pause-Menu
        }
        "2" {
            $p = Read-Host "Pattern to remove"
            if ([string]::IsNullOrWhiteSpace($p) -or -not (Test-Path $gi)) { return }
            $lines = @(Get-Content $gi | Where-Object { $_ -ne $p })
            $lines | Set-Content $gi -Encoding UTF8
            Write-Success "Removed '$p'."
            Pause-Menu
        }
        "3" {
            $tpl = @"

# Common ignores
node_modules/
dist/
build/
bin/
obj/
*.log
.env
.env.local
.vs/
.idea/
*.user
Thumbs.db
.DS_Store
"@
            Add-Content -Path $gi -Value $tpl -Encoding UTF8
            Write-Success "Common template appended."
            Pause-Menu
        }
        "4" { return }
    }
}

# ------------------------------------------------------------
# History Search
# ------------------------------------------------------------
function Search-History {
    if (-not (Require-Repository)) { return }
    Write-Title "SEARCH COMMIT HISTORY"
    Write-Host "1. By commit message"
    Write-Host "2. By author"
    Write-Host "3. By file path"
    Write-Host "4. After a date"
    Write-Host "5. Return"
    Write-Host ""
    $mode = Read-Host "Select"
    switch ($mode) {
        "1" {
            $q = Read-Host "Search message for"
            if ([string]::IsNullOrWhiteSpace($q)) { return }
            git log --all --oneline --grep=$q -30
            Pause-Menu
        }
        "2" {
            $q = Read-Host "Author name/email"
            if ([string]::IsNullOrWhiteSpace($q)) { return }
            git log --all --oneline --author=$q -30
            Pause-Menu
        }
        "3" {
            $q = Read-Host "File path"
            if ([string]::IsNullOrWhiteSpace($q)) { return }
            git log --all --oneline --follow -- $q -30
            Pause-Menu
        }
        "4" {
            $q = Read-Host "Date (YYYY-MM-DD)"
            if ([string]::IsNullOrWhiteSpace($q)) { return }
            git log --all --oneline --after=$q -30
            Pause-Menu
        }
        "5" { return }
    }
}

# ------------------------------------------------------------
# Remote Manager
# ------------------------------------------------------------
function Manage-Remotes {
    if (-not (Require-Repository)) { return }
    while ($true) {
        Write-Title "REMOTE MANAGER"
        Write-Host "Current remotes:" -ForegroundColor Cyan
        git remote -v 2>$null
        Write-Host ""
        Write-Host "1. Add remote"
        Write-Host "2. Remove remote"
        Write-Host "3. Change remote URL"
        Write-Host "4. Return"
        Write-Host ""
        $choice = Read-Host "Select"
        switch ($choice) {
            "1" {
                $name = Read-Host "Remote name"
                $url  = Read-Host "Remote URL"
                if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($url)) { continue }
                $code = Invoke-Git @("remote","add",$name,$url)
                if ($code -eq 0) { Write-Success "Remote '$name' added." }
                Pause-Menu
            }
            "2" {
                $name = Read-Host "Remote name to remove"
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $code = Invoke-Git @("remote","remove",$name)
                if ($code -eq 0) { Write-Success "Remote '$name' removed." }
                Pause-Menu
            }
            "3" {
                $name = Read-Host "Remote name"
                $url  = Read-Host "New URL"
                if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($url)) { continue }
                $code = Invoke-Git @("remote","set-url",$name,$url)
                if ($code -eq 0) { Write-Success "Remote '$name' URL updated." }
                Pause-Menu
            }
            "4" { return }
            default { Write-ErrorMsg "Invalid option." }
        }
    }
}

# ------------------------------------------------------------
# Status
# ------------------------------------------------------------
function Show-Status {
    if (-not (Require-Repository)) { return }
    Write-Title "REPOSITORY STATUS"
    Show-RepositoryInfo
    git status
    if (Test-Conflict) {
        Write-Host ""
        Write-ErrorMsg "WARNING: Repository contains merge conflicts."
        Show-ConflictFiles
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Pull
# ------------------------------------------------------------
function Git-Pull {
    if (-not (Require-Repository)) { return }
    $account = Ensure-RepositoryAccount -Interactive
    if (-not $account) { Pause-Menu; return }
    Write-Title "GIT PULL"
    Show-RepositoryInfo
    if (Test-Conflict) {
        Write-ErrorMsg "Cannot pull while conflicts exist."
        Show-ConflictFiles
        Pause-Menu
        return
    }
    if (Test-WorkingTreeDirty) {
        Write-ErrorMsg "Pull stopped because the working tree has uncommitted changes."
        Write-Host "Commit or stash your changes first."
        Show-StatusSummary
        Pause-Menu
        return
    }
    if (-not (Get-Upstream)) {
        Write-ErrorMsg "This branch has no upstream branch."
        Write-Host "Use Full Sync (option 6), or push the branch with an upstream first."
        Pause-Menu
        return
    }
    Write-Info "Fetching and rebasing local work onto the latest remote..."
    Write-Host ""
    $code = Invoke-Git @("pull", "--rebase", "--autostash")
    if ($code -eq 0) {
        Write-Host ""
        Write-Success "Pull completed successfully."
    } else {
        Write-Host ""
        Write-ErrorMsg "Pull failed."
        if (Test-Conflict) { Show-ConflictFiles }
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Add
# ------------------------------------------------------------
function Git-Add {
    if (-not (Require-Repository)) { return }
    Write-Title "GIT ADD"
    Show-StatusSummary
    $answer = Read-Host "Add ALL changes (including deletions)? (Y/N)"
    if ($answer -notmatch "^(Y|y)$") {
        Write-WarningMsg "Operation cancelled."
        Pause-Menu
        return
    }
    $code = Invoke-Git @("add", "-A")
    if ($code -eq 0) {
        Write-Success "All changes have been staged."
        Write-Host ""
        git diff --cached --stat
    } else {
        Write-ErrorMsg "Git add failed."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Commit
# ------------------------------------------------------------
function Git-Commit {
    if (-not (Require-Repository)) { return }
    Write-Title "GIT COMMIT"
    if (Test-Conflict) {
        Write-ErrorMsg "Cannot commit while unresolved conflicts exist."
        Show-ConflictFiles
        Pause-Menu
        return
    }
    if (-not (Test-StagedChanges)) {
        Write-WarningMsg "There are no staged changes to commit."
        Write-Host "Use option 3 (Add changes) first."
        Pause-Menu
        return
    }

    $largeFileDecision = Select-LargeFilesForCommit
    if ($largeFileDecision -is [pscustomobject] -and $largeFileDecision.PSObject.Properties["Cancel"] -and $largeFileDecision.Cancel) {
        Write-WarningMsg "Commit cancelled. No commit was created."
        Pause-Menu
        return
    }
    $excludedLargeFiles = @($largeFileDecision)
    if ($excludedLargeFiles.Count -gt 0) {
        Write-Info "Unstaging large files you did not approve:"
        foreach ($largePath in $excludedLargeFiles) { Write-Host "  - $largePath" }
        $resetArgs = @("reset", "-q", "--") + $excludedLargeFiles
        $resetCode = Invoke-Git -Arguments $resetArgs -Quiet
        if ($resetCode -ne 0) {
            Write-ErrorMsg "Could not unstage excluded large files. Commit cancelled."
            Pause-Menu
            return
        }
    }
    if (-not (Test-StagedChanges)) {
        Write-WarningMsg "No files remain staged for commit. No commit was created."
        Pause-Menu
        return
    }
    git diff --cached --stat
    Write-Host ""
    $message = Read-Host "Commit message"
    if ([string]::IsNullOrWhiteSpace($message)) {
        Write-ErrorMsg "Commit message cannot be empty."
        Pause-Menu
        return
    }
    $code = Invoke-Git @("commit", "-m", $message)
    if ($code -eq 0) {
        Write-Success "Commit created successfully."
    } else {
        Write-ErrorMsg "Commit failed."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Push
# ------------------------------------------------------------
function Git-Push {
    if (-not (Require-Repository)) { return }
    $account = Ensure-RepositoryAccount -Interactive
    if (-not $account) { Pause-Menu; return }
    Write-Title "GIT PUSH"
    Show-RepositoryInfo
    if (-not (Require-BranchForPush)) {
        Pause-Menu
        return
    }
    if (Test-Conflict) {
        Write-ErrorMsg "Cannot push while conflicts exist."
        Show-ConflictFiles
        return
    }
    if (Test-OperationInProgress) {
        Write-ErrorMsg "A Git operation is still in progress."
        Write-Host "Resolve/continue/abort that operation before pushing."
        Pause-Menu
        return
    }
    if (Test-WorkingTreeDirty) {
        Write-WarningMsg "Warning: there are uncommitted changes. Only committed changes will be pushed."
        Write-Host ""
    }
    $branch = Get-CurrentBranch
    $upstream = Get-Upstream
    $remote = Get-RemoteURL
    if (-not $remote) {
        Write-ErrorMsg "No 'origin' remote is configured."
        Pause-Menu
        return
    }
    Write-Info "Pushing branch '$branch'..."
    Write-Host ""
    if ($upstream) {
        $code = Invoke-Git @("push")
    } else {
        Write-WarningMsg "No upstream is configured. Setting origin/$branch as upstream..."
        $code = Invoke-Git @("push", "-u", "origin", $branch)
    }
    if ($code -eq 0) {
        Write-Host ""
        Write-Success "Push completed successfully."
    } else {
        Write-Host ""
        Write-ErrorMsg "Push failed."
        Write-Host ""
        Write-WarningMsg "If the remote contains newer commits, run Pull or Full Sync."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Diff
# ------------------------------------------------------------
function Git-Diff {
    if (-not (Require-Repository)) { return }
    Write-Title "GIT DIFF"
    if (Test-WorkingTreeDirty) {
        Write-Info "Unstaged changes:"
        git diff
        Write-Host ""
    }
    if (Test-StagedChanges) {
        Write-Info "Staged changes:"
        git diff --cached
    }
    if (-not (Test-WorkingTreeDirty) -and -not (Test-StagedChanges)) {
        Write-Success "No local changes."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# History
# ------------------------------------------------------------
function Git-History {
    if (-not (Require-Repository)) { return }
    Write-Title "GIT HISTORY"
    git log --oneline --decorate --graph --all -30
    Write-Host ""
    Pause-Menu
}


# ------------------------------------------------------------
# Large-file review before Full Sync commit/push
# ------------------------------------------------------------
function Get-LargeChangedFiles {
    param([long]$ThresholdBytes = 10485760) # 10 MiB

    $statusLines = @(git status --porcelain=v1 --untracked-files=all 2>$null)
    $result = @()
    foreach ($line in $statusLines) {
        if ([string]::IsNullOrWhiteSpace($line) -or $line.Length -lt 4) { continue }
        # Porcelain status uses two status characters followed by a space and path.
        $path = $line.Substring(3)
        if ($path -match ' -> ') { $path = ($path -split ' -> ')[-1] }
        $path = $path.Trim('"')
        if ([string]::IsNullOrWhiteSpace($path)) { continue }

        $fullPath = Join-Path (Get-Location).Path $path
        if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
            try {
                $file = Get-Item -LiteralPath $fullPath -ErrorAction Stop
                if ($file.Length -gt $ThresholdBytes) {
                    $result += [pscustomobject]@{
                        Path = $path
                        Bytes = [long]$file.Length
                        SizeMB = [math]::Round(($file.Length / 1000000), 2)
                    }
                }
            } catch {
                Write-WarningMsg "Could not inspect file size: $path"
            }
        }
    }
    return @($result | Sort-Object Path -Unique)
}

function Select-LargeFilesForCommit {
    # Returns paths that must be excluded from the next Full Sync commit.
    $largeFiles = @(Get-LargeChangedFiles)
    if ($largeFiles.Count -eq 0) { return @() }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Yellow
    Write-Host "        LARGE FILE REVIEW (larger than 10 MB)" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Yellow
    Write-Host "Review these changed files before they are committed/pushed:"
    Write-Host ""
    for ($i = 0; $i -lt $largeFiles.Count; $i++) {
        Write-Host (" {0,2}. [{1,8} MB] {2}" -f ($i + 1), $largeFiles[$i].SizeMB, $largeFiles[$i].Path) -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "A = include ALL listed large files"
    Write-Host "N = include NONE of the listed large files (other changes can still be committed/pushed)"
    Write-Host "C = cancel the entire Full Sync before staging/committing/pushing"
    Write-Host "Or enter file numbers separated by commas, e.g. 1,3"
    $answer = Read-Host "Choose files to include [A/N/C/numbers]"
    if ($answer -match '^(C|c)$') { return [pscustomobject]@{ Cancel = $true; Excluded = @() } }
    if ($answer -match '^(A|a)$') { return @() }
    if ([string]::IsNullOrWhiteSpace($answer) -or $answer -match '^(N|n)$') {
        return @($largeFiles | ForEach-Object { $_.Path })
    }

    $selectedIndexes = @()
    foreach ($part in ($answer -split '[,\s;]+')) {
        if ([string]::IsNullOrWhiteSpace($part)) { continue }
        $number = 0
        if (-not [int]::TryParse($part, [ref]$number) -or $number -lt 1 -or $number -gt $largeFiles.Count) {
            Write-ErrorMsg "Invalid selection. Full Sync cancelled; nothing was staged or committed."
            return [pscustomobject]@{ Cancel = $true; Excluded = @() }
        }
        if ($selectedIndexes -notcontains $number) { $selectedIndexes += $number }
    }
    if ($selectedIndexes.Count -eq 0) {
        return @($largeFiles | ForEach-Object { $_.Path })
    }
    $excluded = @()
    for ($i = 0; $i -lt $largeFiles.Count; $i++) {
        if ($selectedIndexes -notcontains ($i + 1)) { $excluded += $largeFiles[$i].Path }
    }
    return $excluded
}

# ------------------------------------------------------------
# Full Sync
# ------------------------------------------------------------
function Full-Sync {
    param(
        [ValidateSet("Full", "PullOnly", "PushOnly")]
        [string]$Mode = "Full"
    )
    if (-not (Require-Repository)) { return }
    $account = Ensure-RepositoryAccount -Interactive
    if (-not $account) { Pause-Menu; return }
    $title = switch ($Mode) {
        "PullOnly" { "FULL PULL (ADD + COMMIT + PULL; NO PUSH)" }
        "PushOnly" { "FULL PUSH (ADD + COMMIT + PUSH; NO PULL)" }
        default    { "FULL SYNC" }
    }
    Write-Title $title
    Show-RepositoryInfo
    if (-not (Require-BranchForPush)) {
        Pause-Menu
        return
    }
    if (Test-Conflict) {
        Write-ErrorMsg "Full Sync cannot start while unresolved conflicts exist."
        Show-ConflictFiles
        Pause-Menu
        return
    }
    if (Test-OperationInProgress) {
        Write-ErrorMsg "Another Git operation is already in progress."
        Write-Host "Resolve, continue, or abort it before starting Full Sync."
        Pause-Menu
        return
    }
    $branch = Get-CurrentBranch
    $remote = Get-RemoteURL
    if (-not $remote) {
        Write-ErrorMsg "No 'origin' remote is configured."
        Write-Host "Full Sync requires a remote named 'origin'."
        Pause-Menu
        return
    }
    if ($Mode -ne "PushOnly") {
        Write-Host "[1] Fetching latest remote information..." -ForegroundColor Yellow
        Write-Host ""
        $code = Invoke-Git @("fetch", "origin", "--prune")
        if ($code -ne 0) {
            Write-ErrorMsg "Fetch failed. Operation stopped before changing anything."
            Pause-Menu
            return
        }
        Write-Success "Fetch completed."
    } else {
        Write-Info "Push-only mode: fetch/pull will be skipped."
    }
    Write-Host ""
    Write-Host "[2/6] Reviewing large files before staging..." -ForegroundColor Yellow
    Write-Host ""
    $largeFileDecision = Select-LargeFilesForCommit
    if ($largeFileDecision -is [pscustomobject] -and $largeFileDecision.PSObject.Properties["Cancel"] -and $largeFileDecision.Cancel) {
        Write-WarningMsg "Full Sync cancelled. No files were staged, committed, or pushed by this operation."
        Pause-Menu
        return
    }
    $excludedLargeFiles = @($largeFileDecision)

    Write-Host ""
    Write-Host "Staging local changes..." -ForegroundColor Yellow
    Write-Host ""
    $code = Invoke-Git @("add", "-A")
    if ($code -ne 0) {
        Write-ErrorMsg "Git add failed."
        Pause-Menu
        return
    }
    if ($excludedLargeFiles.Count -gt 0) {
        Write-Info "Excluding unapproved large files from this commit:"
        foreach ($largePath in $excludedLargeFiles) { Write-Host "  - $largePath" }
        $resetArgs = @("reset", "-q", "--") + $excludedLargeFiles
        $resetCode = Invoke-Git -Arguments $resetArgs -Quiet
        if ($resetCode -ne 0) {
            Write-ErrorMsg "Could not unstage excluded large files. Stopping before commit/push."
            Pause-Menu
            return
        }
    }
    if (Test-StagedChanges) {
        Write-Success "Local changes staged."
        git diff --cached --name-status
    } else {
        Write-Info "No local changes to commit."
    }
    Write-Host ""
    Write-Host "[3/6] Committing local changes..." -ForegroundColor Yellow
    Write-Host ""
    if (Test-StagedChanges) {
        $message = Read-Host "Commit message (ENTER = Auto sync commit)"
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = "Sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            Write-Info "Using automatic commit message: $message"
        }
        $code = Invoke-Git @("commit", "-m", $message)
        if ($code -ne 0) {
            Write-ErrorMsg "Commit failed. Push/pull will not be attempted."
            Pause-Menu
            return
        }
        Write-Success "Local commit created."
    } else {
        Write-Info "Nothing to commit."
    }
    if ($Mode -ne "PushOnly") {
        Write-Host ""
        Write-Host "[4] Synchronizing with remote (pull/rebase)..." -ForegroundColor Yellow
        Write-Host ""
        $upstream = Get-Upstream
        if (-not $upstream) {
            $null = Set-UpstreamIfRemoteBranchExists -Branch $branch
            $upstream = Get-Upstream
        }
        if ($upstream) {
            $code = Invoke-Git @("pull", "--rebase")
            if ($code -ne 0) {
                Write-ErrorMsg "Pull/rebase failed."
                if (Test-Conflict) {
                    Write-ErrorMsg "CONFLICT DETECTED."
                    Show-ConflictFiles
                    Write-Host "Resolve the conflicts, then continue the rebase or abort it."
                }
                Pause-Menu
                return
            }
            Write-Success "Remote changes synchronized."
        } elseif ($Mode -eq "PullOnly") {
            Write-ErrorMsg "This branch has no matching remote branch to pull from."
            Write-Host "Local changes have been committed, but no push was attempted."
            Pause-Menu
            return
        } else {
            Write-Info "No upstream branch exists yet; there is nothing to pull."
        }
    } else {
        Write-Info "Push-only mode: pull/rebase will be skipped."
    }
    Write-Host ""
    Write-Host "[5] Verifying repository state..." -ForegroundColor Yellow
    Write-Host ""
    if (Test-Conflict) {
        Write-ErrorMsg "Conflicts are still present. Push cancelled."
        Show-ConflictFiles
        Pause-Menu
        return
    }
    if (Test-OperationInProgress) {
        Write-ErrorMsg "A Git operation is still in progress. Push cancelled."
        Pause-Menu
        return
    }
    if (Test-WorkingTreeDirty) {
        Write-WarningMsg "Working tree still has changes. They will NOT be pushed."
        git status --short
    } else {
        Write-Success "Repository state is clean."
    }
    if ($Mode -eq "PullOnly") {
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "                    PULL COMPLETE" -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        Write-Success "Add + Commit + Fetch + Pull/Rebase completed. No push was performed."
        Pause-Menu
        return
    }
    Write-Host ""
    Write-Host "[6] Pushing to remote..." -ForegroundColor Yellow
    Write-Host ""
    $upstream = Get-Upstream
    if ($upstream) {
        $code = Invoke-Git @("push")
    } else {
        $code = Invoke-Git @("push", "-u", "origin", $branch)
    }
    if ($code -eq 0) {
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "                    SYNC COMPLETE" -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host ""
        if ($Mode -eq "PushOnly") {
            Write-Success "Add + Commit + Push completed successfully. No pull was performed."
        } else {
            Write-Success "Pull + Add + Commit + Push completed successfully."
        }
    } else {
        Write-Host ""
        Write-ErrorMsg "Push failed."
        Write-Host ""
        Write-WarningMsg "Your local commit is safe. Fix the push problem and run Full Sync again."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Conflict Manager
# ------------------------------------------------------------
function Conflict-Manager {
    if (-not (Require-Repository)) { return }
    while ($true) {
        Write-Title "CONFLICT MANAGER"
        if (-not (Test-Conflict)) {
            Write-Success "No active file conflicts."
            Write-Host ""
            git status
            Pause-Menu
            return
        }
        Show-ConflictFiles
        Write-Host "1. Show conflict details"
        Write-Host "2. Open conflicted files"
        Write-Host "3. Mark resolved files"
        Write-Host "4. Continue merge/rebase"
        Write-Host "5. Abort current operation"
        Write-Host "6. Return to main menu"
        Write-Host ""
        $choice = Read-Host "Select an option"
        switch ($choice) {
            "1" {
                Write-Title "CONFLICT DETAILS"
                foreach ($file in Get-ConflictedFiles) {
                    Write-Host ""
                    Write-Host "============================================================"
                    Write-Host $file -ForegroundColor Red
                    Write-Host "============================================================"
                    git diff -- $file
                }
                Pause-Menu
            }
            "2" {
                foreach ($file in Get-ConflictedFiles) {
                    $fullPath = Join-Path (Get-GitRoot) $file
                    Write-Host "Opening: $fullPath" -ForegroundColor Yellow
                    Start-Process -FilePath "notepad.exe" -ArgumentList "`"$fullPath`""
                }
                Write-Host ""
                Write-Host "Remove the conflict markers, save the files, then choose option 3."
                Pause-Menu
            }
            "3" {
                Write-Host ""
                git status
                Write-Host ""
                $answer = Read-Host "Mark ALL currently conflicted files as resolved? (Y/N)"
                if ($answer -match "^(Y|y)$") {
                    $files = Get-ConflictedFiles
                    $ok = $true
                    foreach ($file in $files) {
                        $code = Invoke-Git @("add", "--", $file)
                        if ($code -ne 0) { $ok = $false }
                    }
                    if ($ok) {
                        Write-Success "Conflict files staged as resolved."
                    } else {
                        Write-ErrorMsg "One or more conflict files could not be staged."
                    }
                } else {
                    Write-WarningMsg "Operation cancelled."
                }
                Pause-Menu
            }
            "4" {
                if (Test-Conflict) {
                    Write-ErrorMsg "Conflicts still exist. Resolve and stage them first."
                    Pause-Menu
                    continue
                }
                $gitDir = git rev-parse --git-dir 2>$null
                $isRebase = (Test-Path (Join-Path $gitDir "rebase-merge")) -or
                            (Test-Path (Join-Path $gitDir "rebase-apply"))
                $isMerge = Test-Path (Join-Path $gitDir "MERGE_HEAD")
                if ($isRebase) {
                    Write-Info "Continuing rebase..."
                    $code = Invoke-Git @("rebase", "--continue")
                } elseif ($isMerge) {
                    Write-Info "Creating merge commit..."
                    $code = Invoke-Git @("commit")
                } else {
                    Write-WarningMsg "No merge/rebase continuation is required."
                    $code = 0
                }
                if ($code -eq 0) {
                    Write-Success "Operation continued successfully."
                    if (-not (Test-Conflict)) {
                        $push = Read-Host "Push the result to remote? (Y/N)"
                        if ($push -match "^(Y|y)$") {
                            $account = Ensure-RepositoryAccount -Interactive
                            if (-not $account) {
                                Pause-Menu
                                continue
                            }
                            $branch = Get-CurrentBranch
                            if ($branch) {
                                $upstream = Get-Upstream
                                if ($upstream) {
                                    $pushCode = Invoke-Git @("push")
                                } else {
                                    $pushCode = Invoke-Git @("push", "-u", "origin", $branch)
                                }
                                if ($pushCode -eq 0) {
                                    Write-Success "Push completed successfully."
                                } else {
                                    Write-ErrorMsg "Push failed."
                                }
                            }
                        }
                    }
                } else {
                    Write-ErrorMsg "Could not continue the Git operation."
                    if (Test-Conflict) { Show-ConflictFiles }
                }
                Pause-Menu
            }
            "5" {
                $gitDir = git rev-parse --git-dir 2>$null
                $isRebase = (Test-Path (Join-Path $gitDir "rebase-merge")) -or
                            (Test-Path (Join-Path $gitDir "rebase-apply"))
                $isMerge = Test-Path (Join-Path $gitDir "MERGE_HEAD")
                if (-not $isRebase -and -not $isMerge) {
                    Write-WarningMsg "No merge/rebase operation is currently active."
                    Pause-Menu
                    continue
                }
                Write-WarningMsg "This will abort the current merge/rebase operation."
                $answer = Read-Host "Are you sure? (YES/NO)"
                if ($answer -eq "YES") {
                    if ($isRebase) {
                        $code = Invoke-Git @("rebase", "--abort")
                    } else {
                        $code = Invoke-Git @("merge", "--abort")
                    }
                    if ($code -eq 0) {
                        Write-Success "Git operation aborted successfully."
                    } else {
                        Write-ErrorMsg "Could not abort the Git operation."
                    }
                } else {
                    Write-Host "Operation cancelled."
                }
                Pause-Menu
            }
            "6" { return }
            default {
                Write-ErrorMsg "Invalid option."
                Start-Sleep -Milliseconds 700
            }
        }
    }
}

# ------------------------------------------------------------
# Windows folder picker
# ------------------------------------------------------------
function Select-DestinationFolder {
    param(
        [string]$Description = "Select the parent folder where the repository should be cloned"
    )
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = $Description
        $dialog.ShowNewFolderButton = $true
        $dialog.RootFolder = [System.Environment+SpecialFolder]::MyComputer
        $current = (Get-Location).Path
        if (Test-Path -LiteralPath $current -PathType Container) {
            try { $dialog.SelectedPath = $current } catch {}
        }
        $result = $dialog.ShowDialog()
        if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
            return [System.IO.Path]::GetFullPath($dialog.SelectedPath)
        }
        return $null
    }
    catch {
        Write-WarningMsg "Windows folder picker is unavailable: $($_.Exception.Message)"
        Write-Host ""
        $manual = Read-Host "Enter destination parent folder manually (ENTER = cancel)"
        if ([string]::IsNullOrWhiteSpace($manual)) {
            return $null
        }
        $manual = $manual.Trim().Trim('"')
        try {
            return [System.IO.Path]::GetFullPath($manual)
        }
        catch {
            Write-ErrorMsg "Invalid destination path."
            return $null
        }
    }
}

# ------------------------------------------------------------
# Clone
# ------------------------------------------------------------
function Clone-Repository {
    Write-Title "CLONE REPOSITORY"
    Write-Host "GitManager uses separate SSH identities for GitHub accounts."
    Write-Host ""
    $account = Select-GitHubAccount -AllowCancel
    if (-not $account) {
        Write-ErrorMsg "No account selected."
        Pause-Menu
        return
    }
    if (-not (Ensure-AccountSSH $account)) {
        Pause-Menu
        return
    }
    Write-Host ""
    Write-Host "Enter GitHub repository URL."
    Write-Host "Examples:"
    Write-Host "  https://github.com/OWNER/REPOSITORY.git"
    Write-Host "  git@github.com:OWNER/REPOSITORY.git"
    Write-Host ""
    $url = Read-Host "Repository URL"
    if ([string]::IsNullOrWhiteSpace($url)) {
        Write-ErrorMsg "URL cannot be empty."
        Pause-Menu
        return
    }
    $parts = Get-GitHubPathFromRemote $url
    if (-not $parts -or [string]$parts.Host -notmatch "(?i)github\.com$") {
        Write-ErrorMsg "This clone function expects a GitHub URL."
        Pause-Menu
        return
    }
    $repoName = ($parts.Path.Trim("/") -split "/")[-1]
    $repoName = $repoName -replace "\.git$",""
    if ([string]::IsNullOrWhiteSpace($repoName)) {
        Write-ErrorMsg "Could not determine the repository name from the URL."
        Pause-Menu
        return
    }
    $sshUrl = "git@$($account.HostAlias):$($parts.Path.TrimStart("/"))"
    Write-Host ""
    Write-Info "Account       : $($account.Name) [$($account.GitHubUser)]"
    Write-Info "SSH URL       : $sshUrl"
    Write-Info "Repository    : $repoName"
    Write-Host ""
    Write-Host "Select the PARENT folder where the repository should be cloned."
    Write-Host "Example: selecting D:\Projects will create D:\Projects\$repoName"
    Write-Host ""
    $parentFolder = Select-DestinationFolder -Description "Select the parent folder for the cloned repository"
    if ([string]::IsNullOrWhiteSpace($parentFolder)) {
        Write-WarningMsg "Destination selection cancelled."
        Pause-Menu
        return
    }
    if (-not (Test-Path -LiteralPath $parentFolder -PathType Container)) {
        Write-ErrorMsg "Selected destination folder does not exist."
        Pause-Menu
        return
    }
    $repoPath = Join-Path $parentFolder $repoName
    if (Test-Path -LiteralPath $repoPath) {
        $existingGit = Join-Path $repoPath ".git"
        if (Test-Path -LiteralPath $existingGit) {
            Write-WarningMsg "The target folder is already a Git repository:"
            Write-Host "  $repoPath"
            Write-Host ""
            $useExisting = Read-Host "Use this existing repository instead of cloning? (Y/N)"
            if ($useExisting -match "^(Y|y)$") {
                Set-Location -LiteralPath $repoPath
                $accountSaved = Ensure-RepositoryAccount -Interactive
                Write-Success "Current directory changed to:"
                Write-Host "  $((Get-Location).Path)" -ForegroundColor Green
                if ($accountSaved) {
                    Write-Success "Existing repository is ready."
                }
                Pause-Menu
                return
            }
            Write-ErrorMsg "Clone cancelled to protect the existing repository."
            Pause-Menu
            return
        }
        $items = @(Get-ChildItem -LiteralPath $repoPath -Force -ErrorAction SilentlyContinue)
        if ($items.Count -gt 0) {
            Write-ErrorMsg "The target folder already exists and is not empty:"
            Write-Host "  $repoPath"
            Write-Host ""
            Write-Host "Choose another parent folder or remove/rename the existing folder."
            Pause-Menu
            return
        }
    }
    Write-Host ""
    Write-Info "Destination: $repoPath"
    Write-Host ""
    $code = Invoke-Git @("clone", $sshUrl, $repoPath)
    if ($code -ne 0) {
        Write-ErrorMsg "Clone failed."
        Pause-Menu
        return
    }
    if (-not (Test-Path -LiteralPath (Join-Path $repoPath ".git"))) {
        Write-ErrorMsg "Git reported a successful clone, but the destination repository was not found."
        Pause-Menu
        return
    }
    Set-Location -LiteralPath $repoPath
    if (-not (Save-RepositoryAccount -AccountName $account.Name)) {
        Write-WarningMsg "Repository was cloned, but account mapping could not be saved."
    }
    if (-not (Set-RepositoryGitIdentity -Account $account)) {
        Write-WarningMsg "Repository was cloned, but Git identity could not be configured."
    }
    $currentRemote = Get-RemoteURL
    [void](Register-Repository `
        -RepositoryPath $repoPath `
        -AccountName $account.Name `
        -GitHubUser $account.GitHubUser `
        -Remote $currentRemote)
    $desiredRemote = Convert-ToAccountRemote -Remote $currentRemote -Account $account
    if ($desiredRemote -and $desiredRemote -ne $currentRemote) {
        $remoteCode = Invoke-Git @("remote", "set-url", "origin", $desiredRemote)
        if ($remoteCode -ne 0) {
            Write-WarningMsg "Could not normalize origin to the selected SSH alias."
        }
    }
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "                    CLONE COMPLETE" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Success "Repository cloned successfully."
    Write-Success "Current directory changed to:"
    Write-Host "  $((Get-Location).Path)" -ForegroundColor Green
    Write-Host ""
    Write-Info "Account: $($account.Name) [$($account.GitHubUser)]"
    Write-Info "Remote : $(Get-RemoteURL)"
    Write-Host ""
    Pause-Menu
}

# ------------------------------------------------------------
# Fetch
# ------------------------------------------------------------
function Git-Fetch {
    if (-not (Require-Repository)) { return }
    $account = Ensure-RepositoryAccount -Interactive
    if (-not $account) { Pause-Menu; return }
    Write-Title "GIT FETCH"
    $code = Invoke-Git @("fetch", "origin", "--prune")
    if ($code -eq 0) {
        Write-Success "Fetch completed."
    } else {
        Write-ErrorMsg "Fetch failed."
    }
    Pause-Menu
}

# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
Initialize-GitManagerData
try {
    foreach ($savedAccount in @(Get-GitManagerAccounts)) {
        if (-not [string]::IsNullOrWhiteSpace([string]$savedAccount.SSHKey) -and
            -not [string]::IsNullOrWhiteSpace([string]$savedAccount.HostAlias)) {
            Ensure-SSHConfigForAccount -Account $savedAccount | Out-Null
        }
    }
} catch {
    Write-WarningMsg "Could not automatically repair SSH config: $($_.Exception.Message)"
}

if (-not (Test-GitInstalled)) {
    Write-ErrorMsg "Git was not found on this computer."
    Write-Host "Install Git and make sure 'git' is available in PATH."
    Pause-Menu
    exit 1
}

while ($true) {
    Write-Title "MAIN MENU"
    Show-RepositoryInfo
    Write-Host "=== Core Git Operations ===" -ForegroundColor Cyan
    Write-Host " 1. Pull"
    Write-Host " 2. Status"
    Write-Host " 3. Add changes"
    Write-Host " 4. Commit"
    Write-Host " 5. Push"
    Write-Host " 6. Full Sync"
    Write-Host " 7. View Diff"
    Write-Host " 8. View History"
    Write-Host " 9. Fetch"
    Write-Host ""
    Write-Host "=== Advanced ===" -ForegroundColor Cyan
    Write-Host "10. Conflict Manager"
    Write-Host "11. Clone Repository"
    Write-Host "12. GitHub Account Manager"
    Write-Host "13. Diagnostics / Repair"
    Write-Host "14. Reset GitManager Account Database"
    Write-Host "15. Repository List"
    Write-Host ""
    Write-Host "=== Folders & Files ===" -ForegroundColor Magenta
    Write-Host "16. Compare Two Folders (read-only)"
    Write-Host "17. Sync Folders (overwrite matching)"
    Write-Host "18. Delete Committed File"
    Write-Host ""
    Write-Host "=== Git Tools ===" -ForegroundColor Magenta
    Write-Host "19. Branch Manager"
    Write-Host "20. Stash Manager"
    Write-Host "21. Tag Manager"
    Write-Host "22. Undo Last Commit"
    Write-Host "23. .gitignore Manager"
    Write-Host "24. Search History"
    Write-Host "25. Remote Manager"
    Write-Host ""
    Write-Host "=== Sync Shortcuts ===" -ForegroundColor DarkCyan
    Write-Host "26. Full Pull  (Add+Commit+Pull, no Push)"
    Write-Host "27. Full Push  (Add+Commit+Push, no Pull)"
    Write-Host ""
    Write-Host " 0. Exit" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "Select an option"
    switch ($choice) {
        "1"  { Git-Pull }
        "2"  { Show-Status }
        "3"  { Git-Add }
        "4"  { Git-Commit }
        "5"  { Git-Push }
        "6"  { Full-Sync }
        "7"  { Git-Diff }
        "8"  { Git-History }
        "9"  { Git-Fetch }
        "10" { Conflict-Manager }
        "11" { Clone-Repository }
        "12" { Manage-GitHubAccounts }
        "13" { Test-GitManagerConfiguration }
        "14" { Reset-GitManagerData }
        "15" { Select-RepositoryFromList }
        "16" { Compare-Folders }
        "17" { Sync-FoldersOverwrite }
        "18" { Remove-CommittedFile }
        "19" { Manage-Branches }
        "20" { Manage-Stash }
        "21" { Manage-Tags }
        "22" { Undo-LastCommit }
        "23" { Manage-Gitignore }
        "24" { Search-History }
        "25" { Manage-Remotes }
        "26" { Full-Sync -Mode "PullOnly" }
        "27" { Full-Sync -Mode "PushOnly" }
        "0"  {
            Clear-Host
            Write-Host "`nGit Manager closed.`n"
            exit 0
        }
        default {
            Write-ErrorMsg "Invalid option."
            Start-Sleep -Milliseconds 700
        }
    }
}
