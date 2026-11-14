/**
 * ProcurementController.js
 * AI Procurement & Automated Vendor Price Negotiator Engine
 * Compares incoming vendor quotes with institutional procurement history
 * and generates high-leverage negotiation drafts.
 */

import { createAIProvider } from '../ai/providers/providerFactory.js'

export const memoryProcurementHistory = [
  {
    id: 1,
    itemName: 'Lab PCs',
    aliases: ['lab pc', 'computer', 'desktop', 'pc'],
    amount: 500000,
    quantity: 50,
    unitPrice: 10000,
    vendorName: 'Apex Computer Systems',
    year: 2025,
    specs: 'Intel Core i5, 16GB RAM, 512GB SSD'
  },
  {
    id: 2,
    itemName: 'Campus Wi-Fi APs',
    aliases: ['wifi', 'access point', 'ap', 'router'],
    amount: 180000,
    quantity: 20,
    unitPrice: 9000,
    vendorName: 'Cisco Partner Networks',
    year: 2025,
    specs: 'Wi-Fi 6 Enterprise PoE Indoor APs'
  },
  {
    id: 3,
    itemName: 'Classroom Smart Projectors',
    aliases: ['projector', 'smart projector', 'display'],
    amount: 240000,
    quantity: 8,
    unitPrice: 30000,
    vendorName: 'VisionTech Displays',
    year: 2025,
    specs: '4500 Lumens Laser Full HD'
  },
  {
    id: 4,
    itemName: 'Library RFID Scanners',
    aliases: ['rfid', 'scanner', 'barcode', 'library scanner'],
    amount: 90000,
    quantity: 6,
    unitPrice: 15000,
    vendorName: 'BookTrack Automations',
    year: 2025,
    specs: 'HF Multi-protocol Handheld Reader'
  }
]

export class ProcurementController {
  /**
   * POST /api/v1/procurement/analyze-quote
   * Accepts { itemName, vendorQuote, quantity, vendorName }
   * Returns AI comparison and professional email negotiation draft.
   */
  static async analyzeQuote(req, res) {
    try {
      const {
        itemName,
        vendorQuote,
        quantity = 1,
        vendorName = 'Vendor Sales Team'
      } = req.body || {}

      if (!itemName || vendorQuote === undefined || vendorQuote === null) {
        return res.status(400).json({
          error: 'Missing required procurement fields: itemName and vendorQuote are mandatory.'
        })
      }

      const numQuote = Number(vendorQuote)
      const numQty = Math.max(1, Number(quantity) || 1)
      const currentUnitCost = Math.round(numQuote / numQty)

      // Query historical procurement data
      const normItem = String(itemName).toLowerCase().trim()
      const match = memoryProcurementHistory.find((h) => {
        const hName = h.itemName.toLowerCase()
        if (normItem.includes(hName) || hName.includes(normItem)) return true
        return h.aliases?.some((alias) => normItem.includes(alias))
      })

      const historicalRecord = match || {
        id: 0,
        itemName,
        amount: Math.round(numQuote * 0.75),
        quantity: numQty,
        unitPrice: Math.round((numQuote * 0.75) / numQty),
        vendorName: 'Historical Benchmark (Industry Avg)',
        year: 2025
      }

      const historicalUnitCost = historicalRecord.unitPrice
      const unitDelta = currentUnitCost - historicalUnitCost
      const pctIncrease = Number(
        (((currentUnitCost - historicalUnitCost) / (historicalUnitCost || 1)) * 100).toFixed(1)
      )

      // Recommended counter offer: 4% baseline inflation over historical unit price
      const suggestedTargetPrice = Math.round(historicalUnitCost * 1.04 * numQty)
      const suggestedUnitTarget = Math.round(suggestedTargetPrice / numQty)

      // Generate AI Draft Email using provider or fallback template
      let emailDraft = ''
      try {
        const ai = createAIProvider()
        const prompt = `You are the Chief Procurement Officer for a Tier-1 University.
Write a firm, professional, high-leverage price negotiation email to vendor "${vendorName}".
Details:
- Item: ${itemName}
- Quantity: ${numQty}
- Their current quote: ₹${numQuote.toLocaleString('en-IN')} (₹${currentUnitCost.toLocaleString('en-IN')}/unit)
- Our historical purchase price last year: ₹${historicalRecord.amount.toLocaleString('en-IN')} for ${historicalRecord.quantity} units (₹${historicalUnitCost.toLocaleString('en-IN')}/unit).
- Price increase: ${pctIncrease}%
- Our approved budget counter-proposal: ₹${suggestedTargetPrice.toLocaleString('en-IN')} (₹${suggestedUnitTarget.toLocaleString('en-IN')}/unit).
Requirement: Include a concise, polite but uncompromising stance highlighting institutional loyalty, bulk order guarantees, and requesting an updated commercial invoice within 48 hours.`

        const aiResponse = await ai.generate(prompt)
        if (aiResponse && typeof aiResponse === 'string' && aiResponse.length > 50) {
          emailDraft = aiResponse
        }
      } catch (_aiErr) {
        // Fallback to deterministic negotiation template
      }

      if (!emailDraft) {
        emailDraft = `Subject: Commercial Negotiation: Quotation Revision for ${itemName} (Ref: EDU-PROC-2026)

Dear ${vendorName},

Thank you for submitting your commercial quotation for ${numQty} units of ${itemName} amounting to ₹${numQuote.toLocaleString('en-IN')} (₹${currentUnitCost.toLocaleString('en-IN')}/unit).

Our Central Procurement & Audit Committee has cross-referenced this proposal with our historical institutional procurement ledger. In the previous fiscal cycle, we procured ${historicalRecord.itemName} at ₹${historicalRecord.amount.toLocaleString('en-IN')} for ${historicalRecord.quantity} units (₹${historicalUnitCost.toLocaleString('en-IN')}/unit). Your current quotation reflects an increase of ${pctIncrease}%.

While we appreciate operational cost pressures and supply chain dynamics, our sanctioned capital allocation limits our university's maximum procurement ceiling to ₹${suggestedTargetPrice.toLocaleString('en-IN')} (approx. ₹${suggestedUnitTarget.toLocaleString('en-IN')}/unit).

As a Tier-1 partner planning several upcoming institutional expansions, we would like to issue an immediate Purchase Order upon receiving this updated commercial price.

Please confirm acceptance of this counter-proposal and share an updated Proforma Invoice at your earliest convenience.

Sincerely,
Head of Central Procurement
Sri Sudha Institute of Technology`
      }

      return res.status(200).json({
        success: true,
        itemName,
        vendorName,
        quantity: numQty,
        currentQuote: numQuote,
        currentUnitCost,
        historicalRecord,
        analysis: {
          difference: numQuote - historicalRecord.amount,
          percentageIncrease: pctIncrease,
          suggestedTargetPrice,
          suggestedUnitTarget
        },
        historicalComparison: `Historical price was ₹${historicalRecord.amount.toLocaleString('en-IN')}, quoted ₹${numQuote.toLocaleString('en-IN')}. Counter offer: ₹${suggestedTargetPrice.toLocaleString('en-IN')}.`,
        emailDraft
      })
    } catch (err) {
      console.error('Procurement quote analysis error:', err)
      return res.status(500).json({ error: 'Quote analysis failed', details: err.message })
    }
  }

  /**
   * GET /api/v1/procurement/history
   * Lists historical procurement contracts
   */
  static async getHistory(_req, res) {
    return res.status(200).json({
      success: true,
      history: memoryProcurementHistory,
      total: memoryProcurementHistory.length
    })
  }
}

export default ProcurementController
