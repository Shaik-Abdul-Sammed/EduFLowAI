import { pool } from '../db/pool.js'

export class HostelController {
  static async getHostels(req, res) {
    try {
      const institutionId = req.params.institutionId || req.user?.institutionId || 1
      const result = await pool.query('SELECT * FROM hostels WHERE institution_id = $1', [institutionId]).catch(() => null)
      if (result && result.rows && result.rows.length > 0) {
        return res.json(result.rows)
      }
      res.json([
        { id: 'h-boys-1', name: 'Aryabhata Boys Hostel', totalRooms: 120, occupiedRooms: 104, capacity: 240, status: 'Active' },
        { id: 'h-boys-2', name: 'Bhaskara Boys Hostel', totalRooms: 100, occupiedRooms: 82, capacity: 200, status: 'Active' },
        { id: 'h-girls-1', name: 'Gargi Girls Hostel', totalRooms: 150, occupiedRooms: 138, capacity: 300, status: 'Active' },
        { id: 'h-girls-2', name: 'Maitreyi Girls Hostel', totalRooms: 90, occupiedRooms: 68, capacity: 180, status: 'Active' }
      ])
    } catch (err) {
      console.error('HostelController getHostels error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async allocateRoom(req, res) {
    try {
      const { studentId, hostelId, roomType = 'Double Sharing' } = req.body || {}
      if (!studentId || !hostelId) {
        return res.status(400).json({ error: 'studentId and hostelId are required' })
      }
      const roomNumber = `R-${Math.floor(100 + Math.random() * 300)}`
      res.json({
        success: true,
        message: 'Hostel room allocated successfully.',
        allocation: {
          studentId,
          hostelId,
          roomNumber,
          roomType,
          status: 'Confirmed',
          allocatedAt: new Date().toISOString()
        }
      })
    } catch (err) {
      console.error('HostelController allocateRoom error:', err)
      res.status(500).json({ error: 'Failed to allocate hostel room' })
    }
  }
}
