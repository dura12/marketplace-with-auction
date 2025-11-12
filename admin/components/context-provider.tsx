"use client"

import { SessionProvider } from 'next-auth/react';
import React from 'react'

const ContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
    return (
        <SessionProvider>
                {children}
        </SessionProvider>
    );
}

export default ContextProvider;
