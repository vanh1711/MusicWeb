<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#050506">
    <meta name="description" content="VanhSound - Open Audio Universe & V-Music Creator Platform.">
    <!-- Favicon Icon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="shortcut icon" href="/favicon.svg">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Audio Stream APIs (YouTube & SoundCloud Universal Engines) -->
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="https://w.soundcloud.com/player/api.js"></script>

    <!-- Vite Styles & Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-[#050506] text-[#EDEDEF] antialiased selection:bg-[#5E6AD2]/30 selection:text-[#EDEDEF] overflow-hidden">
    <div id="root" class="h-screen w-screen overflow-hidden flex flex-col"></div>
</body>
</html>
