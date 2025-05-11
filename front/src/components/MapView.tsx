import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';


const MapView = ({ visitedCountries, plannedCountries }) => {
  const mapData = {
    visited: visitedCountries,
    planned: plannedCountries,
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Visited and Planned Countries</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      <script>
          const countries = ${JSON.stringify(countriesArray)};
          const data = ${JSON.stringify(mapData)};

          var map = L.map('map').setView([49.8175, 15.4730], 3);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);


          function renderCountries(data) {
            const visited = data.visited || [];
            const planned = data.planned || [];
            
            visited.forEach(code => {
              const country = countries.find(c => c.code === code);
              if (country) {
              L.circleMarker(country.coords, {
                radius: 8,
                color: '#9c27b0',
                fillColor: '#9c27b0',
                fillOpacity: 0.9,
              })
              .addTo(map)
              .bindPopup("<b>Navštíveno:</b> " + country.name);

              }
            });

            planned.forEach(code => {
              const country = countries.find(c => c.code === code);
              if (country) {
                L.circleMarker(country.coords, {
                  radius: 8,
                  color: '#2196f3',
                  fillColor: '#2196f3',
                  fillOpacity: 0.9,
                })
                .addTo(map)
                .bindPopup("<b>Plánováno:</b> " + country.name);

              }
            });
          }

            renderCountries(data);

        </script>

    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled
        style={styles.webview}
      />
    </View>
  );
};

const countriesArray = [
  { code: 'AF', name: 'Afghanistan', coords: [33.9391, 67.7100] },
  { code: 'AL', name: 'Albania', coords: [41.1533, 20.1683] },
  { code: 'DZ', name: 'Algeria', coords: [28.0339, 1.6596] },
  { code: 'AD', name: 'Andorra', coords: [42.5462, 1.6016] },
  { code: 'AO', name: 'Angola', coords: [-11.2027, 17.8739] },
  { code: 'AR', name: 'Argentina', coords: [-38.4161, -63.6167] },
  { code: 'AM', name: 'Armenia', coords: [40.0691, 45.0382] },
  { code: 'AU', name: 'Australia', coords: [-25.2744, 133.7751] },
  { code: 'AT', name: 'Austria', coords: [47.5162, 14.5501] },
  { code: 'AZ', name: 'Azerbaijan', coords: [40.1431, 47.5769] },
  { code: 'BE', name: 'Belgium', coords: [50.5039, 4.4699] },
  { code: 'BR', name: 'Brazil', coords: [-14.2350, -51.9253] },
  { code: 'BG', name: 'Bulgaria', coords: [42.7339, 25.4858] },
  { code: 'CA', name: 'Canada', coords: [56.1304, -106.3468] },
  { code: 'CL', name: 'Chile', coords: [-35.6751, -71.5430] },
  { code: 'CN', name: 'China', coords: [35.8617, 104.1954] },
  { code: 'CO', name: 'Colombia', coords: [4.5709, -74.2973] },
  { code: 'HR', name: 'Croatia', coords: [45.1000, 15.2000] },
  { code: 'CY', name: 'Cyprus', coords: [35.1264, 33.4299] },
  { code: 'CZ', name: 'Czech Republic', coords: [49.8175, 15.4730] },
  { code: 'DK', name: 'Denmark', coords: [56.2639, 9.5018] },
  { code: 'EG', name: 'Egypt', coords: [26.8206, 30.8025] },
  { code: 'FI', name: 'Finland', coords: [61.9241, 25.7482] },
  { code: 'FR', name: 'France', coords: [46.2276, 2.2137] },
  { code: 'DE', name: 'Germany', coords: [51.1657, 10.4515] },
  { code: 'GR', name: 'Greece', coords: [39.0742, 21.8243] },
  { code: 'HU', name: 'Hungary', coords: [47.1625, 19.5033] },
  { code: 'IS', name: 'Iceland', coords: [64.9631, -19.0208] },
  { code: 'IN', name: 'India', coords: [20.5937, 78.9629] },
  { code: 'ID', name: 'Indonesia', coords: [-0.7893, 113.9213] },
  { code: 'IE', name: 'Ireland', coords: [53.4129, -8.2439] },
  { code: 'IL', name: 'Israel', coords: [31.0461, 34.8516] },
  { code: 'IT', name: 'Italy', coords: [41.8719, 12.5674] },
  { code: 'JP', name: 'Japan', coords: [36.2048, 138.2529] },
  { code: 'KZ', name: 'Kazakhstan', coords: [48.0196, 66.9237] },
  { code: 'KR', name: 'South Korea', coords: [35.9078, 127.7669] },
  { code: 'MX', name: 'Mexico', coords: [23.6345, -102.5528] },
  { code: 'NL', name: 'Netherlands', coords: [52.1326, 5.2913] },
  { code: 'NO', name: 'Norway', coords: [60.4720, 8.4689] },
  { code: 'PL', name: 'Poland', coords: [51.9194, 19.1451] },
  { code: 'PT', name: 'Portugal', coords: [39.3999, -8.2245] },
  { code: 'RO', name: 'Romania', coords: [45.9432, 24.9668] },
  { code: 'RU', name: 'Russia', coords: [61.5240, 105.3188] },
  { code: 'RS', name: 'Serbia', coords: [44.0165, 21.0059] },
  { code: 'SK', name: 'Slovakia', coords: [48.6690, 19.6990] },
  { code: 'SI', name: 'Slovenia', coords: [46.1512, 14.9955] },
  { code: 'ES', name: 'Spain', coords: [40.4637, -3.7492] },
  { code: 'SE', name: 'Sweden', coords: [60.1282, 18.6435] },
  { code: 'CH', name: 'Switzerland', coords: [46.8182, 8.2275] },
  { code: 'TR', name: 'Turkey', coords: [38.9637, 35.2433] },
  { code: 'UA', name: 'Ukraine', coords: [48.3794, 31.1656] },
  { code: 'GB', name: 'United Kingdom', coords: [55.3781, -3.4360] },
  { code: 'US', name: 'United States', coords: [37.0902, -95.7129] },
  { code: 'AE', name: 'United Arab Emirates', coords: [24.0000, 54.0000] },
  { code: 'BA', name: 'Bosnia and Herzegovina', coords: [43.9159, 17.6791] },
  { code: 'BD', name: 'Bangladesh', coords: [23.6850, 90.3563] },
  { code: 'BH', name: 'Bahrain', coords: [26.0667, 50.5577] },
  { code: 'BO', name: 'Bolivia', coords: [-16.2902, -63.5887] },
  { code: 'BS', name: 'Bahamas', coords: [25.0343, -77.3963] },
  { code: 'BY', name: 'Belarus', coords: [53.7098, 27.9534] },
  { code: 'DO', name: 'Dominican Republic', coords: [18.7357, -70.1627] },
  { code: 'EE', name: 'Estonia', coords: [58.5953, 25.0136] },
  { code: 'FJ', name: 'Fiji', coords: [-17.7134, 178.0650] },
  { code: 'IQ', name: 'Iraq', coords: [33.2232, 43.6793] },
  { code: 'IR', name: 'Iran', coords: [32.4279, 53.6880] },
  { code: 'KE', name: 'Kenya', coords: [0.0236, 37.9062] },
  { code: 'MA', name: 'Morocco', coords: [31.7917, -7.0926] },
  { code: 'MD', name: 'Moldova', coords: [47.4116, 28.3699] },
  { code: 'MN', name: 'Mongolia', coords: [46.8625, 103.8467] },
  { code: 'MT', name: 'Malta', coords: [35.9375, 14.3754] },
  { code: 'MY', name: 'Malaysia', coords: [4.2105, 101.9758] },
  { code: 'NZ', name: 'New Zealand', coords: [-40.9006, 174.8860] },
  { code: 'PA', name: 'Panama', coords: [8.5380, -80.7821] },
  { code: 'PE', name: 'Peru', coords: [-9.1900, -75.0152] },
  { code: 'PH', name: 'Philippines', coords: [13.4103, 122.5607] },
  { code: 'PK', name: 'Pakistan', coords: [30.3753, 69.3451] },
  { code: 'SA', name: 'Saudi Arabia', coords: [23.8859, 45.0792] },
  { code: 'SG', name: 'Singapore', coords: [1.3521, 103.8198] },
  { code: 'TD', name: 'Chad', coords: [15.4542, 18.7322] },
  { code: 'TH', name: 'Thailand', coords: [15.8700, 100.9925] },
  { code: 'UY', name: 'Uruguay', coords: [-32.5228, -55.7658] },
  { code: 'UZ', name: 'Uzbekistan', coords: [41.3775, 64.5853] },
  { code: 'VN', name: 'Vietnam', coords: [14.0583, 108.2772] },
  { code: 'YE', name: 'Yemen', coords: [15.5527, 48.5164] },
  { code: 'ZA', name: 'South Africa', coords: [-30.5595, 22.9375] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default MapView;
