import axios from "axios";

// Forecast
export interface ForecastItem {
    time: string;
    temp_c: number;
    feels_like_c: number;
    description: string;
}

export interface ForecastResponse {
    current: ForecastItem;
    hourly: ForecastItem[];
}

// Create axios instance
const apiService = axios.create({ baseURL: "http://localhost:8000" });

export const getForecast = async (city: string): Promise<ForecastResponse> => {
    try {
        const response = await apiService.get(`/forecast/${city}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
