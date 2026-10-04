import { DemoDataRepository } from '../models/DemoDataRepository.js';
import { predictNaacGrade } from '../services/naac/gradePredictor.js';

export class DemoDataController {
  static async getStats(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1;
      const stats = await DemoDataRepository.getStats(institutionId);
      return res.json({ success: true, ...stats });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getStudents(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const page = parseInt(req.query.page, 10) || 1;
      const department = req.query.department;
      const result = await DemoDataRepository.getStudents({ limit, page, department });
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getFaculty(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const page = parseInt(req.query.page, 10) || 1;
      const department = req.query.department;
      const result = await DemoDataRepository.getFaculty({ limit, page, department });
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getCourses(req, res) {
    try {
      const department = req.query.department;
      const courses = await DemoDataRepository.getCourses({ department });
      return res.json({ success: true, count: courses.length, courses });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getPlacements(req, res) {
    try {
      const company = req.query.company;
      const placements = await DemoDataRepository.getPlacements({ company });
      return res.json({ success: true, count: placements.length, placements });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getResearch(req, res) {
    try {
      let isScopus;
      if (req.query.isScopus === 'true') isScopus = true;
      if (req.query.isScopus === 'false') isScopus = false;
      const research = await DemoDataRepository.getResearch({ isScopus });
      return res.json({ success: true, count: research.length, research });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getInfrastructure(req, res) {
    try {
      const type = req.query.type;
      const infrastructure = await DemoDataRepository.getInfrastructure({ type });
      return res.json({ success: true, count: infrastructure.length, infrastructure });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getNaacPrediction(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1;
      const prediction = await predictNaacGrade(institutionId);
      return res.json(prediction);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default DemoDataController;
