<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\MusicController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

// 1. Auth Endpoints
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
});

// 2. Creator Studio & Upload
Route::post('/tracks/upload', [UploadController::class, 'upload']);

// 3. Timed Comments (SoundCloud Feature)
Route::get('/tracks/{id}/comments', [CommentController::class, 'index']);
Route::post('/tracks/{id}/comments', [CommentController::class, 'store']);

// 4. Artist Follow
Route::post('/artists/{id}/follow', [MusicController::class, 'toggleFollow']);

// 5. Browse & Discovery
Route::get('/browse/featured', [MusicController::class, 'featured']);
Route::get('/genres', [MusicController::class, 'genres']);
Route::get('/genres/{slug}', [MusicController::class, 'genreDetail']);

// 6. Search & Universal Resolver
Route::get('/search', [MusicController::class, 'search']);
Route::get('/recommendations', [MusicController::class, 'recommendations']);

// 7. Entities
Route::get('/artists/{slug}', [MusicController::class, 'artistDetail']);
Route::get('/albums/{slug}', [MusicController::class, 'albumDetail']);

// 8. Playlists
Route::get('/playlists/{id}', [MusicController::class, 'playlistDetail']);
Route::post('/playlists', [MusicController::class, 'createPlaylist']);
Route::post('/playlists/{id}/tracks', [MusicController::class, 'addTrackToPlaylist']);

// 9. User Favorites & History
Route::get('/favorites', [MusicController::class, 'getFavorites']);
Route::post('/favorites/toggle', [MusicController::class, 'toggleFavorite']);
Route::post('/tracks/{id}/play', [MusicController::class, 'recordPlay']);
