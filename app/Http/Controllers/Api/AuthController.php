<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * User Registration
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'avatar_url' => 'nullable|string',
        ]);

        $defaultAvatars = [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        ];

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar_url' => $request->avatar_url ?: $defaultAvatars[array_rand($defaultAvatars)],
            'role' => 'user',
        ]);

        // Simple API token generator for session
        $token = bin2hex(random_bytes(32));

        return response()->json([
            'message' => 'Đăng ký tài khoản VanhSound thành công!',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    /**
     * User Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác.',
            ], 401);
        }

        $token = bin2hex(random_bytes(32));

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Get authenticated user profile & data
     */
    public function me(Request $request)
    {
        // Return demo active user or first user
        $user = User::with(['playlists', 'uploads.artist', 'followedArtists'])->first();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'user' => $user,
            'playlists_count' => $user->playlists->count(),
            'uploads_count' => $user->uploads->count(),
            'following_count' => $user->followedArtists->count(),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = User::first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $request->validate([
            'name' => 'nullable|string|max:100',
            'avatar_url' => 'nullable|string',
        ]);

        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('avatar_url')) $user->avatar_url = $request->avatar_url;
        $user->save();

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user' => $user,
        ]);
    }
}
