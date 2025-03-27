export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number; // Optional, as it may not always be present
    grnd_level?: number; // Optional, as it may not always be present
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number; // Optional, as it may not always be present
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number; // Optional, as it may not always be present
    id?: number; // Optional, as it may not always be present
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface City {
  name: string;
  local_names?: {
    [key: string]: string; // Allows for dynamic keys like "zh", "sr", "en", etc.
  };
  lat: number;
  lon: number;
  country: string;
  state?: string; // Optional, as some cities might not have a state
}
