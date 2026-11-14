import { pool } from '../db/pool.js'

// In-memory fallback
const memoryProfiles = [
  {
    id: 1,
    student_id: 101,
    student_roll: '2024-CSE-042',
    student_name: 'Aarav Sharma',
    xp_points: 1850,
    level: 8,
    badges_json: [
      { id: 'b1', name: '7-Day Wi-Fi Attendance Streak', icon: 'zap', unlockedAt: '2026-11-10' },
      { id: 'b2', name: 'Quantum Lab Pioneer', icon: 'atom', unlockedAt: '2026-11-12' },
      { id: 'b3', name: 'Code Master (Algorithms)', icon: 'terminal', unlockedAt: '2026-11-13' }
    ],
    rank: 1,
    streak_days: 7,
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    student_id: 102,
    student_roll: '2024-CSE-088',
    student_name: 'Riya Patel',
    xp_points: 1620,
    level: 7,
    badges_json: [
      { id: 'b1', name: 'Perfect Attendance', icon: 'zap', unlockedAt: '2026-11-09' },
      { id: 'b4', name: 'Peer Tutor Champion', icon: 'heart', unlockedAt: '2026-11-11' }
    ],
    rank: 2,
    streak_days: 5,
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    student_id: 103,
    student_roll: '2024-CSE-105',
    student_name: 'Kabir Verma',
    xp_points: 1390,
    level: 6,
    badges_json: [
      { id: 'b5', name: 'Research Contributor', icon: 'file-text', unlockedAt: '2026-11-08' }
    ],
    rank: 3,
    streak_days: 3,
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    student_id: 104,
    student_roll: '2024-ECE-019',
    student_name: 'Ananya Rao',
    xp_points: 1240,
    level: 5,
    badges_json: [
      { id: 'b6', name: 'Hardware Hacker', icon: 'cpu', unlockedAt: '2026-11-07' }
    ],
    rank: 4,
    streak_days: 4,
    updated_at: new Date().toISOString()
  }
]

export class GamificationController {
  /**
   * POST /api/v1/gamification/award-xp
   */
  static async awardXp(req, res) {
    try {
      const {
        studentId = 101,
        studentRoll = '2024-CSE-042',
        studentName = 'Aarav Sharma',
        activityType = 'LAB_COMPLETION',
        points = 100
      } = req.body || {}

      let profile = memoryProfiles.find(p => p.student_id === Number(studentId))

      if (!profile) {
        profile = {
          id: memoryProfiles.length + 1,
          student_id: Number(studentId),
          student_roll: studentRoll,
          student_name: studentName,
          xp_points: 0,
          level: 1,
          badges_json: [],
          rank: memoryProfiles.length + 1,
          streak_days: 1,
          updated_at: new Date().toISOString()
        }
        memoryProfiles.push(profile)
      }

      profile.xp_points += Number(points) || 50
      profile.level = Math.floor(profile.xp_points / 250) + 1
      profile.updated_at = new Date().toISOString()

      // Unlock new badge milestone
      if (profile.xp_points >= 500 && !profile.badges_json.some(b => b.id === 'badge-novice')) {
        profile.badges_json.push({ id: 'badge-novice', name: 'Bronze Scholar (500+ XP)', icon: 'award', unlockedAt: new Date().toISOString() })
      }
      if (profile.xp_points >= 1500 && !profile.badges_json.some(b => b.id === 'badge-elite')) {
        profile.badges_json.push({ id: 'badge-elite', name: 'Elite University Scholar', icon: 'sparkles', unlockedAt: new Date().toISOString() })
      }

      // Re-sort ranks
      memoryProfiles.sort((a, b) => b.xp_points - a.xp_points)
      memoryProfiles.forEach((p, index) => {
        p.rank = index + 1
      })

      try {
        await pool.query(
          `INSERT INTO gamification_profiles (student_id, student_roll, student_name, xp_points, level, badges_json, rank, streak_days)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (student_id) DO UPDATE SET
             xp_points = gamification_profiles.xp_points + $4,
             level = EXCLUDED.level,
             badges_json = EXCLUDED.badges_json,
             updated_at = NOW()`,
          [profile.student_id, profile.student_roll, profile.student_name, points, profile.level, JSON.stringify(profile.badges_json), profile.rank, profile.streak_days]
        )
      } catch {
        // Handled in memory
      }

      return res.status(200).json({
        success: true,
        message: `Successfully awarded ${points} XP for ${activityType}`,
        profile
      })
    } catch (err) {
      console.error('[GamificationController] Error:', err)
      return res.status(500).json({ error: 'Failed to award XP', details: err.message })
    }
  }

  /**
   * GET /api/v1/gamification/leaderboard
   */
  static async getLeaderboard(req, res) {
    try {
      try {
        const dbRes = await pool.query(
          `SELECT * FROM gamification_profiles ORDER BY xp_points DESC LIMIT 25`
        )
        if (dbRes.rows && dbRes.rows.length > 0) {
          return res.status(200).json({ success: true, leaderboard: dbRes.rows })
        }
      } catch {
        // Fallback
      }

      memoryProfiles.sort((a, b) => b.xp_points - a.xp_points)
      return res.status(200).json({
        success: true,
        leaderboard: memoryProfiles
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching leaderboard', details: err.message })
    }
  }

  /**
   * GET /api/v1/gamification/profile/:studentId
   */
  static async getProfile(req, res) {
    try {
      const studentId = parseInt(req.params.studentId || 101, 10)
      const found = memoryProfiles.find(p => p.student_id === studentId) || memoryProfiles[0]

      return res.status(200).json({
        success: true,
        profile: found
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching profile', details: err.message })
    }
  }
}
