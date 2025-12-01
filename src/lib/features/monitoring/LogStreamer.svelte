<script lang="ts">
    import { onMount, onDestroy, getContext } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';
    import { createApiClient } from '../../meili/utils/api';

    const { client } = getContext<MeiliContext>('meili');
    const api = createApiClient(client);

    let logs = $state({ 
        lines: [] as string[], 
        status: 'disconnected' as 'disconnected' | 'connecting' | 'streaming' | 'error' 
    });
    let streamController: AbortController | null = null;
    let errorMsg = $state<string | null>(null);

    // Configuration
    const MAX_LINES = 1000;

    async function startLogStream() {
        if (logs.status === 'streaming' || logs.status === 'connecting') return;

        logs.status = 'connecting';
        errorMsg = null;
        streamController = new AbortController();

        try {
            const config = api.getConfig();
            const host = config.host;
            const apiKey = config.apiKey;

            const response = await fetch(`${host}/logs/stream`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'fmt',
                    target: 'info'
                }),
                signal: streamController.signal
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Logs route not found. Ensure Meilisearch is launched with --experimental-enable-logs-route');
                }
                throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            logs.status = 'streaming';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

                if (lines.length > 0) {
                    queueLines(lines);
                }
            }

        } catch (e: any) {
            if (e.name === 'AbortError') {
                logs.status = 'disconnected';
            } else {
                logs.status = 'error';
                errorMsg = e.message;
            }
        } finally {
            if (logs.status === 'streaming') {
                logs.status = 'disconnected';
            }
        }
    }

    let pendingLines: string[] = [];
    let rafId: number | null = null;

    function queueLines(newLines: string[]) {
        pendingLines.push(...newLines);
        if (!rafId) {
            rafId = requestAnimationFrame(flushLines);
        }
    }

    function flushLines() {
        if (pendingLines.length > 0) {
            // Rolling window update
            const allLines = [...logs.lines, ...pendingLines];
            logs.lines = allLines.slice(-MAX_LINES);
            pendingLines = [];
        }
        rafId = null;
    }

    function stopLogStream() {
        if (streamController) {
            streamController.abort();
            streamController = null;
        }
        logs.status = 'disconnected';
    }

    onMount(() => {
        startLogStream();
    });

    onDestroy(() => {
        stopLogStream();
        if (rafId) cancelAnimationFrame(rafId);
    });

</script>

<div class="log-streamer">
    <div class="header">
        <h3>Real-time Logs</h3>
        <div class="controls">
            <span class="status {logs.status}">{logs.status}</span>
            {#if logs.status === 'streaming' || logs.status === 'connecting'}
                <button onclick={stopLogStream}>Stop</button>
            {:else}
                <button onclick={startLogStream}>Start</button>
            {/if}
            <button onclick={() => logs.lines = []}>Clear</button>
        </div>
    </div>

    {#if errorMsg}
        <div class="error">
            <strong>Error:</strong> {errorMsg}
            <br>
            <small>Note: Logs are experimental. Check if enabled via <code>--experimental-enable-logs-route</code>.</small>
        </div>
    {/if}

    <div class="log-container">
        {#each logs.lines as line}
            <div class="log-line">{line}</div>
        {/each}
        {#if logs.lines.length === 0 && logs.status === 'streaming'}
            <div class="empty">Waiting for logs...</div>
        {/if}
    </div>
</div>

<style>
    .log-streamer {
        border: 1px solid #333;
        background: #1e1e1e;
        color: #d4d4d4;
        border-radius: 4px;
        font-family: 'Consolas', 'Monaco', monospace;
        display: flex;
        flex-direction: column;
        height: 400px;
        margin-top: 1rem;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: #252526;
        border-bottom: 1px solid #333;
    }
    .header h3 {
        margin: 0;
        font-size: 1em;
        color: #fff;
    }
    .controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    .status {
        font-size: 0.8em;
        text-transform: uppercase;
        font-weight: bold;
    }
    .status.streaming { color: #4caf50; }
    .status.disconnected { color: #9e9e9e; }
    .status.error { color: #f44336; }
    .status.connecting { color: #ff9800; }

    .log-container {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        font-size: 0.9em;
        white-space: pre-wrap;
        word-break: break-all;
    }
    .log-line {
        margin-bottom: 2px;
        line-height: 1.4;
    }
    .error {
        background: #b71c1c;
        color: white;
        padding: 8px;
        font-size: 0.9em;
    }
    .empty {
        color: #666;
        font-style: italic;
        padding: 10px;
    }
    button {
        background: #3c3c3c;
        color: white;
        border: 1px solid #555;
        padding: 4px 12px;
        cursor: pointer;
        font-size: 0.8em;
        border-radius: 2px;
    }
    button:hover {
        background: #505050;
    }
</style>
