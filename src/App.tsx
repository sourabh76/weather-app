import { useState, useEffect, KeyboardEvent } from "react";
import SearchIcon from "./assets/search.svg";
import WindIcon from "./assets/wind.svg";
import HumidityIcon from "./assets/humidity.svg";
import LocationIcon from "./assets/location.svg";
import { findFlagUrlByIso2Code } from "country-flags-svg";
import "./App.css";

type WeatherDataType = {
  temperature: string,
  humidity: string,
  windSpeed: string,
  location?: string,
  weatherImage: string,
  country?: string,
} | null

type PositionDataType = {
    latitude: number,
    longitude: number,
}
 
const App = () => {
    const [weatherData, setWeatherData] = useState<WeatherDataType>(null);
    const [city, setCity] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [position, setPosition] = useState<PositionDataType>({ latitude: 0, longitude: 0 });
 
    const api_key = "439d4b804bc8187953eb36d2a8c26a02";

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
              setPosition({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            });
          } else {
            console.log("Geolocation is not available in your browser.");
          }
      }, []);
    
    useEffect(() => {
        const fetchRandomCityWeather = async () => {
            try {
                const cities = [
                    "London",
                    "New York",
                    "Paris",
                    "Tokyo",
                    "Sydney",
                ];
                const randomCity =
                    cities[Math.floor(Math.random() * cities.length)];
                const url = `https://openweathermap.org/data/2.5/find?q=${randomCity}&appid=${api_key}&units=metric`;
                const response = await fetch(url);
                const data = await response.json();
 
                if (data.cod === "200") {
                    setWeatherData({
                        temperature: `${Math.round(data.list[0].main.temp - 273.15)}°C`,
                        humidity: `${data.list[0].main.humidity}%`,
                        windSpeed: `${data.list[0].wind.speed}m/s`,
                        location: data.list[0].name,
                        weatherImage: data.list[0].weather[0].description,
                        country: findFlagUrlByIso2Code(`${data.list[0].sys.country}`)
                    });
                    setErrorMessage("");
                } else {
                    setErrorMessage(data.message);
                }
            } catch (error) {
                console.error("Error fetching weather data: ", error);
                setWeatherData(null);
                setErrorMessage(
                    "Failed to fetch weather data. Please try again later."
                );
            }
        };
 
        fetchRandomCityWeather();
    }, []);
 
    const search = async () => {
        try {
            if (city.trim() === "") {
                setErrorMessage("Please enter a city name");
                return;
            }

            const url = `https://openweathermap.org/data/2.5/find?q=${city}&appid=${api_key}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod === "200") {
                setWeatherData({
                    temperature: `${Math.round(data.list[0].main.temp - 273.15)}°C`,
                    humidity: `${data.list[0].main.humidity}%`,
                    windSpeed: `${data.list[0].wind.speed}m/s`,
                    location: data.list[0].name,
                    weatherImage: data.list[0].weather[0].description,
                    country: findFlagUrlByIso2Code(`${data.list[0].sys.country}`)
                });
                setErrorMessage("");
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Error fetching weather data: ", error);
            setWeatherData(null);
            setErrorMessage(
                "Failed to fetch weather data. Please try again later."
            );
        }
    };

    const myLocation = async () => {
        try {
            const url = `https://openweathermap.org/data/2.5/onecall?lat=${position.latitude}&lon=${position.latitude}&units=metric&appid=${api_key}`;
            const response = await fetch(url);
            const data = await response.json();

            setWeatherData({
                temperature: `${Math.round(data.current.temp)}°C`,
                humidity: `${data.current.humidity}%`,
                windSpeed: `${data.current.wind_speed}m/s`,
                weatherImage: data.current.weather[0].description,
            });

        } catch (error) {
            console.error("Error fetching weather data: ", error);
            setWeatherData(null);
            setErrorMessage(
                "Failed to fetch weather data. Please try again later."
            );
        }
    };

    const getWeatherImage = (description: string) => {
        let imageIcon;
        switch (description) {
            case "clear sky":
                imageIcon = "http://openweathermap.org/img/wn/01d@2x.png"
                break;
            
            case "few clouds":
                imageIcon = "http://openweathermap.org/img/wn/02d@2x.png"
                break;

            case "scattered clouds":
                imageIcon = "http://openweathermap.org/img/wn/03d@2x.png"
                break;     
            
            case "broken clouds":
            case "overcast clouds":
                imageIcon = "http://openweathermap.org/img/wn/04d@2x.png"
                break;
                
            case "shower rain":
                imageIcon = "http://openweathermap.org/img/wn/09d@2x.png"
                break;
    
            case "rain":
                imageIcon = "http://openweathermap.org/img/wn/10d@2x.png"
                break;
        
            case "thunderstorm":
                imageIcon = "http://openweathermap.org/img/wn/11d@2x.png"
                break;
                    
            case "snow":
                imageIcon = "http://openweathermap.org/img/wn/13d@2x.png"
                break;
        
            case "mist":
            case "haze":
                imageIcon = "http://openweathermap.org/img/wn/50d@2x.png"
                break;
            default:
                imageIcon = ""
                break;
        }
        return imageIcon;
    }
 
    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            search();
        }
    };

      return (
        <div className="container">
            <div className="top-bar">
                <input
                    type="text"
                    className="cityInput"
                    placeholder="Search"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="button" onClick={search}>
                    <img src={SearchIcon} alt="search" />
                </button>
                <button className="button" onClick={myLocation}>
                    <img src={LocationIcon} alt="myLocation" />
                </button>
            </div>
 
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}
 
            {weatherData && (
                <>
                    <div className="weather-image">
                        <img src={getWeatherImage(weatherData.weatherImage)} alt="weatherImage" />
                    </div>
                    <div className="weather-temp">
                        {weatherData.temperature}
                    </div>
                    <div className="weather-location">
                        {weatherData.location}
                        <img src={weatherData.country} alt="country" />
                    </div>
                    <div className="data-container">
                        <div className="element">
                            <img src={HumidityIcon} alt="humidity" />
                            <div className="data">
                                <div className="humidity-percent">
                                    {weatherData.humidity}
                                </div>
                                <div className="text">Humidity</div>
                            </div>
                        </div>
                        <div className="element">
                            <img src={WindIcon} alt="wind" />
                            <div className="data">
                                <div className="wind-rate">
                                    {weatherData.windSpeed}
                                </div>
                                <div className="text">Wind Speed</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
 
export default App;