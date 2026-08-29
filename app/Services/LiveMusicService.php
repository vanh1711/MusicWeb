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
     * Fetch trending tracks from Audius with caching
     */
    public function getAudiusTrending(int $limit = 12): array
    {
        return Cache::remember('audius_trending_v6', 600, function () use ($limit) {
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
     * Smart Genre-, Mood- and Duration-Aware Recommendations (Autoplay Radio)
     * Recommends DIFFERENT random tracks of the same vibe and duration, filtering out same-song duplicates!
     */
    public function getRecommendations(string $title, ?string $artistName = null, ?string $currentTrackId = null, int $currentDuration = 240): array
    {
        $cleanTitle = trim($title);
        $cleanArtist = trim($artistName ?: '');
        $lowerTitle = mb_strtolower($cleanTitle . ' ' . $cleanArtist);

        // 1. Detect Category / Vibe
        $isRemix = str_contains($lowerTitle, 'remix') || str_contains($lowerTitle, 'vinahouse') || str_contains($lowerTitle, 'viet mix') || str_contains($lowerTitle, 'speed up') || str_contains($lowerTitle, 'nightcore');
        $isChill = str_contains($lowerTitle, 'chill') || str_contains($lowerTitle, 'lofi') || str_contains($lowerTitle, 'acoustic') || str_contains($lowerTitle, 'indie') || str_contains($lowerTitle, 'đen') || str_contains($lowerTitle, 'vũ') || str_contains($lowerTitle, 'chillies') || str_contains($lowerTitle, 'hoàng dũng');
        $isRap = str_contains($lowerTitle, 'rap') || str_contains($lowerTitle, 'hip hop') || str_contains($lowerTitle, 'hieuthuhai') || str_contains($lowerTitle, 'mck') || str_contains($lowerTitle, 'wren') || str_contains($lowerTitle, 'tlinh') || str_contains($lowerTitle, 'low g');
        $isLongSet = $currentDuration > 1200; // > 20 minutes nonstop

        // 2. Select rich, diverse query pools based on vibe
        if ($isLongSet) {
            $pool = [
                'nonstop vinahouse 2026 cực căng bass',
                'vietmix nonstop hot tiktok 2026',
                'nhạc edm nonstop bass cực mạnh quẩy',
            ];
        } elseif ($isRemix) {
            $pool = [
                'nhạc trẻ remix hot tiktok 2026',
                'top bài hát remix việt nam thịnh hành',
                'bật tình yêu lên remix',
                'cắt đôi nỗi sầu remix',
                'ngày chưa giông bão remix',
                'lạc trôi remix triple d',
                'bên trên tầng lầu remix',
                'waiting for you remix mono',
                'tướng quân remix',
                'đúng nhận sai cãi remix',
            ];
        } elseif ($isChill) {
            $pool = [
                'nhạc indie việt hay nhất',
                'vũ bước qua nhau lạ lùng',
                'chillies vùng ký ức mascara có em đời bỗng vui',
                'hoàng dũng nàng thơ đôi lời đoạn kết mới',
                'đen vâu trốn tìm lối nhỏ đi về nhà mười năm',
                'nhạc lofi việt nhẹ nhàng thư giãn',
                'ngọt bài ca say em dạo này',
                'thịnh suy một đêm say chuyen rang',
            ];
        } elseif ($isRap) {
            $pool = [
                'hieuthuhai không thể say hẹn gặp em dưới ánh trăng ngủ một mình',
                'mck chìm sâu tại vì sao va vào giai điệu này',
                'wren evans từng quen bé iu call me',
                'rap việt hot trend triệu view',
                'double2t à lôi người miền núi chất',
                'grey d đưa em về nhà vaicaunoicokhiennguoithaydoi',
            ];
        } else {
            $pool = [
                'top hits vpop 2026 triệu view',
                'sơn tùng mtp đừng làm trái tim anh đau',
                'mono em là waiting for you',
                'vũ cát tường từng là',
                'phương mỹ chi bóng phù hoa vũ trụ có anh',
                'trịnh thăng bình người ấy tâm sự tuổi 30',
                'nhạc edm audius trending',
            ];
        }

        // Randomize pool and pick 2 distinct queries
        shuffle($pool);
        $selectedQueries = array_slice($pool, 0, 2);

        $collectedTracks = [];
        foreach ($selectedQueries as $q) {
            $res = $this->searchUnified($q);
            if (!empty($res['tracks'])) {
                $collectedTracks = array_merge($collectedTracks, $res['tracks']);
            }
        }

        // 3. Extract core words of the current song to filter out same-song duplicates
        $cleanWords = preg_replace('/(\(.*?\)|\(.*|\[.*?\]|ft\..*?|-|\/)/i', ' ', mb_strtolower($cleanTitle));
        $titleKeywords = array_values(array_filter(explode(' ', $cleanWords), function ($w) {
            return mb_strlen($w) >= 3 && !in_array($w, ['nhạc', 'bản', 'full', 'official', 'video', 'audio', 'remix', 'beat', 'lyric', 'lyrics', 'cover', 'live']);
        }));

        // 4. Strict filtering:
        //    - Must be a DIFFERENT song
        //    - Must have SIMILAR duration
        //    - Must not be a reaction, karaoke beat, or tutorial
        $filtered = array_values(array_filter($collectedTracks, function ($t) use ($currentTrackId, $titleKeywords, $isLongSet, $currentDuration) {
            if ($currentTrackId && $t['id'] === $currentTrackId) return false;
            if (isset($t['youtube_id']) && $currentTrackId && str_contains($currentTrackId, $t['youtube_id'])) return false;

            $tTitleLower = mb_strtolower($t['title']);

            // Filter out same-song variations (e.g. Live, Karaoke, Reaction of the same song)
            if (count($titleKeywords) > 0) {
                $matchCount = 0;
                foreach ($titleKeywords as $kw) {
                    if (str_contains($tTitleLower, $kw)) {
                        $matchCount++;
                    }
                }
                if ($matchCount >= min(2, count($titleKeywords))) {
                    return false;
                }
            }

            // Exclude noise titles
            if (str_contains($tTitleLower, 'reaction') || str_contains($tTitleLower, 'karaoke') || str_contains($tTitleLower, 'hướng dẫn') || str_contains($tTitleLower, 'review')) {
                return false;
            }

            // Duration matching
            $tDuration = (int)($t['duration'] ?? 200);
            if (!$isLongSet) {
                // For normal songs (3-6 mins): exclude 1-2 hour livestreams and clips < 60s
                if ($tDuration > 600 || $tDuration < 60) return false;
            } else {
                // For nonstop sets: must be > 15 mins
                if ($tDuration < 900) return false;
            }

            return true;
        }));

        // 5. Deduplicate by unique track ID & title
        $unique = [];
        $seen = [];
        foreach ($filtered as $t) {
            $key = $t['id'] . '_' . Str::slug($t['title']);
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $unique[] = $t;
            }
        }

        // 6. Shuffle for fresh, exciting variety every time
        shuffle($unique);

        return array_slice($unique, 0, 15);
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
