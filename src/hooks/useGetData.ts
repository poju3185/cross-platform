import {
  CollectionReference,
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useGetData = (query: CollectionReference | Query) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QueryDocumentSnapshot<DocumentData>[]>();

  const getData = async () => {
    const data = await getDocs(query);

    setData(data.docs);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return { loading, data };
};
