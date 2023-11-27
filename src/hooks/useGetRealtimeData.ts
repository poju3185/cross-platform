import { useState, useEffect } from "react";
import {
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  CollectionReference,
  Query,
} from "firebase/firestore";

export const useGetRealtimeData = (
  query: CollectionReference | Query
) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query, (collection) => {
      setData(collection.docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { data, loading };
};
