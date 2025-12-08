import { useEffect, useCallback } from 'react';
   import { socket, addNotificationListener, removeNotificationListener } from './socketClient';

   export const useSocket = () => {
       useEffect(() => {
           return () => {
               // Keep socket alive for the entire app
           };
       }, []);

       const joinAuction = useCallback((auctionId) => {
           if (socket) {
               socket.emit('joinAuction', auctionId);
           }
       }, []);

       const placeBid = useCallback((data) => {
           if (socket) {
               socket.emit('newBidIncrement', data);
           }
       }, []);

       const onNewBid = useCallback((callback) => {
           addNotificationListener((notification) => {
               if (notification.type === 'bid') callback(notification);
           });
           return () => removeNotificationListener(callback);
       }, []);

       const onOutbid = useCallback((callback) => {
           addNotificationListener((notification) => {
               if (notification.type === 'outbid') callback(notification);
           });
           return () => removeNotificationListener(callback);
       }, []);

       return {
           joinAuction,
           placeBid,
           onNewBid,
           onOutbid,
       };
   };