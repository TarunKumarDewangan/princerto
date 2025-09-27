<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{

    //
    //->everyMinute()
    protected $commands = [
        Commands\SendExpiryNotifications::class,
    ];
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('notifications:send-expiries')
            ->dailyAt('09:00')    //->everyMinute()
            ->timezone('Asia/Kolkata')
            ->appendOutputTo(storage_path('logs/scheduler.log'))
            ->before(function () {
                \Log::info('Scheduler starting notifications at: ' . now());
            })
            ->after(function () {
                \Log::info('Scheduler finished notifications at: ' . now());
            });
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
