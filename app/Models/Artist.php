<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Artist extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'bio',
        'avatar_url',
        'banner_url',
        'monthly_listeners',
        'is_verified',
        'genre_id',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'monthly_listeners' => 'integer',
    ];

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function albums(): HasMany
    {
        return $this->hasMany(Album::class)->orderBy('release_date', 'desc');
    }

    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class)->orderBy('plays_count', 'desc');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'artist_id');
    }

    public function followerUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'artist_id', 'follower_id')
            ->withTimestamps();
    }
}
