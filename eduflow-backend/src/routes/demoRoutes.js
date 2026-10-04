import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { DemoDataController } from '../controllers/DemoDataController.js';
import { OfficerExportController } from '../controllers/OfficerExportController.js';

export function createDemoRouter() {
  const router = Router();

  router.use(authMiddleware);
  router.use(requireRole(['admin']));

  router.get('/stats', DemoDataController.getStats);
  router.get('/students', DemoDataController.getStudents);
  router.get('/faculty', DemoDataController.getFaculty);
  router.get('/courses', DemoDataController.getCourses);
  router.get('/placements', DemoDataController.getPlacements);
  router.get('/research', DemoDataController.getResearch);
  router.get('/infrastructure', DemoDataController.getInfrastructure);
  router.get('/naac-prediction', DemoDataController.getNaacPrediction);
  router.all('/naac-grade-report/pdf', (req, res) => {
    req.params.type = 'naac-grade-report';
    return OfficerExportController.exportPdf(req, res);
  });

  return router;
}

export default createDemoRouter;
