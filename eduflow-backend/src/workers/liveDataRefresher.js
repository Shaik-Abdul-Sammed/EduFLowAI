import { LiveDataAggregator } from '../services/live/LiveDataAggregator.js'

let workerInterval = null

/**
 * Periodically refreshes all external live regulatory and ranking sources (NIRF, NAAC, AICTE, UGC, Holidays).
 */
export async function runLiveDataRefresh() {
  console.log('[LiveDataRefresher] Starting scheduled refresh of external live regulatory data...')
  try {
    const summary = await LiveDataAggregator.refreshAllSources()
    console.log(`[LiveDataRefresher] Live data refresh complete at ${summary.refreshedAt}.`)
    return summary
  } catch (err) {
    console.error('[LiveDataRefresher] Error during scheduled live data refresh:', err)
    return null
  }
}

export function startLiveDataWorker(intervalMs = 6 * 60 * 60 * 1000) {
  if (workerInterval) return workerInterval
  console.log(`[LiveDataRefresher] Scheduled live data aggregator every ${intervalMs / 1000 / 60 / 60} hours.`)

  // Initial trigger after server startup
  setTimeout(() => {
    runLiveDataRefresh().catch(e => console.error('[LiveDataRefresher] Initial run error:', e))
  }, 15000)

  workerInterval = setInterval(() => {
    runLiveDataRefresh().catch(e => console.error('[LiveDataRefresher] Periodic run error:', e))
  }, intervalMs)

  return workerInterval
}

export function stopLiveDataWorker() {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }
}
