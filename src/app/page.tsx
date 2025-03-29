'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { debounce } from '@mui/material/utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import NearMeIcon from '@mui/icons-material/NearMe';

import Typography from '@mui/material/Typography';

import { WeatherDisplay } from './WeatherDisplay';

import type { WeatherData, City } from '../types';
import { InputAdornment } from '@mui/material';

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [inputDisabled, setInputDisabled] = useState(false);

  const getPosition = useCallback(() => {
    if (navigator.geolocation) {
      setInputDisabled(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          const data = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
          );

          const json = await data.json();

          setCities(json);
          setValue(json[0]);
          setInputValue(`${json[0].name}, ${json[0].state}`);
          setInputDisabled(false);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

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
    <div className='grid place-items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <Typography
        variant='h3'
        component='h2'
        sx={{
          fontSize: {
            xs: '2rem', // 2rem for mobile (xs breakpoint)
            sm: '3rem' // Larger font size for small screens and above
          }
        }}
      >
        Get me the weather!
      </Typography>
      <Autocomplete
        disabled={inputDisabled}
        disablePortal
        options={cities}
        sx={{ width: 300 }}
        loadingText='Loading cities...'
        getOptionLabel={(option) => `${option.name}, ${option.state || ''}`}
        value={value}
        noOptionsText='No cities found'
        renderInput={(params) => (
          <TextField
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment
                    position='start'
                    className='cursor-pointer'
                    onClick={() => {
                      getPosition();
                    }}
                  >
                    <NearMeIcon />
                  </InputAdornment>
                )
              }
            }}
            label='City'
            {...params}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.38)', // Grayed-out text color
                backgroundColor: '#f5f5f5' // Light gray background
              },
              '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: 'rgba(0, 0, 0, 0.38)' // Grayed-out border color
                }
            }}
          />
        )}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        inputValue={inputValue}
        renderOption={(props, option) => {
          return (
            <li {...props} key={JSON.stringify(option)}>
              {option.name}, {option.state}, {option.country}
            </li>
          );
        }}
        onChange={(_event, newValue) => {
          setValue(newValue);
          if (newValue) {
            setInputValue(`${newValue.name}, ${newValue.state}`); // Set the input value to the selected city's name and state
          } else {
            setInputValue(''); // Clear the input value if no city is selected
          }
        }}
      />
      {!weather && (
        <div style={{ minHeight: '12.75rem' }}>
          <Typography>Search for a city to get started...</Typography>
        </div>
      )}
      {weather && <WeatherDisplay weather={weather} />}
    </div>
  );
}
