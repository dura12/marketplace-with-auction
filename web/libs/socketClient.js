'use client'
   import { io } from "socket.io-client";

   let socket;
   let notificationCallbacks = [];

   if (typeof window !== 'undefined') {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                     (process.env.NODE_ENV === 'production' 
                         ? window.location.origin 
                         : 'http://localhost:3000');

       socket = io(socketUrl, {
           path: '/socket.io/',
           transports: ['websocket', 'polling'],
           reconnection: true,
           reconnectionAttempts: 5,
           reconnectionDelay: 1000,
           timeout: 20000,
           forceNew: true
       });

       socket.on('connect_error', (error) => {
           console.error('Socket connection error:', error);
           console.log('Attempting to connect to:', socketUrl);
       });

       socket.on('connect', () => {
           console.log('Socket connected successfully to:', socketUrl);
           const userId = localStorage.getItem('userId'); // Adjust based on your auth system
           if (userId) {
               socket.emit('authenticate', userId);
           }
       });

       socket.on('disconnect', (reason) => {
           console.log('Socket disconnected:', reason);
       });

       socket.on('error', (error) => {
           console.error('Socket error:', error);
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
       if (socket) {
           notificationCallbacks.push(callback);
       }
   }

   export function removeNotificationListener(callback) {
       if (socket) {
           notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
       }
   }

   export { socket };