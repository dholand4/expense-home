import prisma from '../config/prisma.js';

/**
 * Returns an array of user IDs whose data the current user may read:
 * their own ID + IDs of users who granted them accepted shared access.
 */
export async function getViewableUserIds(userId, userEmail) {
  const granted = await prisma.sharedAccess.findMany({
    where: { shared_with_email: userEmail, status: 'accepted' },
    select: { owner: { select: { id: true } } },
  });
  return [userId, ...granted.map((g) => g.owner.id)];
}
