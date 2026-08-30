<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Track;
use App\Models\Playlist;
use App\Models\Favorite;
use App\Models\PlayHistory;
use App\Models\Follow;
use App\Models\User;
use App\Services\LiveMusicService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MusicController extends Controller
{
    protected LiveMusicService $liveMusic;

    public function __construct(LiveMusicService $liveMusic)
    {
        $this->liveMusic = $liveMusic;
    }

    /**
     * Featured tracks & playlists for homepage (Vietnamese Hits & Global International Music)
     */
    public function featured()
    {
        // 1. Live Global Trending from Audius API (Full length 320kbps MP3s)
        $audiusTrending = $this->liveMusic->getAudiusTrending(12);

        // 2. Seeded & Live V-Music Tracks
        $localTracks = Track::with(['artist', 'album'])
            ->where('is_featured', true)
            ->take(12)
            ->get()
            ->toArray();

        // 3. Playlists (Vietnamese & Global)
        $featuredPlaylists = Playlist::with(['user', 'tracks'])
            ->withCount('tracks')
            ->where('is_featured', true)
            ->orWhere('is_public', true)
            ->take(8)
            ->get();

        // 4. Featured Artists
        $featuredArtists = Artist::with('genre')
            ->where('is_verified', true)
            ->orderBy('monthly_listeners', 'desc')
            ->take(8)
            ->get();

        // 5. New Releases
        $newReleases = Album::with('artist')
            ->orderBy('release_date', 'desc')
            ->take(6)
            ->get();

        // 6. Quick Picks: Rich blend of V-Pop & Global Trending Hits
        $quickPicks = array_merge(
            array_slice($localTracks, 0, 4),
            array_slice($audiusTrending, 0, 4)
        );

        return response()->json([
            'featured_tracks' => array_merge($localTracks, $audiusTrending),
            'featured_playlists' => $featuredPlaylists,
            'featured_artists' => $featuredArtists,
            'new_releases' => $newReleases,
            'quick_picks' => $quickPicks,
            'audius_trending' => $audiusTrending,
        ]);
    }

    /**
     * Resolve Alternate Embeddable Stream (When Error 150/101 occurs)
     */
    public function resolveStream(Request $request)
    {
        $title = $request->get('title', '');
        $artist = $request->get('artist', '');
        $excludeId = $request->get('exclude_id', '');

        $altTrack = $this->liveMusic->resolveAlternateStream($title, $artist, $excludeId);

        if ($altTrack) {
            return response()->json([
                'success' => true,
                'track' => $altTrack,
                'youtube_id' => $altTrack['youtube_id'] ?? null,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No alternate stream found',
        ], 404);
    }

    /**
     * Get all genres
     */
    public function genres()
    {
        $genres = Genre::withCount('artists')->get();
        return response()->json($genres);
    }

    /**
     * Get genre details
     */
    public function genreDetail($slug)
    {
        $genre = Genre::where('slug', $slug)->first();
        $genreName = $genre ? $genre->name : ucwords(str_replace('-', ' ', $slug));

        // Query live music engine by genre tag
        $searchTag = match($slug) {
            'remix-vinahouse' => 'remix',
            'lofi-saigon' => 'lofi',
            'rap-viet' => 'hip hop',
            'v-pop' => 'pop',
            'indie-viet' => 'indie',
            default => $slug,
        };

        $liveResults = $this->liveMusic->searchUnified($searchTag);

        return response()->json([
            'genre' => $genre ?: [
                'id' => 1,
                'name' => $genreName,
                'slug' => $slug,
                'color_accent' => '#5E6AD2',
            ],
            'artists' => $liveResults['artists'] ?? [],
            'tracks' => $liveResults['tracks'] ?? [],
        ]);
    }

    /**
     * Live Multi-Source Search (Audius API + Apple/V-Music CDN)
     */
    public function search(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (empty($query)) {
            return response()->json([
                'query' => '',
                'top_result' => null,
                'tracks' => [],
                'artists' => [],
                'albums' => [],
                'playlists' => [],
            ]);
        }

        // Query unified live search service
        $results = $this->liveMusic->searchUnified($query);

        return response()->json($results);
    }

    /**
     * Get Recommended Related Tracks (Autoplay & Up-Next)
     */
    public function recommendations(Request $request)
    {
        $title = $request->get('title', '');
        $artist = $request->get('artist', '');
        $trackId = $request->get('track_id', '');
        $duration = (int)$request->get('duration', 240);

        $tracks = $this->liveMusic->getRecommendations($title, $artist, $trackId, $duration);

        return response()->json([
            'title' => $title,
            'tracks' => $tracks,
        ]);
    }

    /**
     * Get Synchronized LRC Lyrics
     */
    public function lyrics(Request $request)
    {
        $title = $request->get('title', '');
        $artist = $request->get('artist', '');
        $duration = (int)$request->get('duration', 0);

        $syncedLyrics = $this->liveMusic->fetchSyncedLyrics($title, $artist, $duration);

        return response()->json([
            'title' => $title,
            'artist' => $artist,
            'lyrics_lrc' => $syncedLyrics,
            'has_lyrics' => !empty($syncedLyrics),
        ]);
    }

    /**
     * Artist profile details (Supports both local and live fetched artists)
     */
    public function artistDetail($slug)
    {
        $artist = Artist::with('genre')->where('slug', $slug)->first();

        if ($artist) {
            $topTracks = Track::with(['album', 'artist'])
                ->where('artist_id', $artist->id)
                ->orderBy('plays_count', 'desc')
                ->take(15)
                ->get();

            $albums = Album::where('artist_id', $artist->id)
                ->orderBy('release_date', 'desc')
                ->get();

            $relatedArtists = Artist::where('id', '!=', $artist->id)
                ->where('genre_id', $artist->genre_id)
                ->take(4)
                ->get();
        } else {
            // Live artist search on Audius / V-Music
            $cleanName = str_replace('-', ' ', $slug);
            $liveData = $this->liveMusic->searchUnified($cleanName);

            $topTracks = $liveData['tracks'] ?? [];
            $artist = $liveData['artists'][0] ?? [
                'id' => 'art_' . $slug,
                'name' => ucwords($cleanName),
                'slug' => $slug,
                'avatar_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
                'banner_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
                'monthly_listeners' => rand(1500000, 9500000),
                'is_verified' => true,
                'bio' => 'Nghệ sĩ phát hành trực tiếp trên mạng lưới VanhSound & Audius.',
            ];

            $albums = $liveData['albums'] ?? [];
            $relatedArtists = array_slice($liveData['artists'] ?? [], 1, 4);
        }

        $isFollowing = Follow::where('follower_id', 1)->where('artist_id', $artist['id'] ?? 0)->exists();

        return response()->json([
            'artist' => $artist,
            'top_tracks' => $topTracks,
            'albums' => $albums,
            'related_artists' => $relatedArtists,
            'is_following' => $isFollowing,
        ]);
    }

    /**
     * Toggle follow an artist
     */
    public function toggleFollow(Request $request, $id)
    {
        $userId = 1;
        $follow = Follow::where('follower_id', $userId)->where('artist_id', $id)->first();

        if ($follow) {
            $follow->delete();
            $isFollowing = false;
        } else {
            Follow::create(['follower_id' => $userId, 'artist_id' => $id]);
            $isFollowing = true;
        }

        return response()->json([
            'is_following' => $isFollowing,
            'artist_id' => $id,
        ]);
    }

    /**
     * Album details with tracklist
     */
    public function albumDetail($slug)
    {
        $album = Album::with(['artist', 'tracks' => function ($q) {
            $q->orderBy('track_number', 'asc')->with('artist');
        }])->where('slug', $slug)->first();

        if ($album) {
            $moreAlbums = Album::where('artist_id', $album->artist_id)
                ->where('id', '!=', $album->id)
                ->take(4)
                ->get();

            return response()->json([
                'album' => $album,
                'tracks' => $album->tracks,
                'more_albums' => $moreAlbums,
            ]);
        }

        // Live fallback album
        $cleanTitle = str_replace('-', ' ', $slug);
        $liveData = $this->liveMusic->searchUnified($cleanTitle);

        return response()->json([
            'album' => [
                'id' => 'alb_' . $slug,
                'title' => ucwords($cleanTitle),
                'slug' => $slug,
                'cover_url' => $liveData['tracks'][0]['cover_url'] ?? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
                'type' => 'album',
                'release_date' => '2025-01-01',
                'artist' => $liveData['tracks'][0]['artist'] ?? ['name' => 'Artist', 'slug' => 'artist'],
            ],
            'tracks' => $liveData['tracks'] ?? [],
            'more_albums' => [],
        ]);
    }

    /**
     * Playlist details
     */
    public function playlistDetail($id)
    {
        $playlist = Playlist::with(['user', 'tracks' => function ($q) {
            $q->with(['artist', 'album']);
        }])->find($id);

        if (!$playlist) {
            // Live fallback playlist
            $audiusTrending = $this->liveMusic->getAudiusTrending(10);
            return response()->json([
                'playlist' => [
                    'id' => $id,
                    'title' => 'Top Audius & V-Music Discovery',
                    'description' => 'Những bài hát thịnh hành nhất toàn cầu phát trực tiếp từ Audius và VanhSound Studio.',
                    'cover_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
                    'user' => ['name' => 'VanhSound Curated'],
                ],
                'tracks' => $audiusTrending,
            ]);
        }

        return response()->json([
            'playlist' => $playlist,
            'tracks' => $playlist->tracks,
        ]);
    }

    /**
     * Create user playlist
     */
    public function createPlaylist(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        $defaultUser = User::first();

        $playlist = Playlist::create([
            'user_id' => $defaultUser?->id ?: 1,
            'title' => $request->title,
            'description' => $request->description ?: 'Tạo bởi ' . ($defaultUser?->name ?: 'Bạn'),
            'cover_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
            'is_public' => true,
            'is_featured' => false,
        ]);

        return response()->json($playlist, 201);
    }

    /**
     * Add track to playlist
     */
    public function addTrackToPlaylist(Request $request, $id)
    {
        $request->validate([
            'track_id' => 'required',
        ]);

        $playlist = Playlist::findOrFail($id);
        $maxPos = $playlist->tracks()->max('position') ?: 0;
        
        $playlist->tracks()->syncWithoutDetaching([
            $request->track_id => ['position' => $maxPos + 1]
        ]);

        return response()->json(['message' => 'Đã thêm bài hát vào playlist']);
    }

    /**
     * Toggle favorite/liked track
     */
    public function toggleFavorite(Request $request)
    {
        $request->validate([
            'track_id' => 'required',
        ]);

        $userId = 1;
        $trackId = $request->track_id;

        // If integer ID, manage in DB
        if (is_numeric($trackId)) {
            $favorite = Favorite::where('user_id', $userId)
                ->where('track_id', $trackId)
                ->first();

            if ($favorite) {
                $favorite->delete();
                $isLiked = false;
            } else {
                Favorite::create([
                    'user_id' => $userId,
                    'track_id' => $trackId,
                ]);
                $isLiked = true;
            }
        } else {
            $isLiked = true;
        }

        return response()->json([
            'is_liked' => $isLiked,
            'track_id' => $trackId,
        ]);
    }

    /**
     * Get user favorites
     */
    public function getFavorites(Request $request)
    {
        $userId = 1;
        $favorites = Favorite::with(['track.artist', 'track.album'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $tracks = $favorites->pluck('track')->filter()->values();

        return response()->json([
            'count' => $tracks->count(),
            'tracks' => $tracks,
        ]);
    }

    /**
     * Record a play
     */
    public function recordPlay($id)
    {
        if (is_numeric($id)) {
            $track = Track::find($id);
            if ($track) {
                $track->increment('plays_count');
                PlayHistory::create([
                    'user_id' => 1,
                    'track_id' => $track->id,
                    'played_at' => now(),
                ]);
            }
        }

        return response()->json(['success' => true]);
    }
}
