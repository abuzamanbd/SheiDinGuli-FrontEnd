import { authenticate } from '@/lib/auth/handlers';

export const POST = (request: Request) => authenticate('login', request);
