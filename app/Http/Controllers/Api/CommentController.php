<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Track;
use App\Models\User;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get timed comments for a track
     */
    public function index($trackId)
    {
        $comments = Comment::with('user')
            ->where('track_id', $trackId)
            ->orderBy('timestamp_seconds', 'asc')
            ->get();

        return response()->json($comments);
    }

    /**
     * Post a timed comment on a specific audio timestamp
     */
    public function store(Request $request, $trackId)
    {
        $request->validate([
            'timestamp_seconds' => 'required|integer|min:0',
            'content' => 'required|string|max:500',
        ]);

        $user = User::first(); // Default authenticated user

        $comment = Comment::create([
            'track_id' => $trackId,
            'user_id' => $user?->id ?: 1,
            'timestamp_seconds' => $request->timestamp_seconds,
            'content' => $request->content,
        ]);

        return response()->json($comment->load('user'), 201);
    }
}
