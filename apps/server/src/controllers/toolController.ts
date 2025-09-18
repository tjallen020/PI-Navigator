import { Request, Response } from 'express';
import { dataService } from '../services/dataService';

export const getTools = (req: Request, res: Response) => {
  res.json(dataService.getTools());
};

export const getToolByKey = (req: Request, res: Response) => {
  const tool = dataService.getToolByKey(req.params.key);
  if (!tool) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  res.json(tool);
};

export const getPackages = (req: Request, res: Response) => {
  res.json(dataService.getPackages());
};

export const getPackageByKey = (req: Request, res: Response) => {
  const pkg = dataService.getPackageByKey(req.params.id);
  if (!pkg) {
    return res.status(404).json({ message: 'Package not found' });
  }
  res.json(pkg);
};
