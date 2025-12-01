import { Server } from 'socket.io';

const ioHandler = (req) => {
  if (!global.io) {
    console.log('New Socket.io server...');
    // Create a new Socket.io server
    global.io = new Server({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 20000
    });

    // Socket.io event handlers
    global.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('joinAuction', (auctionId) => {
        socket.join(auctionId);
        console.log(`🔹 Participant ${socket.id} joined auction ${auctionId}`);
      });
      
      socket.on('newBidIncrement', (data) => {
        const { auctionId, bidAmount, bidderName, bidderEmail } = data;
        
        if (!socket.rooms.has(auctionId)) {
          socket.join(auctionId);
          console.log(`🔹 Automatically joined auction ${auctionId} for ${socket.id}`);
        }
      
        console.log(`📢 Broadcasting bid in room: ${auctionId}`);
        
        // Notify all participants about the new bid
        socket.to(auctionId).emit('newBid', {
          bidderName,
          bidAmount,
          bidderEmail,
          message: `${bidderName} placed a new bid of $${bidAmount} in the auction.`,
        });

        // Notify the previous highest bidder that they've been outbid
        socket.to(auctionId).emit('outbid', {
          bidderName,
          bidAmount,
          bidderEmail,
          message: `You've been outbid! ${bidderName} placed a higher bid of $${bidAmount}.`,
        });
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  return new Response('Socket is running', {
    status: 200,
  });
};

export const GET = ioHandler;
export const POST = ioHandler; 