#imports
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json, requests
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv('.env')

API_KEY = os.getenv("API_KEY")

# app initialization
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Models
class ForecastItem(BaseModel):
    time: str
    temp_c: float
    feels_like_c: float
    description: str

class ForecastResponse(BaseModel):
    current: ForecastItem
    hourly: list[ForecastItem]

#Main functions
def get_temp_from_lat_lon(latitude, longitude):
    URL = f"""https://api.openweathermap.org/data/3.0/onecall?lat={latitude}&lon={longitude}&exclude=daily&appid={API_KEY}"""
    api_response = dict(requests.get(URL).json())

    # Process current weather
    current_data = api_response.get('current', {})
    current_weather = {}
    if current_data:
        temp_k = current_data.get('temp')
        feels_like_k = current_data.get('feels_like')
        current_weather = {
            "time": datetime.fromtimestamp(current_data.get('dt')).strftime('%Y-%m-%d %H:%M:%S'),
            "temp_c": f"{temp_k - 273.15:.1f}" if temp_k is not None else "N/A",
            "feels_like_c": f"{feels_like_k - 273.15:.1f}" if feels_like_k is not None else "N/A",
            "description": current_data.get('weather', [{}])[0].get('description')
        }

    # Process hourly weather
    hourly_data = api_response.get('hourly', [])
    hourly_forecasts = []
    for hour in hourly_data:
        temp_k = hour.get('temp')
        feels_like_k = hour.get('feels_like')
        forecast = {
            "time": datetime.fromtimestamp(hour.get('dt')).strftime('%Y-%m-%d %H:%M:%S'),
            "temp_c": f"{temp_k - 273.15:.1f}" if temp_k is not None else "N/A",
            "feels_like_c": f"{feels_like_k - 273.15:.1f}" if feels_like_k is not None else "N/A",
            "description": hour.get('weather', [{}])[0].get('description')
        }
        hourly_forecasts.append(forecast)

    return current_weather, hourly_forecasts

def get_temp_from_city_name(city_name):
    URL = f"""https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}"""
    response = dict(requests.get(URL).json())

    if response.get('cod') != 200:
        print(f"Error fetching coordinates for {city_name}: {response.get('message')}")
        return None, None

    latitude = response['coord']['lat']
    longitude = response['coord']['lon']
    
    return get_temp_from_lat_lon(latitude, longitude)

#API Endpoint
@app.get("/forecast/{city}", response_model=ForecastResponse)
async def get_forecast(city: str):
    try:
        current, hourly = get_temp_from_city_name(city)
        if current and hourly:
            return {"current": current, "hourly": hourly}
        raise HTTPException(status_code=404, detail="City not found or API error.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
