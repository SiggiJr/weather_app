"use strict";
import { apiKey } from "./api.js";

const searchBtn = document.querySelector(".show_weather_btn");
const weatherOutputContainer = document.querySelector(".weather_output");
const fiveDayContainer = document.querySelector(".five_day_container");
const cityInput = document.querySelector("#city");
// const countryInput = document.querySelector("#country");
let weatherHTML;
let lat;
let lon;

const showWeather = () => {
  const city = cityInput.value;
  // const country = countryInput.value;
  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`)
    .then((response) => response.json())
    .then((locationData) => {
      lat = locationData[0].lat;
      lon = locationData[0].lon;

      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Daten konnten nicht vom Server gezogen werden");
          }
          return response.json();
        })
        .then((weatherData) => {
          weatherHTML = `
          <div class="current_weather">
      <h1>Wetter in ${weatherData.name}, ${weatherData.sys.country}</h1>
      <div class="icon_container">
      <img class="icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png"> 
      <p>${weatherData.main.temp} °C</p>
      </div>
      <p>${weatherData.weather[0].description}</p>
      <p>Abgerufen um ${new Date(weatherData.dt * 1000).toLocaleTimeString("de", {
        minute: "2-digit",
        hour: "2-digit",
      })}, am ${new Date().toLocaleDateString("de", { day: "2-digit", month: "short", year: "numeric" })}</p>
      <table>
      <tr>
      <td>Lokale Zeit</td>
      <td>${new Date(Date.now() + weatherData.timezone * 1000).toLocaleTimeString("de", {
        minute: "2-digit",
        hour: "2-digit",
        timeZone: "UTC",
      })}, am ${new Date(Date.now() + weatherData.timezone * 1000).toLocaleDateString("de", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })}</td>
      </tr>
      <tr>
      <td>Wind</td>
      <td>${weatherData.wind.speed} m/s, ${weatherData.wind.deg}°</td>
      </tr>
      <tr>
      <td>Bewölkung</td>
      <td>${weatherData.weather[0].description}</td>
      </tr>
      <tr>
      <td>Luftdruck</td>
      <td>${weatherData.main.pressure} hpa</td>
      </tr>
      <tr>
      <td>Luftfeuchtigkeit</td>
      <td>${weatherData.main.humidity}%</td>
      </tr>
      <tr>
      <td>Sonnenaufgang</td>
      <td>${new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000).toLocaleTimeString("de", {
        minute: "2-digit",
        hour: "2-digit",
        timeZone: "UTC",
      })}</td>
      </tr>
      <tr>
      <td>Sonnenuntergang</td>
      <td>${new Date((weatherData.sys.sunset + weatherData.timezone) * 1000).toLocaleTimeString("de", {
        minute: "2-digit",
        hour: "2-digit",
        timeZone: "UTC",
      })}</td>
      </tr>
      <tr>
      <td>Geo Koordinaten</td>
      <td>[${weatherData.coord.lat.toFixed(2)}, ${weatherData.coord.lon.toFixed(2)}]</td>
      </tr>
      </table>
      </div>
      `;
          weatherOutputContainer.textContent = "";
          weatherOutputContainer.insertAdjacentHTML("afterbegin", weatherHTML);

          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`
          )
            .then((response) => response.json())
            .then((fiveDayData) => {
              let currentDay;
              let lastDay;
              fiveDayContainer.textContent = "";
              fiveDayData.list.forEach((dayData, index) => {
                if (new Date(dayData.dt_txt).getHours() % 6 !== 0) {
                  return;
                }
                console.log(dayData);
                console.log(new Date(dayData.dt_txt).getHours());
                console.log(new Date(dayData.dt_txt));
                currentDay = new Date(dayData.dt_txt).getDate();
                const currentTimeHTML = `
                <div class="daily_weather">
                <h3> Uhrzeit ${new Date(dayData.dt_txt).toLocaleTimeString("de", {
                  minute: "2-digit",
                  hour: "2-digit",
                })}</h3>
                <p>${dayData.main.temp.toFixed(1)} °C</p>
                  <div class="icon_container">
      <img class="icon" src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png"> 
      <p>${dayData.weather[0].description}</p>
      </div>
        <p>Wind ${dayData.wind.speed} m/s, ${dayData.wind.deg}°</p>
        <p>Bewölkung </p>
        <p>${dayData.weather[0].description}</p>
        <p>Luftdruck ${dayData.main.pressure} hpa</p>
        <p>Luftfeuchtigkeit ${dayData.main.humidity}%</p>
        </div>
                  `;
                if (document.querySelector(`.day_${currentDay}`) === null) {
                  fiveDayContainer.insertAdjacentHTML(
                    "beforeend",
                    `<div class="day_${currentDay} day_container">
                    <h2>${new Date(dayData.dt_txt).toLocaleDateString("de", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      weekday: "long",
                    })}</h2>
                    <div class="hour_output"></div>
                    </div>`
                  );
                }
                if (lastDay === undefined) {
                  lastDay = currentDay;
                }
                if (new Date(dayData.dt_txt).getHours() === 0) {
                  document
                    .querySelector(`.day_${lastDay} .hour_output`)
                    .insertAdjacentHTML("beforeend", currentTimeHTML);
                } else {
                  document
                    .querySelector(`.day_${currentDay} .hour_output`)
                    .insertAdjacentHTML("beforeend", currentTimeHTML);
                }
                lastDay = currentDay;
              });
            })
            .catch(() => {
              console.log(Error);
            });
        });
    });
};

searchBtn.addEventListener("click", showWeather);
