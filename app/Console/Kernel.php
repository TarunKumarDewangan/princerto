<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{

    //->dailyAt('09:00')
    protected $commands = [
        Commands\SendExpiryNotifications::class,
    ];
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('notifications:send-expiries')
            ->everyMinute()
            ->timezone('Asia/Kolkata')
            ->appendOutputTo(storage_path('logs/scheduler.log'))
            ->emailOutputOnFailure('your-email@example.com'); // Optional
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
