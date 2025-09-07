<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // --- START OF THE FIX ---
        $schedule->command('notifications:send-expiries')
            ->dailyAt('09:00')
            ->timezone('Asia/Kolkata'); // Set the timezone to India Standard Time
        // --- END OF THE FIX ---
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
