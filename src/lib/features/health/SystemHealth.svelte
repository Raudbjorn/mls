<script lang="ts">
    import { onMount, onDestroy, getContext } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';
    import { createApiClient } from '../../meili/utils/api';

    const meiliContext = getContext<MeiliContext>('meili');
    
    let initError = $state<string | null>(null);

    if (!meiliContext) {
        initError = 'SystemHealth must be used within a MeiliProvider';
    }

    let client = $derived(meiliContext?.client);
    let hasAdminRights = $derived(meiliContext?.hasAdminRights ?? false);
    let api = $derived(client ? createApiClient(client) : null);

    let loading = $state(true);
    let error = $state<string | null>(null);
    let metricsEnabled = $state(false);
    let pollInterval: number | null = null;

    // Stats
    let isIndexing = $state(false);
    let dbSize = $state(0);
    let usedDbSize = $state(0);
    let avgLatency = $state(0);
    let history = $state<{time: number, dbSize: number, usedDbSize: number, latency: number}[]>([]);

    async function checkMetricsStatus() {
        if (!hasAdminRights) {
            loading = false;
            return;
        }
        try {
            if (!client) return;
            const features = await (client as any).getExperimentalFeatures();
            metricsEnabled = !!features.metrics;
            if (metricsEnabled) {
                startPolling();
            }
        } catch (e: unknown) {
            const { getErrorMessage } = await import('$lib/design-system/utils/errors');
            error = getErrorMessage(e);
        } finally {
            loading = false;
        }
    }

    async function enableMetrics() {
        loading = true;
        if (!client) return;
        try {
            await (client as any).updateExperimentalFeatures({ metrics: true });
            metricsEnabled = true;
            startPolling();
        } catch (e: unknown) {
            const { getErrorMessage } = await import('$lib/design-system/utils/errors');
            error = getErrorMessage(e);
        } finally {
            loading = false;
        }
    }

    function startPolling() {
        fetchMetrics();
        pollInterval = window.setInterval(fetchMetrics, 2000);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    async function fetchMetrics() {
        try {
            // Fetch /metrics (Prometheus format)
            // We use fetch directly to handle text response if SDK doesn't support it easily
            // or use client.httpRequest if we can force text.
            // Let's use fetch for control over headers and response type.
            if (!api) return;
            const config = api.getConfig();
            const response = await fetch(`${config.host}/metrics`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.statusText}`);
            
            const text = await response.text();
            parseMetrics(text);
            error = null;
        } catch (e: unknown) {
            console.error('Error fetching metrics', e);
            // Don't show error to user constantly, maybe just log it
        }
    }

    function parseMetrics(text: string) {
        // Helper to extract value
        const getVal = (regex: RegExp) => {
            const match = text.match(regex);
            return match ? parseFloat(match[1]) : 0;
        };

        const latencySum = getVal(/meilisearch_http_response_time_seconds_sum\s+([0-9.]+)/);
        const latencyCount = getVal(/meilisearch_http_response_time_seconds_count\s+([0-9.]+)/);
        
        const newDbSize = getVal(/meilisearch_database_size_bytes\s+([0-9.]+)/);
        const newUsedDbSize = getVal(/meilisearch_used_database_size_bytes\s+([0-9.]+)/);
        const indexingVal = getVal(/meilisearch_is_indexing\s+([0-9.]+)/);

        // Update state
        dbSize = newDbSize;
        usedDbSize = newUsedDbSize;
        isIndexing = indexingVal > 0;

        // Calculate average latency
        avgLatency = latencyCount > 0 ? (latencySum / latencyCount) : 0;

        // Update history
        const now = Date.now();
        history = [...history, {
            time: now,
            dbSize: newDbSize,
            usedDbSize: newUsedDbSize,
            latency: avgLatency
        }].slice(-30); // Keep last 30 points
    }

    function formatBytes(bytes: number) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    onMount(() => {
        checkMetricsStatus();
    });

    onDestroy(() => {
        stopPolling();
    });
</script>

<div class="system-health">
    <h2>System Health</h2>

    {#if loading}
        <div class="loading">Checking system status...</div>
    {:else if !metricsEnabled}
        <div class="enable-metrics">
            <p>The Metrics feature is currently disabled.</p>
            <p class="info">Enabling this feature allows monitoring of system performance and resource usage.</p>
            <button class="enable-btn" onclick={enableMetrics} disabled={!hasAdminRights}>
                Enable Metrics
            </button>
            {#if !hasAdminRights}
                <p class="warning">Admin rights required to enable experimental features.</p>
            {/if}
        </div>
    {:else}
        <div class="dashboard">
            <!-- Status Cards -->
            <div class="cards">
                <div class="card status {isIndexing ? 'indexing' : 'idle'}">
                    <div class="label">Status</div>
                    <div class="value">
                        <span class="indicator"></span>
                        {isIndexing ? 'Indexing' : 'Idle'}
                    </div>
                </div>

                <div class="card">
                    <div class="label">Avg Latency</div>
                    <div class="value">{(avgLatency * 1000).toFixed(2)} ms</div>
                </div>

                <div class="card">
                    <div class="label">DB Size</div>
                    <div class="value">{formatBytes(dbSize)}</div>
                    <div class="sub-value">Used: {formatBytes(usedDbSize)}</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts">
                <div class="chart-container">
                    <h3>Latency History (ms)</h3>
                    <div class="chart">
                        <!-- Simple SVG Line Chart for Latency -->
                        <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                            <path
                                d={`M 0,100 ${history.map((p, i) => {
                                    const x = history.length > 1 ? (i / (history.length - 1)) * 300 : 0;
                                    const maxLat = Math.max(...history.map(h => h.latency), 0.001);
                                    const y = 100 - (p.latency / maxLat) * 80; // Scale to 80% height
                                    return `L ${x},${y}`;
                                }).join(' ')}`}
                                fill="none"
                                stroke="#2196f3"
                                stroke-width="2"
                            />
                        </svg>
                    </div>
                </div>

                <div class="chart-container">
                    <h3>Database Size</h3>
                    <div class="chart">
                        <!-- Simple SVG Area Chart for DB Size -->
                        <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                            <!-- Total Size -->
                            <path
                                d={`M 0,100 ${history.map((p, i) => {
                                    const x = history.length > 1 ? (i / (history.length - 1)) * 300 : 0;
                                    const maxSize = Math.max(...history.map(h => h.dbSize), 1024);
                                    const y = 100 - (p.dbSize / maxSize) * 90;
                                    return `L ${x},${y}`;
                                }).join(' ')} L 300,100 Z`}
                                fill="#e3f2fd"
                                stroke="none"
                            />
                             <!-- Used Size -->
                             <path
                                d={`M 0,100 ${history.map((p, i) => {
                                    const x = history.length > 1 ? (i / (history.length - 1)) * 300 : 0;
                                    const maxSize = Math.max(...history.map(h => h.dbSize), 1024); // Use same scale
                                    const y = 100 - (p.usedDbSize / maxSize) * 90;
                                    return `L ${x},${y}`;
                                }).join(' ')} L 300,100 Z`}
                                fill="#bbdefb"
                                stroke="#1976d2"
                                stroke-width="1"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    {#if error}
        <div class="error-toast">{error}</div>
    {/if}
</div>

<style>
    .system-health {
        padding: 1rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .loading {
        color: #666;
        text-align: center;
        padding: 2rem;
    }
    .enable-metrics {
        text-align: center;
        padding: 2rem;
        background: #f5f5f5;
        border-radius: 8px;
    }
    .info {
        color: #666;
        margin-bottom: 1.5rem;
    }
    .enable-btn {
        background: #4caf50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
    }
    .enable-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    .warning {
        color: #f57c00;
        font-size: 0.9em;
        margin-top: 1rem;
    }
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    .card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #eee;
    }
    .card.status.indexing .indicator {
        background-color: #2196f3;
        box-shadow: 0 0 8px #2196f3;
    }
    .card.status.idle .indicator {
        background-color: #4caf50;
    }
    .label {
        font-size: 0.9em;
        color: #666;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .sub-value {
        font-size: 0.9rem;
        color: #666;
        margin-top: 0.25rem;
    }
    .indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        transition: all 0.3s ease;
    }
    .charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    .chart-container {
        background: #fff;
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 8px;
    }
    .chart-container h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: #444;
    }
    .chart {
        height: 150px;
        width: 100%;
        background: #fafafa;
        border-bottom: 1px solid #eee;
        border-left: 1px solid #eee;
    }
    svg {
        width: 100%;
        height: 100%;
    }
    .error-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #c62828;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: fadein 0.3s;
    }
    @keyframes fadein {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
