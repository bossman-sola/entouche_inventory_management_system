import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { api } from "../api/entoucheApi.js";
import { mapApiNotification } from "../api/mappers.js";


function errorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}


function extractUnreadCount(response, notifications = []) {
  /*
   * Supports several reasonable API response shapes:
   *
   * { count: 4 }
   * { unread_count: 4 }
   * { unreadCount: 4 }
   * 4
   *
   * If none match, fall back to the loaded notifications.
   */
  if (typeof response === "number") {
    return response;
  }

  const count =
    response?.unread_count ??
    response?.unreadCount ??
    response?.count;

  if (count !== undefined && count !== null) {
    return Number(count) || 0;
  }

  return notifications.filter(
    (notification) => notification.unread
  ).length;
}


export function useNotifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialNotifications() {
      try {
        const [
          notificationResponse,
          unreadResponse,
        ] = await Promise.all([
          api.listNotifications(),
          api.getUnreadNotificationCount(),
        ]);

        if (cancelled) {
          return;
        }

        /*
         * entoucheApi.unwrap() already removes:
         *
         * {
         *   success,
         *   message,
         *   data,
         *   ...
         * }
         *
         * Therefore notificationResponse here should already
         * be the array contained in API "data".
         */
        const rows =
          Array.isArray(notificationResponse)
            ? notificationResponse
            : [];

        const mappedNotifications =
          rows
            .map(mapApiNotification)
            .filter(Boolean);

        setNotifications(
          mappedNotifications
        );

        setUnreadCount(
          extractUnreadCount(
            unreadResponse,
            mappedNotifications
          )
        );

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          errorMessage(
            err,
            "Couldn't load notifications."
          )
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialNotifications();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =======================================================
     RELOAD
  ======================================================= */

  const reload =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const [
          notificationResponse,
          unreadResponse,
        ] = await Promise.all([
          api.listNotifications(),
          api.getUnreadNotificationCount(),
        ]);

        const rows =
          Array.isArray(notificationResponse)
            ? notificationResponse
            : [];

        const mappedNotifications =
          rows
            .map(mapApiNotification)
            .filter(Boolean);

        setNotifications(
          mappedNotifications
        );

        setUnreadCount(
          extractUnreadCount(
            unreadResponse,
            mappedNotifications
          )
        );

        return mappedNotifications;
      } catch (err) {
        const message =
          errorMessage(
            err,
            "Couldn't load notifications."
          );

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    }, []);


  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const markAsRead =
    useCallback(async (notification) => {
      if (
        !notification?.id ||
        !notification.unread
      ) {
        return;
      }

      try {
        await api.markNotificationRead(
          notification.id
        );

        setNotifications(
          (current) =>
            current.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    unread: false,
                  }
                : item
            )
        );

        setUnreadCount(
          (current) =>
            Math.max(0, current - 1)
        );
      } catch (err) {
        const message =
          errorMessage(
            err,
            "Couldn't mark notification as read."
          );

        setError(message);

        throw err;
      }
    }, []);


  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const markAllAsRead =
    useCallback(async () => {
      try {
        await api.markAllNotificationsRead();

        setNotifications(
          (current) =>
            current.map((notification) => ({
              ...notification,
              unread: false,
            }))
        );

        setUnreadCount(0);
      } catch (err) {
        const message =
          errorMessage(
            err,
            "Couldn't mark notifications as read."
          );

        setError(message);

        throw err;
      }
    }, []);


  /* =======================================================
     DELETE
  ======================================================= */

  const deleteNotification =
    useCallback(async (notification) => {
      if (!notification?.id) {
        return;
      }

      try {
        await api.deleteNotification(
          notification.id
        );

        setNotifications(
          (current) =>
            current.filter(
              (item) =>
                item.id !== notification.id
            )
        );

        if (notification.unread) {
          setUnreadCount(
            (current) =>
              Math.max(0, current - 1)
          );
        }
      } catch (err) {
        const message =
          errorMessage(
            err,
            "Couldn't delete notification."
          );

        setError(message);

        throw err;
      }
    }, []);


  return {
    notifications,
    unreadCount,
    loading,
    error,

    reload,

    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}