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
        $admin = User::firstOrCreate(
            ['email' => 'admin@vanhsound.com'],
            ['name' => 'VanhSound Admin', 'password' => bcrypt('password'), 'role' => 'admin']
        );
        $user = User::firstOrCreate(
            ['email' => 'user@vanhsound.com'],
            ['name' => 'Vanh Sound Listener', 'password' => bcrypt('password'), 'role' => 'user']
        );

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

        // 2. Official authentic artwork & real profiles for top Vietnamese artists
        $artistDefinitions = [
            [
                'name' => 'Sơn Tùng M-TP',
                'slug' => 'son-tung-m-tp',
                'genre_id' => $vpop->id,
                'bio' => 'Nghệ sĩ biểu tượng của V-Pop hiện đại, sáng lập M-TP Entertainment với hàng loạt kỷ lục âm nhạc kỷ nguyên số.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e3/0b/38/e30b383e-5818-321a-7626-557b7b0f8ba3/24UMGIM61359.rgb.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e3/0b/38/e30b383e-5818-321a-7626-557b7b0f8ba3/24UMGIM61359.rgb.jpg/600x600bb.jpg',
                'monthly_listeners' => 14890400,
                'is_verified' => true,
                'search_query' => 'Sơn Tùng M-TP',
            ],
            [
                'name' => 'Đen Vâu',
                'slug' => 'den-vau',
                'genre_id' => $rapviet->id,
                'bio' => 'Rapper truyền cảm hứng hàng đầu Việt Nam với những ca từ mộc mạc, triết lý sống gần gũi và sâu sắc.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/06/3e/9a/063e9a8f-1383-c601-efda-347e7d02ba66/cover.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/06/3e/9a/063e9a8f-1383-c601-efda-347e7d02ba66/cover.jpg/600x600bb.jpg',
                'monthly_listeners' => 10450200,
                'is_verified' => true,
                'search_query' => 'Đen Vâu',
            ],
            [
                'name' => 'HIEUTHUHAI',
                'slug' => 'hieuthuhai',
                'genre_id' => $rapviet->id,
                'bio' => 'Thành viên GERDNANG, hiện tượng Rap Việt thế hệ mới với phong cách thời thượng, flow cuốn hút.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/57/17/67/571767f9-c14c-9765-96a2-73586df71b73/602438561919_Cover.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/57/17/67/571767f9-c14c-9765-96a2-73586df71b73/602438561919_Cover.jpg/600x600bb.jpg',
                'monthly_listeners' => 9720100,
                'is_verified' => true,
                'search_query' => 'HIEUTHUHAI',
            ],
            [
                'name' => 'Vũ.',
                'slug' => 'vu',
                'genre_id' => $indieviet->id,
                'bio' => '"Hoàng tử Indie Việt" với chất giọng trầm ấm, những bản tình ca da diết đi sâu vào tâm hồn người nghe.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/21/40/f8/2140f8b1-e47b-f1cc-ba6b-c97dbb9878bb/5054197340369.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/21/40/f8/2140f8b1-e47b-f1cc-ba6b-c97dbb9878bb/5054197340369.jpg/600x600bb.jpg',
                'monthly_listeners' => 7410300,
                'is_verified' => true,
                'search_query' => 'Vũ.',
            ],
            [
                'name' => 'Chillies',
                'slug' => 'chillies',
                'genre_id' => $indieviet->id,
                'bio' => 'Ban nhạc Pop Rock / Indie tài năng với các bản hit bùng nổ cảm xúc như Mascara, Vùng Ký Ức, Giấc Mơ Khác.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e6/3d/ee/e63deea0-079a-c9d5-a2cc-93fab07b8752/190296722745.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e6/3d/ee/e63deea0-079a-c9d5-a2cc-93fab07b8752/190296722745.jpg/600x600bb.jpg',
                'monthly_listeners' => 6890200,
                'is_verified' => true,
                'search_query' => 'Chillies',
            ],
            [
                'name' => 'MONO',
                'slug' => 'mono',
                'genre_id' => $vpop->id,
                'bio' => 'Nghệ sĩ trẻ đột phá với album đầu tay 22 và bản hit quốc dân Waiting For You khuấy đảo làng nhạc.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/db/92/be/db92be06-0d95-ecff-858f-385c247ba063/198704207853_Cover.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/db/92/be/db92be06-0d95-ecff-858f-385c247ba063/198704207853_Cover.jpg/600x600bb.jpg',
                'monthly_listeners' => 5920100,
                'is_verified' => true,
                'search_query' => 'MONO',
            ],
            [
                'name' => 'Tăng Duy Tân',
                'slug' => 'tang-duy-tan',
                'genre_id' => $vpop->id,
                'bio' => 'Hit-maker hàng đầu V-Pop với hàng loạt bản hit đình đám Châu Á như Bên Trên Tầng Lầu, Cắt Đôi Nỗi Sầu, Bật Tình Yêu Lên.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ae/63/ca/ae63ca86-defa-42ab-f179-04fb44599606/190296490101.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ae/63/ca/ae63ca86-defa-42ab-f179-04fb44599606/190296490101.jpg/600x600bb.jpg',
                'monthly_listeners' => 6200000,
                'is_verified' => true,
                'search_query' => 'Tăng Duy Tân',
            ],
            [
                'name' => 'Hoàng Dũng',
                'slug' => 'hoang-dung',
                'genre_id' => $indieviet->id,
                'bio' => 'Nhạc sĩ, ca sĩ nổi tiếng với chất nhạc tự sự sâu lắng qua các tác phẩm Nàng Thơ, Yếu Đuối, Đôi Lời.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1e/78/0d/1e780d6a-074f-81c1-f071-fe372b3528a2/cover.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1e/78/0d/1e780d6a-074f-81c1-f071-fe372b3528a2/cover.jpg/600x600bb.jpg',
                'monthly_listeners' => 4500000,
                'is_verified' => true,
                'search_query' => 'Hoàng Dũng',
            ],
            [
                'name' => 'Hòa Minzy',
                'slug' => 'hoa-minzy',
                'genre_id' => $vpop->id,
                'bio' => 'Nữ ca sĩ sở hữu giọng hát nội lực bậc nhất V-Pop với các siêu phẩm Thị Mầu, Không Thể Cùng Nhau Suốt Kiếp, Bật Tình Yêu Lên.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/10/c4/27/10c427fb-9134-6266-9bc7-fd9b8eec4aa4/199066937518.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/10/c4/27/10c427fb-9134-6266-9bc7-fd9b8eec4aa4/199066937518.jpg/600x600bb.jpg',
                'monthly_listeners' => 5100000,
                'is_verified' => true,
                'search_query' => 'Hòa Minzy',
            ],
            [
                'name' => 'Trịnh Thăng Bình',
                'slug' => 'trinh-thang-binh',
                'genre_id' => $vpop->id,
                'bio' => 'Ca sĩ, nhạc sĩ và nhà sản xuất âm nhạc tài hoa với bản hit quốc dân Người Ấy, Tâm Sự Tuổi 30, Khác Biệt To Lớn.',
                'avatar_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/03/c1/d0/03c1d015-2abb-60d6-56d5-707a3fba0273/3617050146441.jpg/600x600bb.jpg',
                'banner_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/03/c1/d0/03c1d015-2abb-60d6-56d5-707a3fba0273/3617050146441.jpg/600x600bb.jpg',
                'monthly_listeners' => 3800000,
                'is_verified' => true,
                'search_query' => 'Trịnh Thăng Bình',
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
                            'duration' => isset($r['trackTimeMillis']) ? (int)round($r['trackTimeMillis'] / 1000) : 240,
                            'audio_url' => null,
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

        // 3. Featured Playlists with Authentic Artwork
        if (!empty($allCreatedTracks)) {
            $sonTungPlaylist = Playlist::updateOrCreate(
                ['title' => 'Tuyển Tập Sơn Tùng M-TP (Best of M-TP)'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Toàn bộ những siêu phẩm làm nên tên tuổi của Sơn Tùng M-TP trên VanhSound.',
                    'cover_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e3/0b/38/e30b383e-5818-321a-7626-557b7b0f8ba3/24UMGIM61359.rgb.jpg/600x600bb.jpg',
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
                    'description' => 'Những bài hát thịnh hành nhất Việt Nam từ Sơn Tùng M-TP, Đen Vâu, HIEUTHUHAI, Vũ., Chillies, MONO, Tăng Duy Tân.',
                    'cover_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/db/92/be/db92be06-0d95-ecff-858f-385c247ba063/198704207853_Cover.jpg/600x600bb.jpg',
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

            // Vinahouse & Remix Hot TikTok
            $remixPlaylist = Playlist::updateOrCreate(
                ['title' => 'Vinahouse & TikTok Remix Cực Cháy'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Những bản phối Remix, Vinahouse bốc lửa khuấy đảo TikTok Việt Nam.',
                    'cover_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ae/63/ca/ae63ca86-defa-42ab-f179-04fb44599606/190296490101.jpg/600x600bb.jpg',
                    'is_public' => true,
                    'is_featured' => true,
                ]
            );

            // Indie & Acoustic Chill
            $indiePlaylist = Playlist::updateOrCreate(
                ['title' => 'Indie & Acoustic Việt Chill Đêm Khuya'],
                [
                    'user_id' => $admin->id,
                    'description' => 'Những giai điệu acoustic mộc mạc, sâu lắng từ Vũ., Chillies, Hoàng Dũng, Thịnh Suy.',
                    'cover_url' => 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/21/40/f8/2140f8b1-e47b-f1cc-ba6b-c97dbb9878bb/5054197340369.jpg/600x600bb.jpg',
                    'is_public' => true,
                    'is_featured' => true,
                ]
            );
        }
    }
}
