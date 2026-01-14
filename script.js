// import dotenv from "dotenv";
import { countryNames } from "./country-names.js";

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById("city-input")
    const getWeatherBtn = document.getElementById("get-weather-btn")
    const weatherInfo = document.getElementById("weather-info")
    const cityNameDisplay = document.getElementById("city-text")
    const weatherIcon = document.getElementById("weatherIcon")
    const temperatureDisplay = document.getElementById("temperature")
    const weatherDisplay = document.getElementById("weather")
    const displayHumidity = document.getElementById("humidity")
    const minTempDisplay = document.getElementById("min-temp")
    const maxTempDisplay = document.getElementById("max-temp")
    const errorMessage = document.getElementById("error-message")
    const recentCitiesList = document.getElementById("recent-cities")

    //unit toggle elements
    const unitToggle = document.getElementById("unit-toggle")
    const unitLabel = document.querySelector(".unit-label")
    let currentUnit = "C" //default unit
    let lastWeatherData = null //to store last fetched data for toggling


    unitLabel.innerHTML = "&deg;C"
    //load saved recent cities when page loads
    loadRecentCities()

    getWeatherBtn.addEventListener('click', async () => {
        const city = cityInput.value.trim()
        if (!city) return;
        //have to handle this error

        try {
            const weatherData = await fetchWeatherData(city)
            lastWeatherData = weatherData //store for toggle use
            displayWeatherData(weatherData)
            addRecentCity(city) //save searched city
        } catch (error) {
            showError()
        }
    })

    async function fetchWeatherData(city) {
        //get the data of that city through serverless API
        const url = `/api/weather?city=${city}`
        const response = await fetch(url)
        console.log("RESPONSE", response); //remove it if not required later

        if (!response.ok) {
            throw new Error("City Not found")
        }

        const data = await response.json()
        return data
    }

    //get weather using coordinates (for location fetch)
    async function fetchWeatherByCoords(lat, lon) {
        //get weather data through serverless API
        const url = `/api/weather?lat=${lat}&lon=${lon}`
        throw new Error("Unable to fetch weather from location")
    }
    const data = await response.json()
    return data
}

    function displayWeatherData(data) {
        console.log(data); //remove later if not required
        const { name, main, weather, sys } = data
        cityNameDisplay.textContent = `${name}, ${countryNames[sys.country] || sys.country}`
        if (cityNameDisplay.textContent.length > 25) {
            cityNameDisplay.style.fontSize = "14px"
        } else if (cityNameDisplay.textContent.length > 16) {
            cityNameDisplay.style.fontSize = "18px"
        }
        const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`
        weatherIcon.src = iconUrl
        weatherIcon.alt = weather[0].description

        //convert to current unit before showing
        const temps = convertTemperature(main)

        temperatureDisplay.innerHTML = `${parseInt(temps.temp)}&deg;${currentUnit}<br /><span id="feels-like">Feels Like ${parseInt(temps.feels_like)}&deg;${currentUnit}</span>`
        weatherDisplay.textContent = weather[0].description
        displayHumidity.innerHTML = `Humidity<br/><span>${main.humidity}</span>`
        minTempDisplay.innerHTML = `Minimum<br/><span>${parseInt(temps.temp_min)}&deg;${currentUnit}</span>`
        maxTempDisplay.innerHTML = `Maximum<br/><span>${parseInt(temps.temp_max)}&deg;${currentUnit}</span>`

        //unlock display
        weatherInfo.classList.remove('hidden')
        errorMessage.classList.add('hidden')
    }

    function showError() {
        weatherInfo.classList.add('hidden')
        errorMessage.classList.remove('hidden')
    }

    //convert all temperature values depending on unit
    function convertTemperature(main) {
        //if current unit is Celsius, return as it is
        if (currentUnit === "C") {
            return main
        }
        //else convert to Fahrenheit
        return {
            temp: (main.temp * 9 / 5) + 32,
            feels_like: (main.feels_like * 9 / 5) + 32,
            temp_min: (main.temp_min * 9 / 5) + 32,
            temp_max: (main.temp_max * 9 / 5) + 32,
            humidity: main.humidity
        }
    }

    //handle toggle switch
    unitToggle.addEventListener('change', () => {
        if (unitToggle.checked) {
            currentUnit = "F"
            unitLabel.innerHTML = "&deg;F"
        } else {
            currentUnit = "C"
            unitLabel.innerHTML = "&deg;C"
        }

        //if data already exists, re-display it in new unit
        if (lastWeatherData) {
            displayWeatherData(lastWeatherData)
        }
    })

    // recent cities feature
    function addRecentCity(cityName) {
        let cities = JSON.parse(localStorage.getItem("recentCities")) || []

        //remove if already exists to avoid duplicates
        cities = cities.filter(c => c.toLowerCase() !== cityName.toLowerCase())
        cities.unshift(cityName)
        if (cities.length > 5) {
            cities = cities.slice(0, 5)
        }
        localStorage.setItem("recentCities", JSON.stringify(cities))
        renderRecentCities()
    }

    function renderRecentCities() {
        const cities = JSON.parse(localStorage.getItem("recentCities")) || []
        recentCitiesList.innerHTML = ""

        if (cities.length === 0) {
            recentCitiesList.innerHTML = "<li style='opacity:0.6;'>No recent cities</li>"
            return
        }

        cities.forEach(city => {
            const li = document.createElement("li")
            li.textContent = city
            li.style.cursor = "pointer"
            li.addEventListener("click", async () => {
                try {
                    const weatherData = await fetchWeatherData(city)
                    lastWeatherData = weatherData
                    displayWeatherData(weatherData)
                } catch (error) {
                    showError()
                }
            })
            recentCitiesList.appendChild(li)
        })
    }

    function loadRecentCities() {
        renderRecentCities()
    }

    //--- get location weather automatically on load ---
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        try {
            const locationWeather = await fetchWeatherByCoords(latitude, longitude)
            lastWeatherData = locationWeather //store for toggle use
            displayWeatherData(locationWeather)
        } catch (error) {
            console.log("Error fetching weather from location", error)
        }
    }, (error) => {
        console.log("Location access denied or unavailable", error)
    })
} else {
    console.log("Geolocation not supported in this browser")
}

})
