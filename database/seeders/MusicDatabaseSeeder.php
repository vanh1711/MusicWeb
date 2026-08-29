<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Genre;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Track;
use App\Models\Playlist;
use App\Models\Favorite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MusicDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Demo Users
        $admin = User::create([
            'name' => 'Alex Rivera',
            'email' => 'admin@musicweb.io',
            'password' => Hash::make('password123'),
            'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            'role' => 'admin',
        ]);

        $user = User::create([
            'name' => 'Sarah Connor',
            'email' => 'sarah@musicweb.io',
            'password' => Hash::make('password123'),
            'avatar_url' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            'role' => 'user',
        ]);

        // 2. Create Genres
        $genresData = [
            [
                'name' => 'Synthwave & Retro',
                'slug' => 'synthwave',
                'color_accent' => '#8B5CF6',
                'cover_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Lo-Fi & Chill Beats',
                'slug' => 'lo-fi',
                'color_accent' => '#3B82F6',
                'cover_url' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Cyberpunk & EDM',
                'slug' => 'electronic',
                'color_accent' => '#EC4899',
                'cover_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Modern Pop & Vocal',
                'slug' => 'pop',
                'color_accent' => '#10B981',
                'cover_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'R&B / Soulful Night',
                'slug' => 'r-and-b',
                'color_accent' => '#F59E0B',
                'cover_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Deep Ambient & Coding',
                'slug' => 'ambient',
                'color_accent' => '#5E6AD2',
                'cover_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        $genres = [];
        foreach ($genresData as $g) {
            $genres[$g['slug']] = Genre::create($g);
        }

        // 3. Create Artists
        $artistsData = [
            [
                'name' => 'Aethelgard',
                'slug' => 'aethelgard',
                'bio' => 'Electronic music producer blending vintage 80s analog synthesizers with cinematic cyberpunk soundscapes.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 3840219,
                'is_verified' => true,
                'genre_id' => $genres['synthwave']->id,
            ],
            [
                'name' => 'Luna Mirage',
                'slug' => 'luna-mirage',
                'bio' => 'Dream-pop and indie vocalist known for ethereal harmonies, layered reverb, and mesmerizing melodies.',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 5210940,
                'is_verified' => true,
                'genre_id' => $genres['pop']->id,
            ],
            [
                'name' => 'Kairo Beats',
                'slug' => 'kairo-beats',
                'bio' => 'Tokyo-based Lo-Fi beatmaker crafting warm vinyl crackles, jazzy chords, and peaceful coffee-shop vibes.',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 2419080,
                'is_verified' => true,
                'genre_id' => $genres['lo-fi']->id,
            ],
            [
                'name' => 'Solstice 99',
                'slug' => 'solstice-99',
                'bio' => 'High-voltage bass and electronic dance maestro headlining futuristic neon festivals across the globe.',
                'avatar_url' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 6840100,
                'is_verified' => true,
                'genre_id' => $genres['electronic']->id,
            ],
            [
                'name' => 'The Midnight Velvet',
                'slug' => 'the-midnight-velvet',
                'bio' => 'Soulful R&B duo delivering sultry basslines, silky smooth hooks, and late-night city romance.',
                'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 4192000,
                'is_verified' => true,
                'genre_id' => $genres['r-and-b']->id,
            ],
            [
                'name' => 'Echoes of Horizon',
                'slug' => 'echoes-of-horizon',
                'bio' => 'Ambient and generative music collective designed for deep focus, coding flow states, and lucid dreaming.',
                'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => 1890400,
                'is_verified' => false,
                'genre_id' => $genres['ambient']->id,
            ],
        ];

        $artists = [];
        foreach ($artistsData as $a) {
            $artists[$a['slug']] = Artist::create($a);
        }

        // 4. Create Albums
        $albumsData = [
            [
                'artist_id' => $artists['aethelgard']->id,
                'title' => 'Neon Odyssey',
                'slug' => 'neon-odyssey',
                'cover_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                'release_date' => '2025-11-14',
                'type' => 'album',
            ],
            [
                'artist_id' => $artists['luna-mirage']->id,
                'title' => 'After Hours in Tokyo',
                'slug' => 'after-hours-in-tokyo',
                'cover_url' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
                'release_date' => '2026-01-20',
                'type' => 'album',
            ],
            [
                'artist_id' => $artists['kairo-beats']->id,
                'title' => 'Midnight Coffee & Rain',
                'slug' => 'midnight-coffee-and-rain',
                'cover_url' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
                'release_date' => '2025-08-10',
                'type' => 'album',
            ],
            [
                'artist_id' => $artists['solstice-99']->id,
                'title' => 'Hyperdrive Protocol',
                'slug' => 'hyperdrive-protocol',
                'cover_url' => 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
                'release_date' => '2026-02-01',
                'type' => 'ep',
            ],
            [
                'artist_id' => $artists['the-midnight-velvet']->id,
                'title' => 'Silk & Stardust',
                'slug' => 'silk-and-stardust',
                'cover_url' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
                'release_date' => '2025-12-05',
                'type' => 'album',
            ],
            [
                'artist_id' => $artists['echoes-of-horizon']->id,
                'title' => 'Cosmic Drift',
                'slug' => 'cosmic-drift',
                'cover_url' => 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
                'release_date' => '2026-03-01',
                'type' => 'single',
            ],
        ];

        $albums = [];
        foreach ($albumsData as $alb) {
            $albums[$alb['slug']] = Album::create($alb);
        }

        // Public reliable royalty-free streaming MP3 URLs
        $demoAudio = [
            'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
            'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
            'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7772f.mp3?filename=chill-abstract-intention-12099.mp3',
            'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
            'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=ambient-piano-amp-strings-10711.mp3',
            'https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0c6ff1101.mp3?filename=midnight-forest-184304.mp3',
        ];

        // Sample LRC synchronized lyrics
        $sampleLRC1 = "[00:00.00] (Instrumental Intro - Analog Synthesizers)\n[00:06.50] Gliding through the neon city rain\n[00:11.20] Reflections on the windshield feel the same\n[00:16.80] Speeding through the midnight hyperlane\n[00:22.40] Electric dreams are washing out the pain\n[00:28.00] In this cybernetic wonderland\n[00:33.50] Hold the pulse inside your glowing hand\n[00:39.20] Linear motion, never turning back\n[00:44.80] Burning light across the endless track\n[00:51.00] (Epic Synth Drop & Bassline)\n[01:05.00] We are the signals in the dark\n[01:10.50] Igniting every digital spark\n[01:16.00] We will never fade away...";

        $sampleLRC2 = "[00:00.00] (Soft Lo-Fi Vinyl Crackle)\n[00:04.20] Coffee brewing in the early dawn\n[00:09.00] Watching sleepy streetlights turning on\n[00:14.50] Lo-fi chords to calm a racing mind\n[00:20.00] Leaving all the chaotic noise behind\n[00:25.50] Code is running smoothly on the screen\n[00:31.00] The cleanest architecture ever seen\n[00:36.50] Deep in focus, finding rhythm slow\n[00:42.00] Letting all the inspiration flow...";

        $sampleLRC3 = "[00:00.00] (Dreamy Ambient Synth)\n[00:05.00] Stars aligning in the midnight sky\n[00:10.20] Staring at the satellites go by\n[00:15.50] Drifting into zero gravity\n[00:21.00] Floating far beyond reality\n[00:26.50] Soft light breathing in the space between\n[00:32.00] Sights no other human eyes have seen\n[00:38.00] Peaceful echo in the cosmic night\n[00:44.00] Guided by the soft indigo light...";

        // 5. Create Tracks
        $tracksData = [
            // Album 1: Neon Odyssey
            [
                'artist_id' => $artists['aethelgard']->id,
                'album_id' => $albums['neon-odyssey']->id,
                'title' => 'Cyber City Highway',
                'duration' => 218,
                'audio_url' => $demoAudio[1],
                'cover_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC1,
                'plays_count' => 14829120,
                'track_number' => 1,
                'is_featured' => true,
            ],
            [
                'artist_id' => $artists['aethelgard']->id,
                'album_id' => $albums['neon-odyssey']->id,
                'title' => 'Midnight Overdrive',
                'duration' => 195,
                'audio_url' => $demoAudio[3],
                'cover_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC1,
                'plays_count' => 8930400,
                'track_number' => 2,
                'is_featured' => true,
            ],
            [
                'artist_id' => $artists['aethelgard']->id,
                'album_id' => $albums['neon-odyssey']->id,
                'title' => 'Neon Horizon',
                'duration' => 240,
                'audio_url' => $demoAudio[0],
                'cover_url' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC1,
                'plays_count' => 5410290,
                'track_number' => 3,
                'is_featured' => false,
            ],

            // Album 2: After Hours in Tokyo
            [
                'artist_id' => $artists['luna-mirage']->id,
                'album_id' => $albums['after-hours-in-tokyo']->id,
                'title' => 'Shinjuku Neon Lights',
                'duration' => 184,
                'audio_url' => $demoAudio[2],
                'cover_url' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC2,
                'plays_count' => 21940120,
                'track_number' => 1,
                'is_featured' => true,
            ],
            [
                'artist_id' => $artists['luna-mirage']->id,
                'album_id' => $albums['after-hours-in-tokyo']->id,
                'title' => 'Electric Raindrop',
                'duration' => 205,
                'audio_url' => $demoAudio[1],
                'cover_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC2,
                'plays_count' => 12400910,
                'track_number' => 2,
                'is_featured' => true,
            ],

            // Album 3: Midnight Coffee & Rain
            [
                'artist_id' => $artists['kairo-beats']->id,
                'album_id' => $albums['midnight-coffee-and-rain']->id,
                'title' => '4 AM Code Session',
                'duration' => 165,
                'audio_url' => $demoAudio[0],
                'cover_url' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC2,
                'plays_count' => 18320400,
                'track_number' => 1,
                'is_featured' => true,
            ],
            [
                'artist_id' => $artists['kairo-beats']->id,
                'album_id' => $albums['midnight-coffee-and-rain']->id,
                'title' => 'Vinyl Memories',
                'duration' => 178,
                'audio_url' => $demoAudio[2],
                'cover_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC2,
                'plays_count' => 9840200,
                'track_number' => 2,
                'is_featured' => false,
            ],

            // Album 4: Hyperdrive Protocol
            [
                'artist_id' => $artists['solstice-99']->id,
                'album_id' => $albums['hyperdrive-protocol']->id,
                'title' => 'Subatomic Bassline',
                'duration' => 210,
                'audio_url' => $demoAudio[3],
                'cover_url' => 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC1,
                'plays_count' => 31200450,
                'track_number' => 1,
                'is_featured' => true,
            ],

            // Album 5: Silk & Stardust
            [
                'artist_id' => $artists['the-midnight-velvet']->id,
                'album_id' => $albums['silk-and-stardust']->id,
                'title' => 'Velvet Silhouette',
                'duration' => 225,
                'audio_url' => $demoAudio[5],
                'cover_url' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC2,
                'plays_count' => 16420100,
                'track_number' => 1,
                'is_featured' => true,
            ],

            // Album 6: Cosmic Drift
            [
                'artist_id' => $artists['echoes-of-horizon']->id,
                'album_id' => $albums['cosmic-drift']->id,
                'title' => 'Starlight Echoes',
                'duration' => 310,
                'audio_url' => $demoAudio[4],
                'cover_url' => 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
                'lyrics_lrc' => $sampleLRC3,
                'plays_count' => 7420100,
                'track_number' => 1,
                'is_featured' => true,
            ],
        ];

        $createdTracks = [];
        foreach ($tracksData as $t) {
            $createdTracks[] = Track::create($t);
        }

        // 6. Create Curated Playlists
        $playlist1 = Playlist::create([
            'user_id' => $admin->id,
            'title' => 'Today\'s Top Hits (Linear Mix)',
            'description' => 'The hottest tracks on repeat right now across synthwave, pop, and electronic.',
            'cover_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
            'is_public' => true,
            'is_featured' => true,
        ]);
        $playlist1->tracks()->attach([
            $createdTracks[0]->id => ['position' => 1],
            $createdTracks[3]->id => ['position' => 2],
            $createdTracks[7]->id => ['position' => 3],
            $createdTracks[8]->id => ['position' => 4],
        ]);

        $playlist2 = Playlist::create([
            'user_id' => $admin->id,
            'title' => 'Chill Lofi Study Beats 2026',
            'description' => 'Warm vinyl textures and soothing beats for deep focus, studying, and late-night coding.',
            'cover_url' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
            'is_public' => true,
            'is_featured' => true,
        ]);
        $playlist2->tracks()->attach([
            $createdTracks[5]->id => ['position' => 1],
            $createdTracks[6]->id => ['position' => 2],
            $createdTracks[9]->id => ['position' => 3],
        ]);

        $playlist3 = Playlist::create([
            'user_id' => $user->id,
            'title' => 'Synthwave Night Drive',
            'description' => 'Blade Runner vibes, glowing city skylines, and retro-futuristic bass.',
            'cover_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
            'is_public' => true,
            'is_featured' => true,
        ]);
        $playlist3->tracks()->attach([
            $createdTracks[0]->id => ['position' => 1],
            $createdTracks[1]->id => ['position' => 2],
            $createdTracks[2]->id => ['position' => 3],
        ]);

        // 7. Add demo user favorites
        Favorite::create(['user_id' => $admin->id, 'track_id' => $createdTracks[0]->id]);
        Favorite::create(['user_id' => $admin->id, 'track_id' => $createdTracks[3]->id]);
        Favorite::create(['user_id' => $admin->id, 'track_id' => $createdTracks[5]->id]);
    }
}
