import {
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  getDocs,
  query,
  startAfter,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export const useInfiniteScroll = (initialQuery: Query) => {
  const { ref, inView } = useInView();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [lastData, setLastData] =
    useState<QueryDocumentSnapshot<DocumentData, DocumentData>>();

  const [isEndOfData, setIsEndOfData] = useState(false);

  const fetchData = async () => {
    setLoading(true)
    try {
      const postQuery = lastData
        ? query(initialQuery, startAfter(lastData))
        : initialQuery;
      const res = await getDocs(postQuery);
      setData((prevPosts) => [...prevPosts, ...res.docs]);
      if (res.empty) {
        setIsEndOfData(true);
      } else {
        setLastData(res.docs[res.docs.length - 1]);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
        setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [inView]);
  return { data, ref, isEndOfData, loading };
};
