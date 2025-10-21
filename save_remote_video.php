<?php
// save_remote_video.php
// Usage (CLI): php save_remote_video.php "https://example.com/view_video.php?viewkey=..." 
// Usage (Browser): save_remote_video.php?url=https://example.com/view_video.php?viewkey=...

set_time_limit(0);
error_reporting(E_ALL);
ini_set('display_errors', 1);

function safe_filename($name) {
    // remove dangerous chars
    return preg_replace('/[^A-Za-z0-9_\-\. ]/', '_', $name);
}

$url = '';
if (php_sapi_name() === 'cli') {
    $url = $argv[1] ?? '';
} else {
    $url = $_GET['url'] ?? '';
}

if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
    die("No valid URL provided.\n");
}

// Save directory
$dir = __DIR__ . '/videos';
if (!is_dir($dir)) {
    if (!mkdir($dir, 0755, true)) {
        die("Failed to create directory: $dir\n");
    }
}

// Optional: set referer, cookies, extra headers if target requires them
$referer = isset($_GET['referer']) ? $_GET['referer'] : '';
$userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
           . '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// First do a HEAD / small GET to attempt to get filename and content-type
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,
    CURLOPT_NOBODY         => true, // HEAD-like
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_USERAGENT      => $userAgent,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => false, // set true in prod if possible
    CURLOPT_SSL_VERIFYHOST => false,
]);
if ($referer) curl_setopt($ch, CURLOPT_REFERER, $referer);

// If the site needs cookies/auth, you can set cookie file or header here:
// curl_setopt($ch, CURLOPT_COOKIEFILE, __DIR__ . '/cookie.txt');
// curl_setopt($ch, CURLOPT_COOKIEJAR, __DIR__ . '/cookie.txt');

$head = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// Try to extract filename from Content-Disposition
$filename = null;
if ($head) {
    if (preg_match('/filename\*?=.?(?:UTF-8\'\')?["\']?([^"\';\n]+)/i', $head, $m)) {
        $filename = urldecode($m[1]);
    }
}

// Fallback: use path from effective URL
if (!$filename) {
    $path = parse_url($effectiveUrl, PHP_URL_PATH) ?: '';
    $basename = basename($path);
    if ($basename && strpos($basename, '.') !== false) {
        $filename = $basename;
    } else {
        // fallback generic
        $filename = 'video_' . uniqid();
        // attempt extension from content-type
        if ($contentType) {
            if (strpos($contentType, 'mp4') !== false) $filename .= '.mp4';
            elseif (strpos($contentType, 'webm') !== false) $filename .= '.webm';
            elseif (strpos($contentType, 'mpeg') !== false) $filename .= '.mp4';
            else $filename .= '.bin';
        } else {
            $filename .= '.mp4';
        }
    }
}

$filename = safe_filename($filename);
$localPath = $dir . '/' . $filename;

// If file exists, append suffix
$base = pathinfo($localPath, PATHINFO_FILENAME);
$ext  = pathinfo($localPath, PATHINFO_EXTENSION);
$counter = 1;
while (file_exists($localPath)) {
    $localPath = $dir . '/' . $base . '_' . $counter . '.' . $ext;
    $counter++;
}

// Stream download to file (memory safe)
$fp = fopen($localPath, 'w+b');
if (!$fp) {
    die("Cannot open local file for writing: $localPath\n");
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_FILE           => $fp,            // stream directly to file
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 10,
    CURLOPT_USERAGENT      => $userAgent,
    CURLOPT_CONNECTTIMEOUT => 30,
    CURLOPT_TIMEOUT        => 0,              // no overall timeout (streaming)
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_FAILONERROR    => true,
]);

// If the source supports Range/resume, you can resume by setting CURLOPT_RANGE and checking existing file size.
// Example (simple resume):
if (file_exists($localPath) && filesize($localPath) > 0) {
    $existing = filesize($localPath);
    curl_setopt($ch, CURLOPT_RANGE, $existing . '-');
    // move file pointer to end
    fseek($fp, $existing);
}

// Optional headers (referer/cookies)
$headers = ['Accept: */*'];
if ($referer) $headers[] = 'Referer: ' . $referer;
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute
$ok = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
fclose($fp);

// Validate result
if ($ok === false || ($httpCode < 200 || $httpCode >= 400)) {
    // remove partial file to avoid confusion
    if (file_exists($localPath)) @unlink($localPath);
    echo "Download failed. HTTP code: $httpCode. cURL error: $curlErr\n";
    exit(1);
}

echo "Saved to: $localPath\n";
exit(0);
