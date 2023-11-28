import { useState, useEffect } from "react";
import {
  onSnapshot,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
} from "firebase/firestore";

export const useGetRealtimeDataSingle = (query: DocumentReference) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DocumentSnapshot<DocumentData>>();

  useEffect(() => {
    const unsubscribe = onSnapshot(query, (collection) => {
      setData(collection);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { data, loading };
};
