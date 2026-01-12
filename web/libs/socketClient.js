'use client'
   import { io } from "socket.io-client";

   let socket = null;
   let notificationCallbacks = [];
   let connectionAttempted = false;

   // Only attempt socket connection if explicitly enabled or in production
   const SOCKET_ENABLED = process.env.NEXT_PUBLIC_SOCKET_ENABLED === 'true' || 
                          process.env.NODE_ENV === 'production';

   if (typeof window !== 'undefined' && SOCKET_ENABLED) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                     (process.env.NODE_ENV === 'production' 
                         ? window.location.origin 
                         : 'http://localhost:3001');

       socket = io(socketUrl, {
           path: '/api/socket',
           transports: ['websocket', 'polling'],
           reconnection: true,
           reconnectionAttempts: 3,
           reconnectionDelay: 2000,
           timeout: 10000,
           forceNew: true,
           autoConnect: true
       });

       socket.on('connect_error', (error) => {
           if (!connectionAttempted) {
               console.warn('Socket connection unavailable (this is normal in development)');
               connectionAttempted = true;
           }
       });

       socket.on('connect', () => {
           console.log('Socket connected successfully to:', socketUrl);
           connectionAttempted = false;
           const userId = localStorage.getItem('userId');
           if (userId) {
               socket.emit('authenticate', userId);
           }
       });

       socket.on('disconnect', (reason) => {
           if (reason !== 'io client disconnect') {
               console.log('Socket disconnected:', reason);
           }
       });

       socket.on('error', (error) => {
           console.warn('Socket error:', error.message);
       });

       socket.on('newBid', (data) => {
           console.log('Received new bid notification:', data);
           const newNotification = {
               _id: Date.now().toString(), // Temporary ID; will be replaced by server ID
               title: "New Bid Placed",
               description: `${data.bidderName} placed a bid of $${data.bidAmount}`,
               time: "Just now",
               read: false,
               type: "bid",
               data: { auctionId: data.auctionId, bidAmount: data.bidAmount, bidderName: data.bidderName, bidderEmail: data.bidderEmail }
           };
           notificationCallbacks.forEach(cb => cb(newNotification));
       });

       socket.on('outbid', (data) => {
           console.log('Received outbid notification:', data);
           const userId = localStorage.getItem('userId'); // Adjust based on your auth system
           if (data.recipientId === userId) {
               const newNotification = {
                   _id: Date.now().toString(), // Temporary ID
                   title: "You've been outbid",
                   description: `${data.bidderName} outbid you with $${data.bidAmount}`,
                   time: "Just now",
                   read: false,
                   type: "outbid",
                   data: { auctionId: data.auctionId, bidAmount: data.bidAmount, bidderName: data.bidderName, bidderEmail: data.bidderEmail }
               };
               notificationCallbacks.forEach(cb => cb(newNotification));
           }
       });
       socket.on('auction_ended', (data) => {
        console.log('Received auction ended notification:', data);
        const userId = localStorage.getItem('userId');
        const newNotification = {
          _id: Date.now().toString(),
          title: "Auction Ended",
          description: data.winnerId === userId
            ? `Congratulations! You won the auction for ${data.auctionId} with $${data.highestBid}.`
            : `The auction for ${data.auctionId} has ended. The winner is ${data.winnerName} with $${data.highestBid}.`,
          time: "Just now",
          read: false,
          type: "ending",
          data: {
            auctionId: data.auctionId,
            highestBid: data.highestBid,
            winnerId: data.winnerId,
            winnerName: data.winnerName,
            winnerEmail: data.winnerEmail,
            reservedMet: data.reservedMet,
          },
        };
        notificationCallbacks.forEach(cb => cb(newNotification));
      });
   }

   export function addNotificationListener(callback) {
       notificationCallbacks.push(callback);
   }

   export function removeNotificationListener(callback) {
       notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
   }

   // Check if socket is connected
   export function isSocketConnected() {
       return socket?.connected || false;
   }

   export { socket };