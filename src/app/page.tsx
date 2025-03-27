'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { debounce } from '@mui/material/utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import Typography from '@mui/material/Typography';

import { WeatherDisplay } from './WeatherDisplay';

import type { WeatherData, City } from '../types';

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchCities = useCallback(
    async (
      request: { input: string },
      callback: (results?: City[]) => void
    ) => {
      if (request.input.length > 3) {
        const data = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${request.input}&limit=5&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        );

        const json: City[] = await data.json();

        const formattedData = json.map((city) => ({
          label: `${city.name}, ${city.state}`,
          ...city
        }));

        callback(formattedData);
      }
    },
    []
  );

  const fetchOptions = useMemo(
    () => debounce(fetchCities, 1000),
    [fetchCities]
  );

  useEffect(() => {
    async function fetchWeather(lat: number, lon: number) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      const json: WeatherData = await response.json();
      setWeather(json);
    }
    if (value?.lat && value?.lon) {
      fetchWeather(value.lat, value.lon);
    }
  }, [value]);

  useEffect(() => {
    fetchOptions({ input: inputValue }, (results) => {
      if (results) {
        setCities(results);
      }
    });
  }, [inputValue, fetchOptions]);

  return (
    <div className='grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <Typography variant='h3' component='h2'>
        Get me the weather!
      </Typography>
      <Autocomplete
        disablePortal
        options={cities}
        sx={{ width: 300 }}
        loadingText='Loading cities...'
        noOptionsText='No cities found'
        renderInput={(params) => <TextField {...params} label='City' />}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} key={JSON.stringify(option)}>
              {option.name}, {option.state}, {option.country}
            </li>
          );
        }}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
      />
      {weather && <WeatherDisplay weather={weather} />}
    </div>
  );
}
