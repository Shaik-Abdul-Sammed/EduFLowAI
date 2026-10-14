import { pool } from '../db/pool.js'
import { ComplianceService } from '../services/compliance/ComplianceService.js'

/**
 * Retention Enforcer Worker
 * Automatically enforces data retention policies by purging expired logs and audit trails.
 */
export async function runRetentionPurge(institutionId = null) {
  const results = {
    purgedAt: new Date().toISOString(),
    policiesProcessed: 0,
    recordsPurged: 0,
    details: []
  }

  try {
    let policies = []
    if (pool.isMemoryMode) {
      policies = ComplianceService.getRetentionPoliciesStore().filter(p => !institutionId || p.institution_id === Number(institutionId))
    } else {
      const q = institutionId 
        ? 'SELECT * FROM retention_policies WHERE is_active = true AND auto_delete = true AND institution_id = $1'
        : 'SELECT * FROM retention_policies WHERE is_active = true AND auto_delete = true'
      const args = institutionId ? [institutionId] : []
      const res = await pool.query(q, args)
      policies = res.rows || []
    }

    for (const policy of policies) {
      results.policiesProcessed++
      const retentionDays = Number(policy.retention_days) || 365
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
      let count = 0

      if (policy.data_type === 'AUDIT_LOGS') {
        if (!pool.isMemoryMode) {
          const delRes = await pool.query(
            'DELETE FROM audit_logs WHERE institution_id = $1 AND created_at < $2',
            [policy.institution_id, cutoffDate]
          )
          count = delRes.rowCount || 0
        }
      } else if (policy.data_type === 'COMPLIANCE_EVENTS') {
        if (!pool.isMemoryMode) {
          const delRes = await pool.query(
            'DELETE FROM compliance_events WHERE institution_id = $1 AND created_at < $2',
            [policy.institution_id, cutoffDate]
          )
          count = delRes.rowCount || 0
        }
      }

      // Update policy last_purge_at
      if (pool.isMemoryMode) {
        policy.last_purge_at = new Date().toISOString()
      } else {
        await pool.query(
          'UPDATE retention_policies SET last_purge_at = NOW(), updated_at = NOW() WHERE id = $1',
          [policy.id]
        )
      }

      results.recordsPurged += count
      results.details.push({
        dataType: policy.data_type,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        purgedRecords: count
      })
    }
  } catch (err) {
    console.error('[RetentionEnforcer] Error during retention purge:', err)
    results.error = err.message
  }

  return results
}

let workerInterval = null

export function startRetentionWorker(intervalMs = 24 * 60 * 60 * 1000) {
  if (workerInterval) return workerInterval
  console.log(`[RetentionEnforcer] Scheduled retention enforcer every ${intervalMs / 1000 / 60} minutes`)
  // Run once shortly after startup
  setTimeout(() => {
    runRetentionPurge().catch(err => console.error('[RetentionEnforcer] Initial run failed:', err))
  }, 10000)

  workerInterval = setInterval(() => {
    runRetentionPurge().catch(err => console.error('[RetentionEnforcer] Periodic run failed:', err))
  }, intervalMs)

  return workerInterval
}

export function stopRetentionWorker() {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }
}
