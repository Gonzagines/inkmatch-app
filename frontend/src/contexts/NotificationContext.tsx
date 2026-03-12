"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Notification {
    id: number;
    user_id: string;
    tipo: string;
    mensaje: string;
    leido: boolean;
    borrado: boolean;
    referencia_id: number | null;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    deleteMultiple: (ids: number[]) => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchNotifications = async () => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', userId)
            .eq('borrado', false)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotifications(data);
        }
    };

    useEffect(() => {
        const initUser = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
                setUserId(data.session.user.id);
            }
        };
        initUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) setUserId(session.user.id);
            else {
                setUserId(null);
                setNotifications([]);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:notificaciones')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notificaciones',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
        await supabase.from('notificaciones').update({ leido: true }).eq('id', id);
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.leido).map(n => n.id);
        if (unreadIds.length === 0) return;
        
        setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
        await supabase.from('notificaciones').update({ leido: true }).in('id', unreadIds);
    };

    const deleteNotification = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await supabase.from('notificaciones').update({ borrado: true }).eq('id', id);
    };

    const deleteMultiple = async (ids: number[]) => {
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        await supabase.from('notificaciones').update({ borrado: true }).in('id', ids);
    };

    const unreadCount = notifications.filter(n => !n.leido).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                deleteMultiple,
                fetchNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
