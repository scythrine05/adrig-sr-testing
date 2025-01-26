import { useState, useEffect } from "react";
import { currentOptimizedValue } from "../../app/actions/user";
import { getUser } from "../../lib/auth";

const useOptimizedCheck = () => {
  const [optimizedCheck, setOptimizedCheck] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptimizedCheck = async () => {
      try {
        setIsFetching(true);
        const user = getUser();
        const response = await currentOptimizedValue(user);
        setOptimizedCheck(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOptimizedCheck();
  }, []);

  return { optimizedCheck, isFetching, error };
};

export default useOptimizedCheck;
