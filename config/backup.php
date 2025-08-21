<?php

return [
    'backup' => [
        'name' => env('APP_NAME', 'laravel-backup'),

        'source' => [
            'files' => [
                'include' => [
                    base_path(),
                ],
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                ],
                'follow_links' => false,
                'ignore_unreadable_directories' => false,
                'relative_path' => null,
            ],
            'databases' => [
                'mysql',
            ],
        ],

        'database_dump_compressor' => null,
        'database_dump_compression_level' => 6,
        'database_dump_file_extension' => '',

        'destination' => [
            'filename_prefix' => '',
            'disks' => [
                'local',
            ],
        ],

        'notifications' => [
            // --- START OF MODIFIED CODE ---
            // By setting these to empty arrays, we are disabling all email notifications.
            'notifications' => [
                \Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification::class => [],
                \Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification::class => [],
                \Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification::class => [],
                \Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification::class => [],
                \Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification::class => [],
                \Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification::class => [],
            ],
            // --- END OF MODIFIED CODE ---

            'notifiable' => \Spatie\Backup\Notifications\Notifiable::class,

            'mail' => [
                'to' => 'your@example.com',
                'from' => [
                    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                    'name' => env('MAIL_FROM_NAME', 'Example'),
                ],
            ],

            'slack' => [
                'webhook_url' => '',
                'channel' => null,
                'username' => null,
                'icon' => null,
            ],

            'discord' => [
                'webhook_url' => '',
                'username' => null,
                'avatar_url' => null,
            ],
        ],

        'monitor_backups' => [
            [
                'name' => env('APP_NAME', 'laravel-backup'),
                'disks' => ['local'],
                'health_checks' => [
                    \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays::class => 1,
                    \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes::class => 5000,
                ],
            ],
        ],

        'cleanup' => [
            'strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,

            'default_strategy' => [
                'keep_all_backups_for_days' => 7,
                'keep_daily_backups_for_days' => 16,
                'keep_weekly_backups_for_weeks' => 8,
                'keep_monthly_backups_for_months' => 4,
                'keep_yearly_backups_for_years' => 2,
                'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
            ],
        ],
    ],

    'db_dump' => [
        'mysql' => [
            'dump_binary_path' => 'C:\xampp\mysql\bin',
        ],
    ],

    'health_checks' => [
        \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays::class => [
            'fail_when_older_than_days' => 2,
        ],
        \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes::class => [
            'fail_when_storage_reaches_mb' => 5000,
        ],
    ],
];
