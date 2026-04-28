export const ALERT_TYPES = {
  fire: { icon: '🔥', label: 'Fire Alert', severity: 'critical' },
  medical: { icon: '🏥', label: 'Medical Emergency', severity: 'critical' },
  security: { icon: '🚔', label: 'Security Threat', severity: 'warning' },
  accident: { icon: '⚠️', label: 'Accident', severity: 'warning' },
  sos: { icon: '🚨', label: 'SOS Panic Alert', severity: 'critical' },
  flood: { icon: '🌧️', label: 'Flood Warning', severity: 'warning' },
};

export const DEPARTMENTS = [
  'Computer Science',
  'Agricultural Science',
  'Business Administration',
  'Education',
  'Engineering',
  'Health Sciences',
  'Natural Resources',
  'Staff / Faculty',
  'Other',
];

export const HOSTELS = [
  'Hostel A (Male)',
  'Hostel B (Male)',
  'Hostel C (Female)',
  'Hostel D (Female)',
  'Off-campus',
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const CAMPUS_CENTER = { lat: 9.4055, lng: -0.9706 };
export const ALERT_RADIUS_M = 200;

export const MOCK_ALERTS = [
  {
    id: 'ALT001',
    type: 'critical',
    icon: '🔥',
    title: 'Fire Alert — Main Hall',
    desc: 'Smoke detected near the Main Hall kitchen. Students urged to evacuate immediately via east exits.',
    loc: 'Main Hall · Block C',
    time: '2 min ago',
    responders: 5,
    reporter: 'Ama Asante',
    status: 'active',
  },
  {
    id: 'ALT002',
    type: 'warning',
    icon: '⚠️',
    title: 'Security Threat — Hostel A Gate',
    desc: 'Suspicious individuals reported near Hostel A main gate. Security personnel notified.',
    loc: 'Hostel A · Main Gate',
    time: '18 min ago',
    responders: 3,
    reporter: 'Kwame Boateng',
    status: 'active',
  },
  {
    id: 'ALT003',
    type: 'info',
    icon: '🌧️',
    title: 'Flood Warning — Campus Road',
    desc: 'Heavy rainfall causing waterlogging on the main campus road. Avoid the area near the clinic.',
    loc: 'Main Campus Road',
    time: '1 hr ago',
    responders: 2,
    reporter: 'Campus Admin',
    status: 'active',
  },
  {
    id: 'ALT004',
    type: 'resolved',
    icon: '✅',
    title: 'Medical Emergency Resolved',
    desc: 'Student fainted near the library. First aid administered and transferred to clinic.',
    loc: 'Library Block',
    time: '3 hr ago',
    responders: 8,
    reporter: 'Fatima Ibrahim',
    status: 'resolved',
  },
  {
    id: 'ALT005',
    type: 'resolved',
    icon: '✅',
    title: 'Power Outage — Hostel D',
    desc: 'Generator failure caused power outage in Hostel D. Power restored by facilities team.',
    loc: 'Hostel D',
    time: '5 hr ago',
    responders: 4,
    reporter: 'Maintenance Dept',
    status: 'resolved',
  },
];

export const MOCK_INCIDENTS = [
  {
    id: '#001',
    type: 'Fire',
    reporter: 'Ama Asante',
    loc: 'Main Hall',
    time: '10:32 AM',
    status: 'alert',
  },
  {
    id: '#002',
    type: 'Security',
    reporter: 'Kwame Boateng',
    loc: 'Hostel A',
    time: '10:16 AM',
    status: 'pending',
  },
  {
    id: '#003',
    type: 'Medical',
    reporter: 'Fatima Ibrahim',
    loc: 'Library',
    time: '07:44 AM',
    status: 'active',
  },
  {
    id: '#004',
    type: 'Flood',
    reporter: 'Campus Admin',
    loc: 'Campus Road',
    time: '09:15 AM',
    status: 'pending',
  },
  {
    id: '#005',
    type: 'Power',
    reporter: 'Maintenance',
    loc: 'Hostel D',
    time: '05:30 AM',
    status: 'active',
  },
];

export const MOCK_USERS = [
  {
    name: 'Ama Asante',
    id: 'CSC/0012/25',
    dept: 'Computer Science',
    hostel: 'Hostel C',
    phone: '+233 24 567 8901',
    status: 'alert',
  },
  {
    name: 'Kwame Boateng',
    id: 'AGR/0045/23',
    dept: 'Agricultural Sci.',
    hostel: 'Hostel A',
    phone: '+233 20 234 5678',
    status: 'active',
  },
  {
    name: 'Fatima Ibrahim',
    id: 'HLT/0100/24',
    dept: 'Health Sciences',
    hostel: 'Hostel D',
    phone: '+233 50 345 6789',
    status: 'active',
  },
  {
    name: 'Yaw Owusu',
    id: 'ENG/0001/22',
    dept: 'Engineering',
    hostel: 'Hostel B',
    phone: '+233 26 456 7890',
    status: 'active',
  },
  {
    name: 'Abena Mensah',
    id: 'BUS/0067/25',
    dept: 'Business Admin',
    hostel: 'Hostel C',
    phone: '+233 24 567 0123',
    status: 'active',
  },
];
