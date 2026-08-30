<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class LiveMusicService
{
    protected string $appName = 'VANHSOUND';
    protected array $audiusHosts = [
        'https://discoveryprovider.audius.co',
        'https://discoveryprovider2.audius.co',
        'https://discoveryprovider3.audius.co',
    ];

    protected function getAudiusHost(): string
    {
        return $this->audiusHosts[array_rand($this->audiusHosts)];
    }

    /**
     * Get track by ID (Audius, YouTube, Local DB or SoundCloud)
     */
    public function getTrackById(string $id): ?array
    {
        if (str_starts_with($id, 'audius_')) {
            $rawId = str_replace('audius_', '', $id);
            $host = $this->getAudiusHost();
            $url = "{$host}/v1/tracks/{$rawId}?app_name={$this->appName}";
            $ctx = stream_context_create(['http' => ['timeout' => 4, 'header' => 'User-Agent: VanhSound/2.0']]);
            $res = @file_get_contents($url, false, $ctx);
            if ($res) {
                $json = json_decode($res, true);
                if (!empty($json['data'])) {
                    return $this->formatAudiusTrack($json['data']);
                }
            }
        } elseif (is_numeric($id)) {
            $track = Track::with(['artist', 'album'])->find((int)$id);
            if ($track) {
                return $track->toArray();
            }
        } elseif (str_starts_with($id, 'yt_')) {
            $ytId = str_replace('yt_', '', $id);
            $res = $this->searchUnified($ytId);
            if (!empty($res['tracks'])) {
                return $res['tracks'][0];
            }
        }

        // Fallback search
        $res = $this->searchUnified($id);
        return !empty($res['tracks']) ? $res['tracks'][0] : null;
    }

    /**
     * Resolve SoundCloud Track metadata & stream from any URL
     */
    public function resolveSoundCloudTrack(string $url): ?array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        $html = curl_exec($ch);
        curl_close($ch);

        if (empty($html)) return null;

        $title = 'SoundCloud Track';
        $artist = 'SoundCloud Creator';
        $image = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
        $duration = 210;

        if (preg_match('/<meta property="og:title" content="(.*?)"/i', $html, $m)) {
            $title = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
        if (preg_match('/<meta property="og:image" content="(.*?)"/i', $html, $m)) {
            $image = $m[1];
        }
        if (preg_match('/<meta property="og:description" content="(.*?)"/i', $html, $m)) {
            $desc = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if (preg_match('/Play (.*?) on SoundCloud/i', $desc, $mArtist)) {
                $artist = $mArtist[1];
            }
        }

        // Split artist & title if in "Artist - Title" format
        if (str_contains($title, ' - ')) {
            $parts = explode(' - ', $title, 2);
            $artist = trim($parts[0]);
            $title = trim($parts[1]);
        } elseif (str_contains($title, ' by ')) {
            $parts = explode(' by ', $title, 2);
            $title = trim($parts[0]);
            $artist = trim($parts[1]);
        }

        $id = 'sc_' . md5($url);

        return [
            'id' => $id,
            'title' => $title,
            'duration' => $duration,
            'duration_formatted' => sprintf('%d:%02d', floor($duration / 60), $duration % 60),
            'audio_url' => $url,
            'soundcloud_url' => $url,
            'cover_url' => $image,
            'display_cover_url' => $image,
            'plays_count' => rand(150000, 3500000),
            'genre' => 'SoundCloud & Remix',
            'waveform_data' => $this->generateWaveform($id),
            'lyrics_lrc' => "[00:00.00] (SoundCloud Direct Stream)\n[00:05.00] Đang phát: {$title}\n[00:10.00] Nghệ sĩ: {$artist}\n[00:15.00] Thưởng thức bản thu gốc không giới hạn từ cộng đồng SoundCloud...",
            'source' => 'soundcloud',
            'artist' => [
                'id' => 'art_' . Str::slug($artist),
                'name' => $artist,
                'slug' => Str::slug($artist),
                'avatar_url' => $image,
                'monthly_listeners' => rand(300000, 5000000),
                'is_verified' => true,
            ],
            'album' => [
                'id' => 'alb_' . $id,
                'title' => $title . ' (SoundCloud Release)',
                'slug' => Str::slug($title . '-sc'),
                'cover_url' => $image,
                'type' => 'single',
            ],
        ];
    }

    /**
     * Resolve embeddable alternate stream when an official MV has embedding restricted (Error 150/101)
     */
    public function resolveAlternateStream(string $title, ?string $artist = null, ?string $excludeId = null): ?array
    {
        $cleanTitle = preg_replace('/(\(.*?\)|\(.*|\[.*?\]|official|music|video|mv|audio|remix|tik\s*tok)/iu', '', $title);
        $query = trim($cleanTitle . ' ' . ($artist ?: '') . ' audio');

        $results = $this->searchUnified($query);
        if (!empty($results['tracks'])) {
            foreach ($results['tracks'] as $t) {
                if (!empty($t['youtube_id']) && $t['youtube_id'] !== $excludeId) {
                    return $t;
                }
            }
        }

        // Try lyrics query
        $lyricResults = $this->searchUnified(trim($cleanTitle . ' lyrics'));
        if (!empty($lyricResults['tracks'])) {
            foreach ($lyricResults['tracks'] as $t) {
                if (!empty($t['youtube_id']) && $t['youtube_id'] !== $excludeId) {
                    return $t;
                }
            }
        }

        return null;
    }

    /**
     * Fetch synchronized LRC lyrics from open LRC database (LrcLib API)
     */
    public function fetchSyncedLyrics(string $title, ?string $artist = null, ?int $duration = 0): ?string
    {
        $cleanTitle = preg_replace('/(\(.*?\)|\(.*|\[.*?\]|ft\..*?|feat\..*?|official|music|video|mv|audio|remix|tik\s*tok|hot|bản|chuẩn|beat)/iu', '', $title);
        $cleanTitle = trim($cleanTitle);
        $cleanArtist = trim($artist ?: '');

        $cacheKey = 'synced_lyrics_' . md5(mb_strtolower($cleanTitle . '_' . $cleanArtist));

        return Cache::remember($cacheKey, 86400, function () use ($cleanTitle, $cleanArtist, $duration) {
            // 1. Try exact match
            $url = "https://lrclib.net/api/get?track_name=" . urlencode($cleanTitle);
            if (!empty($cleanArtist)) {
                $url .= "&artist_name=" . urlencode($cleanArtist);
            }
            if ($duration > 0) {
                $url .= "&duration=" . $duration;
            }

            $ctx = stream_context_create(['http' => ['timeout' => 3, 'header' => 'User-Agent: VanhSound/2.0']]);
            $res = @file_get_contents($url, false, $ctx);

            if ($res) {
                $json = json_decode($res, true);
                if (!empty($json['syncedLyrics'])) {
                    return $json['syncedLyrics'];
                }
                if (!empty($json['plainLyrics'])) {
                    return $this->formatPlainToLrc($json['plainLyrics']);
                }
            }

            // 2. Try search query fallback
            $searchUrl = "https://lrclib.net/api/search?q=" . urlencode($cleanTitle . ' ' . $cleanArtist);
            $searchRes = @file_get_contents($searchUrl, false, $ctx);
            if ($searchRes) {
                $items = json_decode($searchRes, true);
                if (is_array($items) && !empty($items)) {
                    foreach ($items as $it) {
                        if (!empty($it['syncedLyrics'])) {
                            return $it['syncedLyrics'];
                        }
                    }
                    if (!empty($items[0]['plainLyrics'])) {
                        return $this->formatPlainToLrc($items[0]['plainLyrics']);
                    }
                }
            }

            return null;
        });
    }

    /**
     * Convert plain lyrics to standard timed LRC format
     */
    protected function formatPlainToLrc(string $plain): string
    {
        $lines = array_filter(explode("\n", $plain), fn($l) => !empty(trim($l)));
        $lrc = [];
        $sec = 5;
        foreach ($lines as $line) {
            $m = floor($sec / 60);
            $s = $sec % 60;
            $lrc[] = sprintf("[%02d:%02d.00] %s", $m, $s, trim($line));
            $sec += 4;
        }
        return implode("\n", $lrc);
    }

    /**
     * Fetch trending tracks from Audius with caching
     */
    public function getAudiusTrending(int $limit = 12): array
    {
        return Cache::remember('audius_trending_v9', 600, function () use ($limit) {
            $host = $this->getAudiusHost();
            $url = "{$host}/v1/tracks/trending?app_name={$this->appName}&limit={$limit}";

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 3,
                CURLOPT_USERAGENT => 'VanhSound/2.0',
            ]);
            $res = curl_exec($ch);
            curl_close($ch);

            if (!$res) return [];

            $json = json_decode($res, true);
            $tracks = $json['data'] ?? [];

            return array_map([$this, 'formatAudiusTrack'], $tracks);
        });
    }

    /**
     * Unified Ultra-Fast Parallel Search (YouTubei + Audius in parallel via curl_multi)
     */
    public function searchUnified(string $query): array
    {
        $cleanQuery = trim($query);
        if (empty($cleanQuery) || strlen($cleanQuery) < 2) {
            return ['query' => $cleanQuery, 'top_result' => null, 'tracks' => [], 'artists' => [], 'albums' => []];
        }

        $cacheKey = 'unified_search_fast_' . md5(mb_strtolower($cleanQuery));

        return Cache::remember($cacheKey, 3600, function () use ($cleanQuery) {
            // Auto-detect direct SoundCloud links
            if (str_contains($cleanQuery, 'soundcloud.com')) {
                $scTrack = $this->resolveSoundCloudTrack($cleanQuery);
                if ($scTrack) {
                    return [
                        'query' => $cleanQuery,
                        'top_result' => $scTrack,
                        'tracks' => [$scTrack],
                        'artists' => [$scTrack['artist']],
                        'albums' => [$scTrack['album']],
                    ];
                }
            }

            $mh = curl_multi_init();

            // 1. YouTubei Fast JSON API Handle
            $ytPayload = json_encode([
                'context' => [
                    'client' => [
                        'clientName' => 'WEB',
                        'clientVersion' => '2.20231201.00.00',
                        'hl' => 'vi',
                        'gl' => 'VN',
                    ]
                ],
                'query' => $cleanQuery,
            ]);

            $chYt = curl_init('https://www.youtube.com/youtubei/v1/search?prettyPrint=false');
            curl_setopt_array($chYt, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $ytPayload,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ],
                CURLOPT_TIMEOUT => 3,
            ]);
            curl_multi_add_handle($mh, $chYt);

            // 2. Audius Search Handle
            $host = $this->getAudiusHost();
            $audiusUrl = "{$host}/v1/tracks/search?query=" . urlencode($cleanQuery) . "&app_name={$this->appName}&limit=6";
            $chAudius = curl_init($audiusUrl);
            curl_setopt_array($chAudius, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 3,
                CURLOPT_USERAGENT => 'VanhSound/2.0',
            ]);
            curl_multi_add_handle($mh, $chAudius);

            // Execute in parallel
            $running = null;
            do {
                curl_multi_exec($mh, $running);
                curl_multi_select($mh, 0.1);
            } while ($running > 0);

            $ytContent = curl_multi_getcontent($chYt);
            $audiusContent = curl_multi_getcontent($chAudius);

            curl_multi_remove_handle($mh, $chYt);
            curl_multi_remove_handle($mh, $chAudius);
            curl_multi_close($mh);

            // Parse YouTube results
            $ytTracks = $this->parseYouTubeiResults($ytContent);

            // Sort: Prioritize embeddable Audio / Topic / Lyric / Remix versions over restrictive MVs
            usort($ytTracks, function ($a, $b) {
                $aTitle = mb_strtolower($a['title']);
                $bTitle = mb_strtolower($b['title']);

                $aScore = 0;
                $bScore = 0;

                if (str_contains($aTitle, 'audio') || str_contains($aTitle, 'topic') || str_contains($aTitle, 'lyric') || str_contains($aTitle, 'remix')) $aScore += 2;
                if (str_contains($bTitle, 'audio') || str_contains($bTitle, 'topic') || str_contains($bTitle, 'lyric') || str_contains($bTitle, 'remix')) $bScore += 2;

                if (str_contains($aTitle, 'official music video') || str_contains($aTitle, '(m/v)')) $aScore -= 1;
                if (str_contains($bTitle, 'official music video') || str_contains($bTitle, '(m/v)')) $bScore -= 1;

                return $bScore <=> $aScore;
            });

            // Parse Audius results
            $audiusTracks = [];
            if ($audiusContent) {
                $aJson = json_decode($audiusContent, true);
                if (isset($aJson['data']) && is_array($aJson['data'])) {
                    $audiusTracks = array_map([$this, 'formatAudiusTrack'], $aJson['data']);
                }
            }

            $mergedTracks = array_merge($ytTracks, $audiusTracks);

            // Extract artists & albums
            $artists = [];
            $albums = [];
            $seenArtists = [];
            $seenAlbums = [];

            foreach ($mergedTracks as $t) {
                $artName = $t['artist']['name'] ?? 'Artist';
                $albName = $t['album']['title'] ?? 'Single';

                if (!isset($seenArtists[$artName])) {
                    $seenArtists[$artName] = true;
                    $artists[] = $t['artist'];
                }

                if (!isset($seenAlbums[$albName])) {
                    $seenAlbums[$albName] = true;
                    $albums[] = $t['album'];
                }
            }

            return [
                'query' => $cleanQuery,
                'top_result' => $mergedTracks[0] ?? null,
                'tracks' => $mergedTracks,
                'artists' => array_slice($artists, 0, 6),
                'albums' => array_slice($albums, 0, 6),
                'playlists' => [],
            ];
        });
    }

    /**
     * Check if a track belongs to Vietnamese Music
     */
    public function isVietnameseMusic(string $title, string $artist = ''): bool
    {
        $text = mb_strtolower($title . ' ' . $artist);

        // Has Vietnamese accented characters
        if (preg_match('/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/u', $text)) {
            return true;
        }

        // Has whole-word Vietnamese tokens or phrases
        if (preg_match('/\b(nhac|nhạc|viet|việt|vpop|vinahouse|vietmix|son tung|sơn tùng|den vau|đen vâu|hieuthuhai|tang duy tan|tăng duy tân|hoang dung|hoàng dũng|chillies|thinh suy|thịnh suy|phuong my chi|phương mỹ chi|vu cat tuong|vũ cát tường|trinh thang binh|trịnh thăng bình|double2t|grey d|tlinh|low g|wren evans|jack|j97|mono)\b/u', $text)) {
            return true;
        }

        return false;
    }

    /**
     * Smart Vibe-, Language- & Duration-Aware Recommendation Engine
     * Enforces 100% LANGUAGE CONSISTENCY: Vietnamese songs only recommend Vietnamese songs!
     * Enforces 100% DISTINCT SONGS: Max 1 track per song signature.
     */
    public function getRecommendations(string $title, ?string $artistName = null, ?string $currentTrackId = null, int $currentDuration = 240): array
    {
        $cleanTitle = trim($title);
        $cleanArtist = trim($artistName ?: '');
        $lowerInfo = mb_strtolower($cleanTitle . ' ' . $cleanArtist);

        // 1. Detect Language / Region
        $isVN = $this->isVietnameseMusic($cleanTitle, $cleanArtist);

        // 2. Detect Category / Vibe
        $isRemix = str_contains($lowerInfo, 'remix') || str_contains($lowerInfo, 'vinahouse') || str_contains($lowerInfo, 'viet mix') || str_contains($lowerInfo, 'speed up') || str_contains($lowerInfo, 'nightcore');
        $isChill = str_contains($lowerInfo, 'chill') || str_contains($lowerInfo, 'lofi') || str_contains($lowerInfo, 'acoustic') || str_contains($lowerInfo, 'indie') || str_contains($lowerInfo, 'đen') || str_contains($lowerInfo, 'vũ') || str_contains($lowerInfo, 'chillies') || str_contains($lowerInfo, 'hoàng dũng') || str_contains($lowerInfo, 'ngọt');
        $isRap = str_contains($lowerInfo, 'rap') || str_contains($lowerInfo, 'hip hop') || str_contains($lowerInfo, 'hieuthuhai') || str_contains($lowerInfo, 'mck') || str_contains($lowerInfo, 'wren') || str_contains($lowerInfo, 'tlinh') || str_contains($lowerInfo, 'low g');
        $isLongSet = $currentDuration > 1200; // > 20 mins

        // 3. Select language-appropriate query pools
        if ($isVN) {
            // === VIETNAMESE MUSIC ONLY ===
            if ($isLongSet) {
                $pool = [
                    'nonstop vinahouse 2026 cực căng bass việt mix',
                    'vietmix nonstop hot tiktok 2026 bay phòng',
                ];
            } elseif ($isRemix) {
                $pool = [
                    'nhạc trẻ remix bxh hot tiktok 2026',
                    'lạc trôi remix triple d',
                    'cắt đôi nỗi sầu remix tang duy tan',
                    'ngày chưa giông bão remix',
                    'bật tình yêu lên remix',
                    'bên trên tầng lầu remix',
                    'anh chưa thương em đến vậy đâu remix',
                    'đúng nhận sai cãi remix',
                    'về bên anh remix jack',
                    'đế vương remix',
                    'tổng hợp nhạc remix việt hay nhất',
                ];
            } elseif ($isChill) {
                $pool = [
                    'vũ bước qua nhau lạ lùng',
                    'chillies vùng ký ức mascara có em đời bỗng vui',
                    'hoàng dũng nàng thơ đôi lời đoạn kết mới',
                    'đen vâu trốn tìm lối nhỏ đi về nhà',
                    'ngọt bài ca say em dạo này thấy chưa',
                    'thịnh suy một đêm say chuyen rang',
                    'tuyển tập nhạc indie việt chill nhẹ nhàng',
                ];
            } elseif ($isRap) {
                $pool = [
                    'hieuthuhai không thể say hẹn gặp em dưới ánh trăng',
                    'mck chìm sâu tại vì sao va vào giai điệu này',
                    'wren evans từng quen bé iu call me',
                    'double2t à lôi người miền núi chất',
                    'grey d đưa em về nhà vaicaunoicokhiennguoithaydoi',
                    'top rap việt hot trend triệu view',
                ];
            } else {
                $pool = [
                    'sơn tùng mtp đừng làm trái tim anh đau chúng ta của tương lai',
                    'mono em là waiting for you',
                    'vũ cát tường từng là',
                    'phương mỹ chi bóng phù hoa vũ trụ có anh',
                    'trịnh thăng bình người ấy tâm sự tuổi 30',
                    'top hits vpop 2026 triệu view bxh',
                ];
            }
        } else {
            // === INTERNATIONAL MUSIC ONLY ===
            if ($isLongSet) {
                $pool = [
                    'best edm festival mix 2026 nonstop',
                    'club dance party nonstop mix',
                ];
            } elseif ($isRemix) {
                $pool = [
                    'top edm remix club festival 2026',
                    'alan walker faded remix',
                    'the chainsmokers closer remix',
                    'avicii levels remix',
                ];
            } else {
                $pool = [
                    'top hits international pop 2026',
                    'taylor swift edm acoustic hits',
                    'billie eilish hits',
                ];
            }
        }

        // Shuffle pool and query 5 distinct themes for maximum diversity
        shuffle($pool);
        $selectedQueries = array_slice($pool, 0, 5);

        $collectedTracks = [];
        foreach ($selectedQueries as $q) {
            $res = $this->searchUnified($q);
            if (!empty($res['tracks'])) {
                $collectedTracks = array_merge($collectedTracks, $res['tracks']);
            }
        }

        // Only add Audius trending if playing International music
        if (!$isVN) {
            $audiusTrending = $this->getAudiusTrending(6);
            $collectedTracks = array_merge($collectedTracks, $audiusTrending);
        }

        // 4. Current track signature
        $currentSig = $this->getSongSignature($cleanTitle, $cleanArtist);

        // 5. Strict Deduplication & Language Filter
        $seenSignatures = [];
        if (!empty($currentSig)) {
            $seenSignatures[$currentSig] = true;
        }

        $uniqueTracks = [];

        foreach ($collectedTracks as $t) {
            if ($currentTrackId && $t['id'] === $currentTrackId) continue;
            if (isset($t['youtube_id']) && $currentTrackId && str_contains($currentTrackId, $t['youtube_id'])) continue;

            $tTitleLower = mb_strtolower($t['title']);
            $tArtistName = $t['artist']['name'] ?? '';

            // Exclude noise
            if (str_contains($tTitleLower, 'reaction') || str_contains($tTitleLower, 'karaoke') || str_contains($tTitleLower, 'hướng dẫn') || str_contains($tTitleLower, 'review') || str_contains($tTitleLower, 'talkshow')) {
                continue;
            }

            // Strict Language Matching
            $trackIsVN = $this->isVietnameseMusic($t['title'], $tArtistName);
            if ($isVN && !$trackIsVN) {
                // Skip English / international tracks when playing Vietnamese music!
                continue;
            } elseif (!$isVN && $trackIsVN) {
                // Skip Vietnamese tracks when playing International music!
                continue;
            }

            // Duration matching
            $tDuration = (int)($t['duration'] ?? 200);
            if (!$isLongSet) {
                if ($tDuration > 600 || $tDuration < 60) continue;
            } else {
                if ($tDuration < 900) continue;
            }

            // Extract Song Signature
            $sig = $this->getSongSignature($t['title'], $tArtistName);

            if (!empty($sig)) {
                if (isset($seenSignatures[$sig])) {
                    continue;
                }
                $seenSignatures[$sig] = true;
            }

            $uniqueTracks[] = $t;
        }

        // 6. Shuffle for fresh, natural radio vibe
        shuffle($uniqueTracks);

        return array_slice($uniqueTracks, 0, 15);
    }

    /**
     * Extract Normalized 2-Word Core Song Signature
     */
    public function getSongSignature(string $title, string $artist = ''): string
    {
        $clean = mb_strtolower($title . ' ' . $artist);
        // Strip out noisy tags, clutter, and common artist names
        $clean = preg_replace('/(\(.*?\)|\(.*|\[.*?\]|ft\..*?|feat\..*?|x\s+.*|-|\/|official|music|video|mv|full|track|mashup|sped\s*up|nightcore|album|remake|live|audio|remix|tik\s*tok|hot|ver|bản|chuẩn|beat|mono|sơn tùng|m-tp|mtp|đen vâu|đen|trịnh thăng bình|vũ\.|vũ|hoàng dũng|ngọt|chillies|hieuthuhai|mck|wren evans|tlinh|low g|double2t|grey d)/iu', ' ', $clean);
        $clean = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $clean);
        $words = array_values(array_filter(explode(' ', trim($clean)), function ($w) {
            return mb_strlen($w) >= 2 && !in_array($w, ['nhac', 'nhạc', 'hay', 'nhat', 'nhất', 'bxh', 'top', 'dj', 'prod', 'by', 'the', 'and', 'trai', 'gai', 'nam', 'nu']);
        }));

        return implode(' ', array_slice($words, 0, 2));
    }

    /**
     * Fast parser for YouTubei JSON response
     */
    protected function parseYouTubeiResults(?string $jsonStr): array
    {
        if (empty($jsonStr)) return [];

        $data = json_decode($jsonStr, true);
        $sections = $data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'] ?? [];
        $tracks = [];

        foreach ($sections as $item) {
            if (isset($item['videoRenderer'])) {
                $vr = $item['videoRenderer'];
                $title = $vr['title']['runs'][0]['text'] ?? '';
                $videoId = $vr['videoId'] ?? '';
                $channel = $vr['ownerText']['runs'][0]['text'] ?? 'Open Creator';
                $durationText = $vr['lengthText']['simpleText'] ?? '3:45';
                $viewCountText = $vr['viewCountText']['simpleText'] ?? ($vr['shortViewCountText']['simpleText'] ?? '1.5M');

                if (empty($videoId) || empty($title) || empty($vr['lengthText'])) continue;

                $thumbnail = "https://i.ytimg.com/vi/{$videoId}/hqdefault.jpg";
                $durationSeconds = $this->parseDurationText($durationText);

                $tracks[] = [
                    'id' => 'yt_' . $videoId,
                    'youtube_id' => $videoId,
                    'title' => $title,
                    'duration' => $durationSeconds,
                    'duration_formatted' => $durationText,
                    'audio_url' => "https://www.youtube.com/watch?v={$videoId}",
                    'cover_url' => $thumbnail,
                    'display_cover_url' => $thumbnail,
                    'plays_count' => $this->parsePlaysCount($viewCountText),
                    'genre' => 'Remix & Open Sound',
                    'waveform_data' => $this->generateWaveform($videoId),
                    'lyrics_lrc' => "[00:00.00] (VanhSound Open Remix • Full {$durationText})\n[00:05.00] Đang phát: {$title}\n[00:10.00] Kênh phát hành: {$channel}\n[00:15.00] Thưởng thức trọn vẹn toàn bộ bài hát chất lượng cao không giới hạn...",
                    'source' => 'youtube',
                    'artist' => [
                        'id' => 'art_yt_' . Str::slug($channel),
                        'name' => $channel,
                        'slug' => Str::slug($channel),
                        'avatar_url' => $thumbnail,
                        'monthly_listeners' => rand(1200000, 25000000),
                        'is_verified' => true,
                    ],
                    'album' => [
                        'id' => 'alb_yt_' . $videoId,
                        'title' => $title . ' (Full Track)',
                        'slug' => Str::slug($title . '-full'),
                        'cover_url' => $thumbnail,
                        'type' => 'single',
                    ],
                ];

                if (count($tracks) >= 12) break;
            }
        }

        return $tracks;
    }

    /**
     * Standardize Audius track object
     */
    public function formatAudiusTrack(array $track): array
    {
        $id = $track['id'] ?? uniqid();
        $title = $track['title'] ?? 'Untitled Track';
        $user = $track['user'] ?? [];
        $artistName = $user['name'] ?? ($user['handle'] ?? 'Audius Creator');
        $duration = (int)($track['duration'] ?? 180);
        $host = $this->getAudiusHost();

        $artwork = $track['artwork']['480x480'] 
            ?? ($track['artwork']['1000x1000'] 
            ?? ($track['artwork']['150x150'] 
            ?? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'));

        $avatar = $user['profile_picture']['150x150'] 
            ?? ($user['profile_picture']['480x480'] 
            ?? $artwork);

        $streamUrl = "{$host}/v1/tracks/{$id}/stream?app_name={$this->appName}";

        return [
            'id' => 'audius_' . $id,
            'title' => $title,
            'duration' => $duration,
            'duration_formatted' => sprintf('%d:%02d', floor($duration / 60), $duration % 60),
            'audio_url' => $streamUrl,
            'cover_url' => $artwork,
            'display_cover_url' => $artwork,
            'plays_count' => (int)($track['play_count'] ?? rand(50000, 5000000)),
            'genre' => $track['genre'] ?? 'EDM & Remix',
            'waveform_data' => $this->generateWaveform($id),
            'lyrics_lrc' => "[00:00.00] (Audius Open Network • 320kbps Full Track)\n[00:06.00] Đang phát: {$title}\n[00:12.00] Nghệ sĩ: {$artistName}\n[00:18.00] Thưởng thức trọn vẹn bản thu chất lượng cao không giới hạn...",
            'source' => 'audius',
            'artist' => [
                'id' => 'art_audius_' . ($user['id'] ?? $id),
                'name' => $artistName,
                'slug' => Str::slug($artistName),
                'avatar_url' => $avatar,
                'monthly_listeners' => rand(120000, 4800000),
                'is_verified' => true,
            ],
            'album' => [
                'id' => 'alb_audius_' . $id,
                'title' => $title . ' (Original Full Track)',
                'slug' => Str::slug($title . '-single'),
                'cover_url' => $artwork,
                'type' => 'single',
            ],
        ];
    }

    protected function parseDurationText(string $text): int
    {
        $parts = array_map('intval', explode(':', $text));
        if (count($parts) === 3) {
            return $parts[0] * 3600 + $parts[1] * 60 + $parts[2];
        } elseif (count($parts) === 2) {
            return $parts[0] * 60 + $parts[1];
        }
        return 210;
    }

    protected function parsePlaysCount(string $text): int
    {
        if (preg_match('/([\d\.,]+)\s*([M|K|Tr|N|k|m]?)/i', $text, $m)) {
            $num = floatval(str_replace(',', '.', $m[1]));
            $unit = strtolower($m[2] ?? '');
            if ($unit === 'm' || $unit === 'tr') {
                return (int)($num * 1000000);
            } elseif ($unit === 'k' || $unit === 'n') {
                return (int)($num * 1000);
            }
            return (int)$num;
        }
        return rand(1000000, 25000000);
    }

    protected function generateWaveform($seed): array
    {
        $hash = crc32((string)$seed);
        $bars = [];
        for ($i = 0; $i < 75; $i++) {
            $val = 0.2 + 0.65 * abs(sin(($i + $hash % 10) / 4.8)) + (rand(-10, 15) / 100);
            $bars[] = round(max(0.12, min(0.98, $val)), 2);
        }
        return $bars;
    }
}
