<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Track;
use App\Models\Artist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload and publish a track on VanhSound (Creator Studio)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:150',
            'artist_name' => 'required|string|max:100',
            'audio_url' => 'nullable|string',
            'cover_url' => 'nullable|string',
            'genre_id' => 'nullable|integer',
            'lyrics_lrc' => 'nullable|string',
            'waveform_data' => 'nullable|array',
            'duration' => 'nullable|integer',
        ]);

        $user = User::first(); // Default demo creator

        // Find or create Artist entity for uploader
        $artistSlug = Str::slug($request->artist_name);
        $artist = Artist::firstOrCreate(
            ['slug' => $artistSlug],
            [
                'name' => $request->artist_name,
                'bio' => 'Nghệ sĩ độc lập tải nhạc lên cộng đồng VanhSound.',
                'avatar_url' => $request->cover_url ?: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
                'monthly_listeners' => 1,
                'is_verified' => false,
                'genre_id' => $request->genre_id ?: 1,
            ]
        );

        // Fallback default waveform if not provided
        $waveformData = $request->waveform_data;
        if (empty($waveformData)) {
            $waveformData = [];
            for ($i = 0; $i < 70; $i++) {
                $waveformData[] = round(0.2 + 0.6 * abs(sin($i / 4.5)) + (rand(-10, 15) / 100), 2);
            }
        }

        // Fallback demo audio if URL not supplied
        $fallbackAudios = [
            'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
            'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
            'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7772f.mp3?filename=chill-abstract-intention-12099.mp3',
        ];

        $track = Track::create([
            'artist_id' => $artist->id,
            'uploader_id' => $user?->id ?: 1,
            'title' => $request->title,
            'duration' => $request->duration ?: 210,
            'audio_url' => $request->audio_url ?: $fallbackAudios[array_rand($fallbackAudios)],
            'cover_url' => $request->cover_url ?: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
            'lyrics_lrc' => $request->lyrics_lrc ?: "[00:00.00] (Track tải lên VanhSound)\n[00:10.00] Giai điệu mượt mà của " . $request->title,
            'waveform_data' => $waveformData,
            'plays_count' => 1,
            'track_number' => 1,
            'is_featured' => true,
        ]);

        return response()->json([
            'message' => 'Bài hát của bạn đã được xuất bản thành công trên VanhSound!',
            'track' => $track->load('artist'),
        ], 201);
    }
}
