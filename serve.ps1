# Minimal static file server (no dependencies) for previewing dinner-picker.
# Serves the script's own folder on http://localhost:<port>.
param([int]$Port = 8770)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "dinner-picker serving $root on http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    # Handle each request defensively — one bad/HEAD/probe request must never
    # kill the listener loop.
    try {
      $isHead = $ctx.Request.HttpMethod -eq 'HEAD'
      $rel = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
      $path = Join-Path $root $rel
      if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }

      if (Test-Path $path -PathType Leaf) {
        $ext = [IO.Path]::GetExtension($path).ToLower()
        $ctx.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
        $bytes = [IO.File]::ReadAllBytes($path)
        $ctx.Response.ContentLength64 = $bytes.Length
        if (-not $isHead) { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) }
      } else {
        $ctx.Response.StatusCode = 404
        $msg = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $ctx.Response.ContentLength64 = $msg.Length
        if (-not $isHead) { $ctx.Response.OutputStream.Write($msg, 0, $msg.Length) }
      }
    } catch {
      Write-Host "req error: $($_.Exception.Message)"
    } finally {
      try { $ctx.Response.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
