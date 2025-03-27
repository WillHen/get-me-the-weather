import React from 'react';

import type { WeatherData } from '../types';

export const WeatherDisplay: React.FC<{ weather: WeatherData }> = ({
  weather
}) => {
  if (!weather || !weather.name) {
    return <div>No weather data available.</div>;
  }

  const temperatureCelsius = (weather.main.temp - 273.15).toFixed(1);
  const feelsLikeCelsius = (weather.main.feels_like - 273.15).toFixed(1);

  return (
    <div className='weather-display p-4 border rounded shadow-md'>
      <h2 className='text-xl font-bold'>
        {weather.name}, {weather.sys.country}
      </h2>
      <p className='text-lg'>
        <strong>Temperature:</strong> {temperatureCelsius}°C (Feels like:{' '}
        {feelsLikeCelsius}°C)
      </p>
      <p className='text-lg'>
        <strong>Condition:</strong> {weather.weather[0].main} -{' '}
        {weather.weather[0].description}
      </p>
      <p className='text-lg'>
        <strong>Humidity:</strong> {weather.main.humidity}%
      </p>
      <p className='text-lg'>
        <strong>Wind Speed:</strong> {weather.wind.speed} m/s
      </p>
    </div>
  );
};
