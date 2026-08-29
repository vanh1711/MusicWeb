<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'track_id',
        'user_id',
        'timestamp_seconds',
        'content',
    ];

    protected $casts = [
        'timestamp_seconds' => 'integer',
    ];

    protected $appends = [
        'timestamp_formatted',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }

    public function getTimestampFormattedAttribute(): string
    {
        $minutes = floor($this->timestamp_seconds / 60);
        $seconds = $this->timestamp_seconds % 60;
        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
