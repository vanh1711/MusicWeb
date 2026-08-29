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
        // 1. Add waveform_data and uploader_id to tracks
        Schema::table('tracks', function (Blueprint $table) {
            $table->json('waveform_data')->nullable()->after('lyrics_lrc');
            $table->foreignId('uploader_id')->nullable()->after('artist_id')->constrained('users')->nullOnDelete();
        });

        // 2. Timed Comments table (SoundCloud signature feature)
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('track_id')->constrained('tracks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('timestamp_seconds')->default(0);
            $table->text('content');
            $table->timestamps();

            $table->index(['track_id', 'timestamp_seconds']);
        });

        // 3. Follows table (Creator follow system)
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('artist_id')->constrained('artists')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['follower_id', 'artist_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
        Schema::dropIfExists('comments');

        Schema::table('tracks', function (Blueprint $table) {
            $table->dropForeign(['uploader_id']);
            $table->dropColumn(['uploader_id', 'waveform_data']);
        });
    }
};
