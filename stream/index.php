<?php
$isSpf = isset($_SERVER['HTTP_X_SPF_REQUEST']) && $_SERVER['HTTP_X_SPF_REQUEST'] === 'true';
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = $requestPath === '/' ? '/home' : $requestPath;

function generateVideoCards() {
    $videos = [
        ['id' => 'v1_landscape', 'url' => 'media/vid1.mp4', 'poster' => 'poster1.jpg', 'progress' => 85, 'orientation' => 'landscape'],
        ['id' => 'v2_portrait', 'url' => 'media/vid2.mp4', 'poster' => 'poster2.jpg', 'progress' => 0, 'orientation' => 'portrait'],
        ['id' => 'v3_landscape', 'url' => 'media/vid3.mp4', 'poster' => 'poster3.jpg', 'progress' => 12, 'orientation' => 'landscape'],
        ['id' => 'v4_portrait', 'url' => 'media/vid4.mp4', 'poster' => 'poster4.jpg', 'progress' => 100, 'orientation' => 'portrait'],
        ['id' => 'v5_landscape', 'url' => 'media/vid5.mp4', 'poster' => 'poster5.jpg', 'progress' => 0, 'orientation' => 'landscape']
    ];

    $html = '<div class="masonry-container" id="video-grid">';
    foreach ($videos as $video) {
        $progressHtml = $video['progress'] > 0 
            ? '<div class="progress-bar-container"><div class="progress-bar" style="width: ' . $video['progress'] . '%;"></div></div>' 
            : '';
            
        $html .= '
        <div class="video-card ' . $video['orientation'] . '" data-playback-id="' . $video['id'] . '" data-video-url="' . $video['url'] . '">
            <div class="thumbnail-wrapper">
                <img src="' . $video['poster'] . '" class="thumbnail-img" loading="lazy" alt="Thumbnail">
                ' . $progressHtml . '
            </div>
            <div class="card-actions">
                <button class="action-btn queue-btn"><i class="fa-solid fa-plus"></i></button>
                <button class="action-btn menu-btn"><i class="fa-solid fa-ellipsis"></i></button>
            </div>
        </div>';
    }
    $html .= '</div>';
    return $html;
}

if ($isSpf) {
    header('Content-Type: application/json');
    $response = ['fragments' => [], 'title' => ''];
    
    if ($route === '/home') {
        $response['title'] = 'Library - Video Stream';
        $response['fragments']['main-content'] = generateVideoCards();
    } else {
        $response['title'] = 'Explore - Video Stream';
        $response['fragments']['main-content'] = '<div class="masonry-container"><h2>Explore Content</h2></div>';
    }
    
    echo json_encode($response);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Library - Video Stream</title>
    <link rel="stylesheet" href="assets/fontawesome/css/all.css">
    <link rel="stylesheet" href="./ui.css">
</head>
<body>
    <div id="spf-loader"></div>
    
    <nav class="sidebar-nav">
        <div class="nav-brand"><i class="fa-solid fa-play-circle"></i></div>
        <a href="/home" class="nav-item" data-spf><i class="fa-solid fa-house"></i></a>
        <a href="/explore" class="nav-item" data-spf><i class="fa-solid fa-compass"></i></a>
    </nav>

    <main id="main-content">
        <?php echo generateVideoCards(); ?>
    </main>

    <div id="offcanvas-player" class="closed">
        <div class="player-header">
            <div class="player-drag-handle"></div>
            <div class="player-controls">
                <button id="btn-pip" class="control-btn"><i class="fa-solid fa-picture-in-picture"></i></button>
                <button id="btn-mini" class="control-btn"><i class="fa-solid fa-window-restore"></i></button>
                <button id="btn-close" class="control-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        <div class="video-container">
            <video id="primary-video" controls playsinline></video>
        </div>
    </div>

    <script src="./script.js"></script>
</body>
</html>