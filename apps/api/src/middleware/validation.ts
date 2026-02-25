import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Invalid input', details: errors.array() });
    return;
  }
  next();
}

export const validateAnalyzeText = [
  body('text').isString().trim().isLength({ min: 1, max: 500000 })
    .withMessage('Text must be between 1 and 500,000 characters'),
  body('context').optional().isIn(['textual_sentence', 'citation_sentence', 'citation_clause']),
  handleValidationErrors,
];

export const validateBuild = [
  body('input').optional().isString().trim().isLength({ min: 1, max: 50000 })
    .withMessage('Input must be between 1 and 50,000 characters'),
  body('citationType').optional().isString(),
  body('fields').optional().isObject(),
  handleValidationErrors,
];

export const validateSearch = [
  body('query').isString().trim().isLength({ min: 1, max: 500 })
    .withMessage('Query must be between 1 and 500 characters'),
  body('citationType').optional().isString(),
  handleValidationErrors,
];

export const validateFromUrl = [
  body('url').isURL().withMessage('A valid URL is required'),
  body('citationType').optional().isString(),
  handleValidationErrors,
];

export const validateCheckUrl = [
  body('url').isURL().withMessage('A valid URL is required'),
  handleValidationErrors,
];
