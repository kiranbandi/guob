import React, { useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import HeatMap from '../components/tracks/HeatMap';
import Histogram from '../components/tracks/Histogram';
export default function Dashboard() {

  const isComponentMounted = useRef(true);

  const { data, loading, error } = useFetch("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json", isComponentMounted, false);

  if (error) {
    console.log(error);
  }

  return (
    <>
      <h2>Dashboard</h2>
      {loading ?
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 40 }}>
          <CircularProgress size={75} />
        </Box> :
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {data && <HeatMap data={data} />}
          {data && <Histogram data={data} />}
        </Box>}
    </>
  );
}
