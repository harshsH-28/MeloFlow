import { nanoid } from "nanoid";

interface UserTrackingData {
  ip: string;
  userId: string;
}

// Get the user's IP address using a free IP API
export async function getUserIp(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to get IP address:", error);
    return "unknown";
  }
}

// Get or create user tracking information
export async function getOrCreateUserTracking(): Promise<UserTrackingData> {
  // Check if we already have tracking data in localStorage
  const trackingData = localStorage.getItem("user_tracking");

  if (trackingData) {
    try {
      const parsedData: UserTrackingData = JSON.parse(trackingData);
      return parsedData;
    } catch (error) {
      console.error("Error parsing user tracking data:", error);
      // If there's an error parsing, we'll create new tracking data
    }
  }

  // If no tracking data exists or there was an error parsing it, create new tracking data
  const ip = await getUserIp();
  const userId = nanoid();

  const newTrackingData: UserTrackingData = { ip, userId };

  // Store in localStorage
  localStorage.setItem("user_tracking", JSON.stringify(newTrackingData));

  // Store in cookies with no expiration
  document.cookie = `userId=${userId};path=/;max-age=31536000000`; // Very long expiration

  return newTrackingData;
}
