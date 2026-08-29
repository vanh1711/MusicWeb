<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Track extends Model
{
    use HasFactory;

    protected $fillable = [
        'artist_id',
        'uploader_id',
        'album_id',
        'title',
        'duration',
        'audio_url',
        'cover_url',
        'lyrics_lrc',
        'waveform_data',
        'plays_count',
        'track_number',
        'is_featured',
    ];

    protected $casts = [
        'duration' => 'integer',
        'plays_count' => 'integer',
        'track_number' => 'integer',
        'is_featured' => 'boolean',
        'waveform_data' => 'array',
    ];

    protected $appends = [
        'duration_formatted',
        'display_cover_url',
    ];

    public function artist(): BelongsTo
    {
        return $this->belongsTo(Artist::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class, 'playlist_track')
            ->withPivot('position', 'added_at');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->with('user')->orderBy('timestamp_seconds', 'asc');
    }

    public function getDurationFormattedAttribute(): string
    {
        $minutes = floor($this->duration / 60);
        $seconds = $this->duration % 60;
        return sprintf('%d:%02d', $minutes, $seconds);
    }

    public function getDisplayCoverUrlAttribute(): ?string
    {
        return $this->cover_url ?: ($this->album?->cover_url ?: $this->artist?->avatar_url);
    }
}
