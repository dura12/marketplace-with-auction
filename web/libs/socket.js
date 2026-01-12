/**
 * Socket.io server utility
 * Returns the global Socket.io instance
 */

export function getIO() {
  if (!global.io) {
    console.warn('Socket.io server not initialized yet');
    return null;
  }
  return global.io;
}

export function setIO(io) {
  global.io = io;
}

