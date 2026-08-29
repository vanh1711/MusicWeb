<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Genres
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color_accent')->default('#5E6AD2');
            $table->string('cover_url')->nullable();
            $table->timestamps();
        });

        // 2. Artists
        Schema::create('artists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->unsignedBigInteger('monthly_listeners')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->foreignId('genre_id')->nullable()->constrained('genres')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Albums
        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_id')->constrained('artists')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('cover_url')->nullable();
            $table->date('release_date')->nullable();
            $table->string('type')->default('album'); // album, single, ep
            $table->timestamps();
        });

        // 4. Tracks
        Schema::create('tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_id')->constrained('artists')->cascadeOnDelete();
            $table->foreignId('album_id')->nullable()->constrained('albums')->nullOnDelete();
            $table->string('title');
            $table->integer('duration')->default(0); // duration in seconds
            $table->string('audio_url');
            $table->string('cover_url')->nullable();
            $table->longText('lyrics_lrc')->nullable();
            $table->unsignedBigInteger('plays_count')->default(0);
            $table->integer('track_number')->default(1);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // 5. Playlists
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_url')->nullable();
            $table->boolean('is_public')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // 6. Playlist Track (Pivot)
        Schema::create('playlist_track', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained('playlists')->cascadeOnDelete();
            $table->foreignId('track_id')->constrained('tracks')->cascadeOnDelete();
            $table->integer('position')->default(0);
            $table->timestamp('added_at')->useCurrent();
        });

        // 7. Favorites (Liked Songs)
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('track_id')->constrained('tracks')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'track_id']);
        });

        // 8. Play History
        Schema::create('play_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('track_id')->constrained('tracks')->cascadeOnDelete();
            $table->timestamp('played_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('play_history');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('playlist_track');
        Schema::dropIfExists('playlists');
        Schema::dropIfExists('tracks');
        Schema::dropIfExists('albums');
        Schema::dropIfExists('artists');
        Schema::dropIfExists('genres');
    }
};
