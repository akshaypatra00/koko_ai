import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'koko-ai-server',
    status: 'healthy',
  });
});

export default router;
