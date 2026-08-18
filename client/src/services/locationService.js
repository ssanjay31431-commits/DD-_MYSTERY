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
  const displayName = geoData.display_name || '';
  const parts = displayName.split(',').map(s => s.trim()).filter(Boolean);

  // 1. House / Flat / Door Number
  let houseNo = address.house_number || address.house_name || address.building || address.flat || address.door_number || '';
  if (!houseNo && parts.length > 0 && /^\d+[\w/-]*$/.test(parts[0])) {
    houseNo = parts[0];
  }

  // 2. Street / Road
  let street = address.road || address.street || address.pedestrian || address.path || address.footway || '';
  if (!street && parts.length > 1) {
    street = parts[1];
  }

  // 3. Area / Locality
  let area = address.suburb || address.neighbourhood || address.residential || address.subdistrict || address.quarter || address.hamlet || address.village || '';
  if (!area && parts.length > 2) {
    area = parts[2];
  }

  // 4. City / Town
  let city = address.city || address.town || address.village || address.municipality || address.city_district || address.county || address.district || '';
  if (!city && parts.length > 3) {
    city = parts[parts.length > 4 ? parts.length - 4 : 3];
  }

  // 5. State
  let state = address.state || address.province || address.state_district || '';
  if (!state && parts.length >= 2) {
    state = parts[parts.length - 2];
  }

  // 6. Pincode
  let pincode = address.postcode || '';
  if (!pincode) {
    const match = displayName.match(/\b\d{6}\b/);
    if (match) pincode = match[0];
  }

  // 7. Landmark
  let landmark = address.amenity || address.shop || address.landmark || address.commercial || address.office || address.historic || address.attraction || address.building || '';
  if (!landmark) {
    if (address.suburb) landmark = `Near ${address.suburb}`;
    else if (address.road) landmark = `Near ${address.road}`;
    else if (parts.length > 0) landmark = `Near ${parts[0]}`;
  }

  return {
    houseNo,
    street,
    area,
    city,
    state,
    pincode,
    landmark,
    country: address.country || 'India'
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
