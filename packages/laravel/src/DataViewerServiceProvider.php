<?php

declare(strict_types=1);

namespace Manadah\DataViewer;

use Illuminate\Support\ServiceProvider;

/**
 * Publica o código-fonte Vue do DataViewer no projeto consumidor.
 *
 * Uso: php artisan vendor:publish --tag=data-viewer-vue
 */
final class DataViewerServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        $this->publishes([
            __DIR__.'/../resources/js/data-viewer' => $this->app->basePath('resources/js/components/data-viewer'),
        ], 'data-viewer-vue');
    }
}
