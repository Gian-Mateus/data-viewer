<?php

declare(strict_types=1);

namespace Manadah\DataViewer\Tests;

use Manadah\DataViewer\DataViewerServiceProvider;
use PHPUnit\Framework\TestCase;

final class DataViewerServiceProviderTest extends TestCase
{
    public function test_vue_source_is_packaged(): void
    {
        $dir = dirname(__DIR__).'/resources/js/data-viewer';

        $this->assertFileExists($dir.'/DataViewer.vue');
        $this->assertFileExists($dir.'/index.ts');
        $this->assertFileExists($dir.'/inertia.ts');
        $this->assertDirectoryDoesNotExist($dir.'/ui');
    }

    public function test_provider_is_autoloadable(): void
    {
        $this->assertTrue(class_exists(DataViewerServiceProvider::class));
    }
}
