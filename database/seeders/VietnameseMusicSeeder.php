<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Genre;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Track;
use App\Models\Playlist;
use App\Models\Comment;
use App\Models\Favorite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VietnameseMusicSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        $user = User::skip(1)->first() ?: $admin;

        // Generate realistic 75-bar waveform data
        $generateWaveform = function ($seed = 1) {
            $bars = [];
            for ($i = 0; $i < 75; $i++) {
                $val = 0.2 + 0.65 * abs(sin(($i + $seed * 3) / 4.8)) + (rand(-10, 15) / 100);
                $bars[] = round(max(0.12, min(0.98, $val)), 2);
            }
            return $bars;
        };

        // 1. Genres
        $vpop = Genre::firstOrCreate(['slug' => 'v-pop'], [
            'name' => 'V-Pop Thịnh Hành',
            'color_accent' => '#EC4899',
            'cover_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        ]);

        $rapviet = Genre::firstOrCreate(['slug' => 'rap-viet'], [
            'name' => 'Rap Việt & Hip-Hop',
            'color_accent' => '#F59E0B',
            'cover_url' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        ]);

        $indieviet = Genre::firstOrCreate(['slug' => 'indie-viet'], [
            'name' => 'Indie & Acoustic Việt',
            'color_accent' => '#10B981',
            'cover_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        ]);

        $vinahouse = Genre::firstOrCreate(['slug' => 'remix-vinahouse'], [
            'name' => 'Remix & Vinahouse',
            'color_accent' => '#8B5CF6',
            'cover_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        ]);

        // 2. Fetch real official tracks from Apple Music / iTunes API for top Vietnamese artists
        $artistDefinitions = [
            [
                'name' => 'Sơn Tùng M-TP',
                'slug' => 'son-tung-m-tp',
                'genre_id' => $vpop->id,
                'bio' => 'Nghệ sĩ biểu tượng của V-Pop hiện đại, sáng lập M-TP Entertainment với hàng loạt kỷ lục âm nhạc kỷ nguyên số.',
                'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 12890400,
                'is_verified' => true,
                'search_query' => 'Sơn Tùng M-TP',
            ],
            [
                'name' => 'Đen Vâu',
                'slug' => 'den-vau',
                'genre_id' => $rapviet->id,
                'bio' => 'Rapper truyền cảm hứng hàng đầu Việt Nam với những ca từ mộc mạc, triết lý sống gần gũi và sâu sắc.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 9450200,
                'is_verified' => true,
                'search_query' => 'Đen Vâu',
            ],
            [
                'name' => 'HIEUTHUHAI',
                'slug' => 'hieuthuhai',
                'genre_id' => $rapviet->id,
                'bio' => 'Thành viên GERDNANG, hiện tượng Rap Việt thế hệ mới với phong cách thời thượng, flow cuốn hút.',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 8720100,
                'is_verified' => true,
                'search_query' => 'HIEUTHUHAI',
            ],
            [
                'name' => 'Vũ.',
                'slug' => 'vu',
                'genre_id' => $indieviet->id,
                'bio' => '"Hoàng tử Indie Việt" với chất giọng trầm ấm, những bản tình ca da diết đi sâu vào tâm hồn người nghe.',
                'avatar_url' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 6410300,
                'is_verified' => true,
                'search_query' => 'Vũ.',
            ],
            [
                'name' => 'Chillies',
                'slug' => 'chillies',
                'genre_id' => $indieviet->id,
                'bio' => 'Ban nhạc Pop Rock / Indie tài năng với các bản hit bùng nổ cảm xúc như Mascara, Vùng Ký Ức, Giấc Mơ Khác.',
                'avatar_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 5890200,
                'is_verified' => true,
                'search_query' => 'Chillies',
            ],
            [
                'name' => 'MONO',
                'slug' => 'mono',
                'genre_id' => $vpop->id,
                'bio' => 'Nghệ sĩ trẻ đột phá với album đầu tay 22 và bản hit quốc dân Waiting For You khuấy đảo làng nhạc.',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 4920100,
                'is_verified' => true,
                'search_query' => 'MONO',
            ],
            [
                'name' => 'Trịnh Thăng Bình',
                'slug' => 'trinh-thang-binh',
                'genre_id' => $vpop->id,
                'bio' => 'Ca sĩ, nhạc sĩ và nhà sản xuất âm nhạc tài hoa với bản hit Người Ấy, Tâm Sự Tuổi 30.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 3800000,
                'is_verified' => true,
                'search_query' => 'Trịnh Thăng Bình',
            ],
            [
                'name' => 'Hoài Lâm',
                'slug' => 'hoai-lam',
                'genre_id' => $indieviet->id,
                'bio' => 'Giọng ca ballad truyền cảm sâu lắng với các ca khúc bất hủ Hoa Nở Không Màu, Buồn Làm Chi Em Ơi.',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 4200000,
                'is_verified' => true,
                'search_query' => 'Hoài Lâm',
            ],
        ];

        $allCreatedTracks = [];

        foreach ($artistDefinitions as $aIndex => $aDef) {
            $artist = Artist::updateOrCreate(
                ['slug' => $aDef['slug']],
                [
                    'name' => $aDef['name'],
                    'genre_id' => $aDef['genre_id'],
                    'bio' => $aDef['bio'],
                    'avatar_url' => $aDef['avatar_url'],
                    'banner_url' => $aDef['banner_url'],
                    'monthly_listeners' => $aDef['monthly_listeners'],
                    'is_verified' => true,
                ]
            );

            // Fetch live tracks from Apple Music API
            $apiUrl = 'https://itunes.apple.com/search?term=' . urlencode($aDef['search_query']) . '&media=music&limit=6&country=VN';
            $ctx = stream_context_create(['http' => ['timeout' => 5, 'header' => 'User-Agent: Mozilla/5.0']]);
            $response = @file_get_contents($apiUrl, false, $ctx);
            $results = [];

            if ($response) {
                $json = json_decode($response, true);
                $results = $json['results'] ?? [];
            }

            if (!empty($results)) {
                foreach ($results as $tIndex => $r) {
                    $trackTitle = $r['trackName'] ?? 'Untitled';
                    $albumTitle = $r['collectionName'] ?? ($trackTitle . ' - Single');
                    $albumSlug = Str::slug($albumTitle . '-' . $artist->id);

                    // High-res 600x600 cover
                    $coverUrl = isset($r['artworkUrl100'])
                        ? str_replace('100x100bb.jpg', '600x600bb.jpg', $r['artworkUrl100'])
                        : $aDef['avatar_url'];

                    $previewAudio = $r['previewUrl'] ?? null;
                    if (!$previewAudio) continue;

                    $album = Album::firstOrCreate(
                        ['slug' => $albumSlug],
                        [
                            'artist_id' => $artist->id,
                            'title' => $albumTitle,
                            'cover_url' => $coverUrl,
                            'release_date' => isset($r['releaseDate']) ? substr($r['releaseDate'], 0, 10) : '2024-01-01',
                            'type' => 'album',
                        ]
                    );

                    // Generate Vietnamese synchronized lyrics snippet
                    $lyrics = "[00:00.00] (VanhSound Official Master Stream)\n[00:05.00] Đang phát: {$trackTitle}\n[00:10.00] Nghệ sĩ: {$artist->name}\n[00:15.00] Thưởng thức chất lượng âm thanh 320kbps Lossless trên VanhSound...\n[00:25.00] (Điệp khúc)";

                    $track = Track::updateOrCreate(
                        [
                            'artist_id' => $artist->id,
                            'title' => $trackTitle,
                        ],
                        [
                            'album_id' => $album->id,
                            'duration' => isset($r['trackTimeMillis']) ? (int)round($r['trackTimeMillis'] / 1000) : 210,
                            'audio_url' => $previewAudio,
                            'cover_url' => $coverUrl,
                            'lyrics_lrc' => $lyrics,
                            'waveform_data' => $generateWaveform($aIndex * 10 + $tIndex),
                            'plays_count' => rand(12000000, 65000000),
                            'track_number' => $tIndex + 1,
                            'is_featured' => true,
                        ]
                    );

                    $allCreatedTracks[] = $track;

                    // Seed timed comments for track
                    if ($tIndex === 0) {
                        Comment::updateOrCreate(
                            ['track_id' => $track->id, 'timestamp_seconds' => 10],
                            ['user_id' => $admin->id, 'content' => "Giai điệu {$trackTitle} nghe cực kỳ cuốn hút! 🔥"]
                        );
                        Comment::updateOrCreate(
                            ['track_id' => $track->id, 'timestamp_seconds' => 25],
                            ['user_id' => $user->id, 'content' => "Đoạn này lên nốt cao đỉnh thật sự ❤️ {$artist->name} number 1!"]
                        );
                    }
                }
            }
        }

        // 3. Featured Playlists
        if (!empty($allCreatedTracks)) {
            $sonTungPlaylist = Playlist::updateOrCreate(
                ['title' => 'Tuyển Tập Sơn Tùng M-TP (Best of M-TP)'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Toàn bộ những siêu phẩm làm nên tên tuổi của Sơn Tùng M-TP trên VanhSound.',
                    'cover_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
                    'is_public' => true,
                    'is_featured' => true,
                ]
            );

            $sonTungTracks = Track::whereHas('artist', function ($q) {
                $q->where('slug', 'son-tung-m-tp');
            })->pluck('id');

            $syncData = [];
            foreach ($sonTungTracks as $pos => $tid) {
                $syncData[$tid] = ['position' => $pos + 1];
            }
            $sonTungPlaylist->tracks()->sync($syncData);

            // V-Pop Trending 2026
            $vpopPlaylist = Playlist::updateOrCreate(
                ['title' => 'Top Hits V-Pop & Rap Việt 2026'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Những bài hát thịnh hành nhất Việt Nam từ Sơn Tùng M-TP, Đen Vâu, HIEUTHUHAI, Vũ, Chillies, MONO.',
                    'cover_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
                    'is_public' => true,
                    'is_featured' => true,
                ]
            );

            $top10Tracks = Track::orderBy('plays_count', 'desc')->take(10)->pluck('id');
            $vpopSync = [];
            foreach ($top10Tracks as $pos => $tid) {
                $vpopSync[$tid] = ['position' => $pos + 1];
            }
            $vpopPlaylist->tracks()->sync($vpopSync);
        }
    }
}
