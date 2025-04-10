'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { debounce } from '@mui/material/utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import NearMeIcon from '@mui/icons-material/NearMe';

import Typography from '@mui/material/Typography';

import { WeatherDisplay } from './WeatherDisplay';

import type { WeatherData, City } from '../types';
import { InputAdornment } from '@mui/material';

const weatherBackgroundMap: Record<string, string> = {
  '01d': '#87CEEB', // Clear sky (day) - Light blue
  '01n': '#2C3E50', // Clear sky (night) - Dark blue
  '02d': '#B0C4DE', // Few clouds (day) - Light gray-blue
  '02n': '#34495E', // Few clouds (night) - Dark gray-blue
  '03d': '#D3D3D3', // Scattered clouds (day) - Light gray
  '03n': '#696969', // Scattered clouds (night) - Dark gray
  '04d': '#A9A9A9', // Broken clouds (day) - Medium gray
  '04n': '#808080', // Broken clouds (night) - Medium-dark gray
  '09d': '#5F9EA0', // Shower rain (day) - Cadet blue
  '09n': '#4682B4', // Shower rain (night) - Steel blue
  '10d': '#6495ED', // Rain (day) - Cornflower blue
  '10n': '#1E90FF', // Rain (night) - Dodger blue
  '11d': '#FFD700', // Thunderstorm (day) - Gold
  '11n': '#FF8C00', // Thunderstorm (night) - Dark orange
  '13d': '#FFFFFF', // Snow (day) - White
  '13n': '#F0F8FF', // Snow (night) - Alice blue
  '50d': '#C0C0C0', // Mist (day) - Silver
  '50n': '#696969' // Mist (night) - Dim gray
};

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [bgColor, setBgColor] = useState('var(--background)'); // Default background color
  const [isLoading, setIsLoading] = useState(false);

  const getPosition = useCallback(() => {
    if (navigator.geolocation) {
      setInputDisabled(true);
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
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
          label: `${city.name}${city.state ? `, ${city.state}` : ''}`,
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
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        );
        const json: WeatherData = await response.json();
        setWeather(json);
        const weatherIcon = json.weather[0]?.icon;

        // Get the background color from the map
        const newBgColor =
          weatherBackgroundMap[weatherIcon] || 'var(--background)';

        // Update the background color
        setBgColor(newBgColor);
      } finally {
        setIsLoading(false);
      }
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
    <div
      id='colorbox'
      className='grid place-items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'
      style={{ backgroundColor: bgColor }}
    >
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
        getOptionLabel={(option) =>
          `${option.name}${option.state ? `, ${option.state}` : ''}`
        }
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
            <li {...props} key={`${option.lat}-${option.lon}`}>
              {option.name}
              {option.state ? `, ${option.state}` : ''}, {option.country}
            </li>
          );
        }}
        onChange={(_event, newValue) => {
          setValue(newValue);
          if (newValue) {
            setInputValue(
              `${newValue.name}${newValue.state ? `, ${newValue.state}` : ''}`
            ); // Set the input value to the selected city's name and state
          } else {
            setInputValue(''); // Clear the input value if no city is selected
          }
        }}
      />
      {!weather && !isLoading && (
        <div style={{ minHeight: '12.75rem' }}>
          <Typography>Search for a city to get started...</Typography>
        </div>
      )}
      {isLoading && (
        <div
          style={{ minHeight: '12.75rem' }}
          className='grid place-items-center'
        >
          <CircularProgress />
        </div>
      )}
      {weather && !isLoading && <WeatherDisplay weather={weather} />}
    </div>
  );
}
