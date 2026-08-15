// Location Service - Handles geolocation and reverse geocoding

export const getDeviceLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ latitude, longitude, accuracy });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      }
    );
  });
};

// Reverse geocoding using Google Maps API (or alternative service)
export const getReverseGeocode = async (latitude, longitude) => {
  try {
    // Using Open Street Map Nominatim API (free, no key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return parseAddressFromGeocode(data);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Parse address components from geocoded data
const parseAddressFromGeocode = (geoData) => {
  const address = geoData.address || {};
  return {
    houseNo: address.house_number || address.house_name || '',
    street: address.road || address.street || '',
    area: address.suburb || address.neighbourhood || '',
    city: address.city || address.town || address.village || '',
    state: address.state || address.province || '',
    pincode: address.postcode || '',
    country: address.country || ''
  };
};

// Get location info from pincode using external API
export const getLocationFromPincode = async (pincode) => {
  try {
    // Using India postcode API (works for Indian pincodes)
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
      const postOffice = data[0].PostOffice[0];
      return {
        area: postOffice.Name || '',
        city: postOffice.District || '',
        state: postOffice.State || '',
        country: postOffice.Country || 'India'
      };
    } else {
      throw new Error('Invalid pincode or location not found');
    }
  } catch (error) {
    console.error('Pincode lookup error:', error);
    throw error;
  }
};

// Watch device location in real-time
export const watchDeviceLocation = (onLocationUpdate, onError) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      onLocationUpdate({ latitude, longitude, accuracy });
    },
    (error) => {
      onError(new Error(`Geolocation error: ${error.message}`));
    }
  );

  return watchId;
};

// Clear watch location
export const clearWatchLocation = (watchId) => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};
