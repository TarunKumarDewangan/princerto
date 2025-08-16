<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Using updateOrCreate is safer for reseeding.
        // It finds the user by email and either updates it or creates it if it doesn't exist.
        User::updateOrCreate(
            ['email' => 'admin@site.local'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'phone' => null // Explicitly set phone to null for the admin user
            ]
        );
    }
}
