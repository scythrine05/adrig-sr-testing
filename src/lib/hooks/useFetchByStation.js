import { useState, useEffect } from "react";
import { data } from "../store";
const useFetchByStation = (start, end) => {
  const [stationData, setStationData] = useState(null);
  const [isStationFetching, setIsStationFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        setIsStationFetching(true);
        // Simulate fetch
        let res = [];
        data.sections.forEach((e) => {
          if (e.name === `${start}-${end}`) {
            res = [...e.section_blocks, ...e.station_blocks];
          }
        });
        setStationData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsStationFetching(false);
      }
    };

    fetchStationData();
  }, [start, end]);

  return { stationData, isStationFetching, error };
};

export default useFetchByStation;
