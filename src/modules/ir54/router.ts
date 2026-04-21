import { NextFunction, Request, Response, Router } from 'express';

import { authenticateUser } from 'schema/user/services';

import {
  createIr54RecordController,
  getIr54DocumentController,
  getIr54RecordController,
  listIr54RecordsController,
  updateIr54RecordController,
} from './controller';

const router = Router();

const requireIr54Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authenticateUser(req);

    if (!user) {
      res.status(401).json({
        message: 'Authentication is required to access IR54 resources.',
      });
      return;
    }

    (req as Request & { currentUser?: typeof user }).currentUser = user;
    next();
  } catch (_error) {
    res.status(401).json({
      message: 'Authentication is required to access IR54 resources.',
    });
  }
};

router.use(requireIr54Auth);

router.get('/list', listIr54RecordsController);
router.post('/', createIr54RecordController);
router.get('/:id/documents/:documentField', getIr54DocumentController);
router.get('/:id', getIr54RecordController);
router.put('/:id', updateIr54RecordController);

export default router;
