import { useState, useEffect } from "react";
import { getFormDataAll } from "../../app/actions/formdata";
const useFetchRequests = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFormDataAll();
        if (!response) {
          throw new Error("Network response was not ok");
        }

        setData(response.requestData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useFetchRequests;
