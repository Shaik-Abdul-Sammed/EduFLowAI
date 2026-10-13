import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { FeeReminderService } from '../../src/services/finance/FeeReminderService.js'

describe('FeeReminderService Unit Tests', () => {
  beforeEach(() => {
    FeeReminderService.clearReminderLogStore()
  })

  test('finds overdue invoices and categorizes into 4 progressive tiers', async () => {
    const overdue = await FeeReminderService.findOverdueInvoices(1)
    assert.ok(Array.isArray(overdue))
    assert.ok(overdue.length >= 4)

    const tiers = FeeReminderService.categorizeByOverdueDays(overdue)
    assert.ok(tiers.tier1.length > 0, 'Tier 1 (1-7 days) should contain invoices')
    assert.ok(tiers.tier2.length > 0, 'Tier 2 (8-30 days) should contain invoices')
    assert.ok(tiers.tier3.length > 0, 'Tier 3 (31-60 days) should contain invoices')
    assert.ok(tiers.tier4.length > 0, 'Tier 4 (60+ days) should contain invoices')
  })

  test('generates appropriate message tone for each overdue tier', () => {
    const sampleInv = {
      invoice_number: 'EDU-2026-TEST',
      contact_person: 'Ravi Teja',
      total_amount: 50000,
      due_date: '2026-10-01'
    }

    // Tier 1: 1-7 days (polite)
    const t1 = FeeReminderService.generateReminderMessage(sampleInv, 3)
    assert.equal(t1.tier, 'tier1')
    assert.ok(t1.subject.includes('Gentle Reminder'))
    assert.ok(t1.emailBody.includes('gentle reminder'))

    // Tier 2: 8-30 days (firm with late fee warning)
    const t2 = FeeReminderService.generateReminderMessage(sampleInv, 15)
    assert.equal(t2.tier, 'tier2')
    assert.ok(t2.subject.includes('Important Notice'))
    assert.ok(t2.emailBody.includes('late surcharge'))

    // Tier 3: 31-60 days (urgent with portal hold warning)
    const t3 = FeeReminderService.generateReminderMessage(sampleInv, 45)
    assert.equal(t3.tier, 'tier3')
    assert.ok(t3.subject.includes('URGENT'))
    assert.ok(t3.emailBody.includes('portal suspension'))

    // Tier 4: 60+ days (final notice with HOD/Dean escalation)
    const t4 = FeeReminderService.generateReminderMessage(sampleInv, 75)
    assert.equal(t4.tier, 'tier4')
    assert.ok(t4.subject.includes('FINAL STATUTORY NOTICE'))
    assert.ok(t4.emailBody.includes('escalated to the Dean'))
  })

  test('dispatches reminder and records in fee reminder log', async () => {
    const sampleInv = {
      id: 201,
      invoice_number: 'EDU-2026-999',
      contact_person: 'Sneha Rao',
      contact_email: 'sneha@demo.edu',
      contact_phone: '+919876543210',
      total_amount: 60000,
      daysOverdue: 10
    }

    const resEmail = await FeeReminderService.sendReminder(sampleInv, 'EMAIL', 1)
    assert.equal(resEmail.success, true)
    assert.equal(resEmail.log.channel, 'EMAIL')

    const resWA = await FeeReminderService.sendReminder(sampleInv, 'WHATSAPP', 1)
    assert.equal(resWA.success, true)
    assert.equal(resWA.log.channel, 'WHATSAPP')

    const history = await FeeReminderService.getHistory(1, 10)
    assert.ok(history.length >= 2)
  })

  test('updates and retrieves reminder settings and cadences', async () => {
    const updated = await FeeReminderService.updateSettings(1, {
      cadence_days: [1, 5, 10, 20, 30],
      channels: { email: true, whatsapp: true, sms: true },
      enabled: true
    })

    assert.equal(updated.cadence_days.length, 5)
    assert.equal(updated.channels.sms, true)

    const retrieved = await FeeReminderService.getSettings(1)
    assert.equal(retrieved.enabled, true)
  })
})
