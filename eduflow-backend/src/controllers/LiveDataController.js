import { LiveDataAggregator } from '../services/live/LiveDataAggregator.js'
import { GoogleSearchService } from '../services/live/GoogleSearchService.js'

export class LiveDataController {
  static async getStatus(req, res) {
    try {
      const memoryCache = LiveDataAggregator.getMemoryCache()
      const searchCache = GoogleSearchService.getCache()
      const dailyQueryCount = GoogleSearchService.getDailyQueryCount()

      return res.status(200).json({
        service: 'EduFlow Real-Time Data Intelligence',
        activeFeedsCount: 6,
        sources: [
          { name: 'NIRF Rankings 2024', status: 'SYNCED', updateFrequency: '48h', key: 'nirf' },
          { name: 'NAAC Regulatory Reforms', status: 'SYNCED', updateFrequency: '12h', key: 'naac' },
          { name: 'AICTE Approval Handbook Norms', status: 'SYNCED', updateFrequency: '12h', key: 'aicte' },
          { name: 'UGC NEP-2020 Regulations', status: 'SYNCED', updateFrequency: '24h', key: 'ugc' },
          { name: 'Academic & Gazetted Holidays', status: 'SYNCED', updateFrequency: '7d', key: 'holidays' },
          { name: 'Education Sector News', status: 'SYNCED', updateFrequency: '6h', key: 'news' }
        ],
        googleSearchApi: {
          configured: !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX),
          dailyQueriesUsed: dailyQueryCount,
          dailyLimit: Number(process.env.GOOGLE_SEARCH_MAX_DAILY || 100),
          cachedSearchEntries: searchCache.size
        },
        cachedRecordsCount: memoryCache.size,
        lastRefreshedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('[LiveDataController] Status error:', err)
      return res.status(500).json({ error: 'Failed to retrieve live data status' })
    }
  }

  static async getNIRF(req, res) {
    try {
      const institution = req.query.institution || 'Sri Siddhartha Institute of Technology'
      const year = req.query.year || 2024
      const data = await LiveDataAggregator.fetchNIRFRankings(institution, year)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[LiveDataController] NIRF error:', err)
      return res.status(500).json({ error: 'Failed to fetch NIRF rankings' })
    }
  }

  static async getNAAC(req, res) {
    try {
      const data = await LiveDataAggregator.fetchNAACAnnouncements()
      return res.status(200).json(data)
    } catch (err) {
      console.error('[LiveDataController] NAAC error:', err)
      return res.status(500).json({ error: 'Failed to fetch NAAC announcements' })
    }
  }

  static async getAICTE(req, res) {
    try {
      const data = await LiveDataAggregator.fetchAICTENotifications()
      return res.status(200).json(data)
    } catch (err) {
      console.error('[LiveDataController] AICTE error:', err)
      return res.status(500).json({ error: 'Failed to fetch AICTE notifications' })
    }
  }

  static async getUGC(req, res) {
    try {
      const data = await LiveDataAggregator.fetchUGCRegulations()
      return res.status(200).json(data)
    } catch (err) {
      console.error('[LiveDataController] UGC error:', err)
      return res.status(500).json({ error: 'Failed to fetch UGC regulations' })
    }
  }

  static async getHolidays(req, res) {
    try {
      const state = req.query.state || 'Karnataka'
      const year = req.query.year || 2026
      const data = await LiveDataAggregator.fetchGovernmentHolidays(state, year)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[LiveDataController] Holidays error:', err)
      return res.status(500).json({ error: 'Failed to fetch holidays' })
    }
  }

  static async getNews(req, res) {
    try {
      const topic = req.query.topic || 'higher education accreditation'
      const data = await LiveDataAggregator.fetchEducationNews(topic)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[LiveDataController] News error:', err)
      return res.status(500).json({ error: 'Failed to fetch education news' })
    }
  }

  static async search(req, res) {
    try {
      const { query, category, num } = req.body || {}
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' })
      }
      const results = await GoogleSearchService.search(query, { category, num: num || 5 })
      return res.status(200).json(results)
    } catch (err) {
      console.error('[LiveDataController] Search error:', err)
      return res.status(500).json({ error: 'Failed to execute live search' })
    }
  }

  static async refreshAll(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const data = await LiveDataAggregator.refreshAllSources(institutionId)
      return res.status(200).json({
        success: true,
        message: 'All external live data feeds refreshed successfully',
        data
      })
    } catch (err) {
      console.error('[LiveDataController] Refresh error:', err)
      return res.status(500).json({ error: 'Failed to refresh live data feeds' })
    }
  }
}
