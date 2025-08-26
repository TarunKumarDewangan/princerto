<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Using updateOrCreate is safe. It will create the branches if they don't exist,
        // or just ensure they are there if you run the seeder again.
        Branch::updateOrCreate(['name' => 'Dhamtari']);
        Branch::updateOrCreate(['name' => 'Kurud']);
        Branch::updateOrCreate(['name' => 'Nagri']);
    }
}
