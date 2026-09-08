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


function extractNotificationRows(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}


function extractPagination(response) {
  return {
    currentPage:
      Number(
        response?.meta?.current_page ??
        response?.current_page ??
        1
      ) || 1,

    lastPage:
      Number(
        response?.meta?.last_page ??
        response?.last_page ??
        1
      ) || 1,
  };
}


export function useNotifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);


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
          api.listNotifications({
            page: 1,
            per_page: 15,
          }),
          api.getUnreadNotificationCount(),
        ]);

        if (cancelled) {
          return;
        }

        const rows =
          extractNotificationRows(
            notificationResponse
          );

        const mappedNotifications =
          rows
            .map(mapApiNotification)
            .filter(Boolean);

        const pagination =
          extractPagination(
            notificationResponse
          );

        setNotifications(
          mappedNotifications
        );

        setPage(
          pagination.currentPage
        );

        setLastPage(
          pagination.lastPage
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
     LOAD MORE
  ======================================================= */

  const loadMore =
    useCallback(async () => {
      if (
        loadingMore ||
        page >= lastPage
      ) {
        return;
      }

      const nextPage =
        page + 1;

      try {
        setLoadingMore(true);

        const response =
          await api.listNotifications({
            page: nextPage,
            per_page: 15,
          });

        const rows =
          extractNotificationRows(
            response
          );

        const mappedNotifications =
          rows
            .map(mapApiNotification)
            .filter(Boolean);

        const pagination =
          extractPagination(
            response
          );

        setNotifications((current) => {
          const existingIds =
            new Set(
              current.map((item) =>
                String(item.id)
              )
            );

          const uniqueNewNotifications =
            mappedNotifications.filter(
              (item) =>
                !existingIds.has(
                  String(item.id)
                )
            );

          return [
            ...current,
            ...uniqueNewNotifications,
          ];
        });

        setPage(
          pagination.currentPage
        );

        setLastPage(
          pagination.lastPage
        );

        setError("");
      } catch (err) {
        setError(
          errorMessage(
            err,
            "Couldn't load more notifications."
          )
        );
      } finally {
        setLoadingMore(false);
      }
    }, [
      loadingMore,
      page,
      lastPage,
    ]);


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
          api.listNotifications({
            page: 1,
            per_page: 15,
          }),
          api.getUnreadNotificationCount(),
        ]);

        const rows =
          extractNotificationRows(
            notificationResponse
          );

        const mappedNotifications =
          rows
            .map(mapApiNotification)
            .filter(Boolean);

        const pagination =
          extractPagination(
            notificationResponse
          );

        setNotifications(
          mappedNotifications
        );

        setPage(
          pagination.currentPage
        );

        setLastPage(
          pagination.lastPage
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
    loadingMore,
    error,

    page,
    lastPage,
    hasMore: page < lastPage,

    reload,
    loadMore,

    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}