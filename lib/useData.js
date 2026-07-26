"use client";

import { useEffect, useState } from "react";
import { loadData, getCurrentUser, UPDATE_EVENT } from "./store";

export function useData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(loadData());
    const handler = () => setData(loadData());
    window.addEventListener(UPDATE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(UPDATE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return data;
}

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const handler = () => setUser(getCurrentUser());
    window.addEventListener(UPDATE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(UPDATE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return user;
}
