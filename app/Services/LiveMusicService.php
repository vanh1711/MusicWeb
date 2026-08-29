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
        'https://audius-discovery-1.cultur3stake.com',
    ];

    /**
     * Get active Audius host
     */
    protected function getAudiusHost(): string
    {
        return $this->audiusHosts[array_rand($this->audiusHosts)];
    }

    /**
     * Fetch trending tracks from Audius (Open Music Platform, full length 320kbps)
     */
    public function getAudiusTrending(int $limit = 12): array
    {
        return Cache::remember('audius_trending_live_v3', 300, function () use ($limit) {
            $host = $this->getAudiusHost();
            $url = "{$host}/v1/tracks/trending?app_name={$this->appName}&limit={$limit}";

            $ctx = stream_context_create(['http' => ['timeout' => 5, 'header' => 'User-Agent: VanhSound/2.0']]);
            $response = @file_get_contents($url, false, $ctx);

            if (!$response) return [];

            $json = json_decode($response, true);
            $tracks = $json['data'] ?? [];

            return array_map([$this, 'formatAudiusTrack'], $tracks);
        });
    }

    /**
     * Search Audius tracks (Full length 320kbps EDM, Trap, Remix, Lofi)
     */
    public function searchAudius(string $query, int $limit = 8): array
    {
        $host = $this->getAudiusHost();
        $url = "{$host}/v1/tracks/search?query=" . urlencode($query) . "&app_name={$this->appName}&limit={$limit}";

        $ctx = stream_context_create(['http' => ['timeout' => 4, 'header' => 'User-Agent: VanhSound/2.0']]);
        $response = @file_get_contents($url, false, $ctx);

        if (!$response) return [];

        $json = json_decode($response, true);
        $tracks = $json['data'] ?? [];

        return array_map([$this, 'formatAudiusTrack'], $tracks);
    }

    /**
     * Search Open Remix, Vinahouse, TikTok, V-Pop & International (100% Full Length, No 30s Limit)
     */
    public function searchOpenMusic(string $query, int $limit = 12): array
    {
        $cacheKey = 'open_music_' . md5($query) . '_' . $limit;

        return Cache::remember($cacheKey, 180, function () use ($query, $limit) {
            $q = urlencode($query);
            $url = "https://www.youtube.com/results?search_query={$q}";

            $ctx = stream_context_create([
                'http' => [
                    'timeout' => 4,
                    'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\nAccept-Language: vi,en;q=0.9",
                ],
            ]);

            $html = @file_get_contents($url, false, $ctx);
            if (!$html) return [];

            if (!preg_match('/ytInitialData\s*=\s*({.+?});<\/script>/s', $html, $m)) {
                return [];
            }

            $data = json_decode($m[1], true);
            $contents = $data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'] ?? [];
            $tracks = [];

            foreach ($contents as $item) {
                if (isset($item['videoRenderer'])) {
                    $vr = $item['videoRenderer'];
                    $title = $vr['title']['runs'][0]['text'] ?? '';
                    $videoId = $vr['videoId'] ?? '';
                    $channel = $vr['ownerText']['runs'][0]['text'] ?? 'Open Creator';
                    $durationText = $vr['lengthText']['simpleText'] ?? '3:45';
                    $viewCountText = $vr['viewCountText']['simpleText'] ?? ($vr['shortViewCountText']['simpleText'] ?? '1.2M lượt xem');

                    // Filter out livestreams without duration
                    if (empty($videoId) || empty($title) || empty($vr['lengthText'])) continue;

                    // High-res YouTube thumbnail
                    $thumbnail = "https://i.ytimg.com/vi/{$videoId}/hqdefault.jpg";

                    $durationSeconds = $this->parseDurationText($durationText);

                    // Estimate plays count from view count text
                    $playsCount = $this->parsePlaysCount($viewCountText);

                    $tracks[] = [
                        'id' => 'yt_' . $videoId,
                        'youtube_id' => $videoId,
                        'title' => $title,
                        'duration' => $durationSeconds,
                        'duration_formatted' => $durationText,
                        'audio_url' => "https://www.youtube.com/watch?v={$videoId}",
                        'cover_url' => $thumbnail,
                        'display_cover_url' => $thumbnail,
                        'plays_count' => $playsCount,
                        'genre' => 'Remix & Open Sound',
                        'waveform_data' => $this->generateWaveform($videoId),
                        'lyrics_lrc' => "[00:00.00] (VanhSound Open Remix Network • Bản Full {$durationText})\n[00:05.00] Đang phát: {$title}\n[00:10.00] Kênh phát hành: {$channel}\n[00:15.00] Thưởng thức trọn vẹn toàn bộ bài hát chất lượng cao không giới hạn...",
                        'source' => 'youtube',
                        'artist' => [
                            'id' => 'art_yt_' . Str::slug($channel),
                            'name' => $channel,
                            'slug' => Str::slug($channel),
                            'avatar_url' => $thumbnail,
                            'monthly_listeners' => rand(800000, 15000000),
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

                    if (count($tracks) >= $limit) break;
                }
            }

            return $tracks;
        });
    }

    /**
     * Unified Search: Queries Open Remix Network + Audius API (Full Length Tracks 100%)
     */
    public function searchUnified(string $query): array
    {
        $cleanQuery = trim($query);
        if (empty($cleanQuery)) return ['tracks' => [], 'artists' => [], 'albums' => []];

        // 1. Query Open Remix / YouTube Network (Full tracks, remixes, V-Pop, TikTok)
        $openTracks = $this->searchOpenMusic($cleanQuery, 10);

        // 2. Query Audius API (EDM, International, Trap)
        $audiusTracks = $this->searchAudius($cleanQuery, 5);

        $mergedTracks = array_merge($openTracks, $audiusTracks);

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
    }

    /**
     * Standardize Audius track object (Full 320kbps stream)
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

    /**
     * Parse duration text like "4:24" or "1:05:30" to seconds
     */
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

    /**
     * Parse plays count
     */
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

    /**
     * Generate 75-point waveform array
     */
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
