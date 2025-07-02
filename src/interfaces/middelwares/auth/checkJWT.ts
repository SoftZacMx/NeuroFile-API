import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../../../shared/types/RequestWithUser';
import { TokenService } from '../../../infrastructure/services/TokenServiceImpl';

const tokenService = new TokenService();

export const checkJWT = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Invalid token format' });
    return;
  }

  try {
    const payload = tokenService.verify(token);

    if (!payload) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    req.user = payload;
    next(); // ✅ termina con next
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
