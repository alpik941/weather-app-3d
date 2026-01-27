/**
 * Mock Weather Alerts Data for Testing
 * Contains test data for Ottawa, Canada with Yellow and Orange level warnings
 * 
 * Usage:
 * import { ottawaTestAlerts, mockAlertsSeverity } from './mockAlerts';
 * 
 * Then pass to WeatherAlerts component:
 * <WeatherAlerts alerts={ottawaTestAlerts} onDismiss={dismissAlert} />
 */

/**
 * YELLOW Level Alerts (Advisory/Watch)
 * Less severe conditions that require attention
 */
export const yellowAlerts = [
  {
    sender_name: 'Environment Canada',
    event: 'Snowfall Warning',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 8 * 3600 * 1000) / 1000), // 8 hours from now
    description: 'Snowfall accumulation with rates of 2 to 4 cm per hour. Total accumulation of 15 to 20 cm expected.',
    tags: ['Ottawa', 'Eastern Ontario'],
    severity: 'yellow'
  },
  {
    sender_name: 'Environment Canada',
    event: 'Wind Advisory',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 6 * 3600 * 1000) / 1000), // 6 hours from now
    description: 'Strong northwest winds expected tonight. Gusts up to 50 km/h.',
    tags: ['Ottawa', 'National Capital Region'],
    severity: 'yellow'
  },
  {
    sender_name: 'Environment Canada',
    event: 'Fog Advisory',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 4 * 3600 * 1000) / 1000), // 4 hours from now
    description: 'Dense fog with visibility near 200 metres. Travel may be hazardous.',
    tags: ['Ottawa'],
    severity: 'yellow'
  }
];

/**
 * ORANGE Level Alerts (Warning)
 * Moderate to high severity warnings
 */
export const orangeAlerts = [
  {
    sender_name: 'Environment Canada',
    event: 'Heavy Snow Warning',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 12 * 3600 * 1000) / 1000), // 12 hours from now
    description: 'Heavy snow expected with total accumulation of 25 to 35 cm. Strong winds will cause significant drifting.',
    tags: ['Ottawa', 'Eastern Ontario'],
    severity: 'orange'
  },
  {
    sender_name: 'Environment Canada',
    event: 'Freezing Rain Warning',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 10 * 3600 * 1000) / 1000), // 10 hours from now
    description: 'Freezing rain expected overnight. Ice accumulation of 10 to 15 mm. Roads will become slippery.',
    tags: ['Ottawa'],
    severity: 'orange'
  },
  {
    sender_name: 'Environment Canada',
    event: 'Winter Storm Warning',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 24 * 3600 * 1000) / 1000), // 24 hours from now
    description: 'A winter storm system is expected. Heavy snow and strong winds. Blowing snow will reduce visibility.',
    tags: ['Ottawa', 'Eastern Ontario'],
    severity: 'orange'
  }
];

/**
 * RED Level Alerts (Critical)
 * Most severe warnings requiring immediate action
 */
export const redAlerts = [
  {
    sender_name: 'Environment Canada',
    event: 'Severe Thunderstorm Warning',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 2 * 3600 * 1000) / 1000), // 2 hours from now
    description: 'A severe thunderstorm capable of producing damaging winds and large hail is approaching.',
    tags: ['Ottawa'],
    severity: 'red'
  },
  {
    sender_name: 'Environment Canada',
    event: 'Tornado Warning',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor((Date.now() + 1 * 3600 * 1000) / 1000), // 1 hour from now
    description: 'A confirmed tornado is occurring. Take shelter in a basement or interior room away from windows.',
    tags: ['Ottawa'],
    severity: 'red'
  }
];

/**
 * Composite test data for Ottawa, Canada
 * Mix of all severity levels
 */
export const ottawaTestAlerts = [
  ...yellowAlerts.slice(0, 2),  // Include first 2 yellow alerts
  ...orangeAlerts.slice(0, 1),  // Include first orange alert
];

/**
 * Full test suite for all severity levels
 */
export const allSeverityAlerts = [
  ...yellowAlerts,
  ...orangeAlerts,
  ...redAlerts
];

/**
 * Test data organized by severity
 */
export const mockAlertsSeverity = {
  yellow: yellowAlerts,
  orange: orangeAlerts,
  red: redAlerts,
  all: allSeverityAlerts
};

/**
 * Helper function to get alerts for a specific location
 * @param {string} location - Location name (e.g., 'Ottawa', 'Toronto')
 * @param {string} severity - Severity level ('red', 'orange', 'yellow', 'all')
 * @returns {Array} Filtered alerts
 */
export function getTestAlerts(location = 'Ottawa', severity = 'yellow') {
  const allAlerts = mockAlertsSeverity[severity] || mockAlertsSeverity.yellow;
  
  if (location === 'all') {
    return allAlerts;
  }
  
  return allAlerts.filter(alert => 
    alert.tags && alert.tags.some(tag => tag.includes(location))
  );
}

/**
 * Example usage in React component:
 * 
 * import { ottawaTestAlerts } from '@/path/to/mockAlerts';
 * 
 * export default function App() {
 *   const [alerts, setAlerts] = useState(ottawaTestAlerts);
 *   
 *   const dismissAlert = (index) => {
 *     setAlerts(prev => prev.filter((_, i) => i !== index));
 *   };
 *   
 *   return (
 *     <div>
 *       <WeatherAlerts alerts={alerts} onDismiss={dismissAlert} />
 *     </div>
 *   );
 * }
 * 
 * // Testing different severity levels:
 * // const yellowAlerts = getTestAlerts('Ottawa', 'yellow');
 * // const orangeAlerts = getTestAlerts('Ottawa', 'orange');
 * // const allAlerts = getTestAlerts('Ottawa', 'all');
 */

export default mockAlertsSeverity;
