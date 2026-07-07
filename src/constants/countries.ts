export interface Country {
  name: string;
  code: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  // DACH first
  {
    name: 'Deutschland', code: 'DE', dialCode: '+49' 
  },
  {
    name: 'Österreich', code: 'AT', dialCode: '+43' 
  },
  {
    name: 'Schweiz', code: 'CH', dialCode: '+41' 
  },
  // Europe
  {
    name: 'Albanien', code: 'AL', dialCode: '+355' 
  },
  {
    name: 'Belgien', code: 'BE', dialCode: '+32' 
  },
  {
    name: 'Bosnien-Herzegowina', code: 'BA', dialCode: '+387' 
  },
  {
    name: 'Bulgarien', code: 'BG', dialCode: '+359' 
  },
  {
    name: 'Dänemark', code: 'DK', dialCode: '+45' 
  },
  {
    name: 'Estland', code: 'EE', dialCode: '+372' 
  },
  {
    name: 'Finnland', code: 'FI', dialCode: '+358' 
  },
  {
    name: 'Frankreich', code: 'FR', dialCode: '+33' 
  },
  {
    name: 'Griechenland', code: 'GR', dialCode: '+30' 
  },
  {
    name: 'Irland', code: 'IE', dialCode: '+353' 
  },
  {
    name: 'Island', code: 'IS', dialCode: '+354' 
  },
  {
    name: 'Italien', code: 'IT', dialCode: '+39' 
  },
  {
    name: 'Kosovo', code: 'XK', dialCode: '+383' 
  },
  {
    name: 'Kroatien', code: 'HR', dialCode: '+385' 
  },
  {
    name: 'Lettland', code: 'LV', dialCode: '+371' 
  },
  {
    name: 'Liechtenstein', code: 'LI', dialCode: '+423' 
  },
  {
    name: 'Litauen', code: 'LT', dialCode: '+370' 
  },
  {
    name: 'Luxemburg', code: 'LU', dialCode: '+352' 
  },
  {
    name: 'Malta', code: 'MT', dialCode: '+356' 
  },
  {
    name: 'Mazedonien', code: 'MK', dialCode: '+389' 
  },
  {
    name: 'Moldau', code: 'MD', dialCode: '+373' 
  },
  {
    name: 'Montenegro', code: 'ME', dialCode: '+382' 
  },
  {
    name: 'Niederlande', code: 'NL', dialCode: '+31' 
  },
  {
    name: 'Norwegen', code: 'NO', dialCode: '+47' 
  },
  {
    name: 'Polen', code: 'PL', dialCode: '+48' 
  },
  {
    name: 'Portugal', code: 'PT', dialCode: '+351' 
  },
  {
    name: 'Rumänien', code: 'RO', dialCode: '+40' 
  },
  {
    name: 'Russland', code: 'RU', dialCode: '+7' 
  },
  {
    name: 'Schweden', code: 'SE', dialCode: '+46' 
  },
  {
    name: 'Serbien', code: 'RS', dialCode: '+381' 
  },
  {
    name: 'Slowakei', code: 'SK', dialCode: '+421' 
  },
  {
    name: 'Slowenien', code: 'SI', dialCode: '+386' 
  },
  {
    name: 'Spanien', code: 'ES', dialCode: '+34' 
  },
  {
    name: 'Tschechien', code: 'CZ', dialCode: '+420' 
  },
  {
    name: 'Türkei', code: 'TR', dialCode: '+90' 
  },
  {
    name: 'Ukraine', code: 'UA', dialCode: '+380' 
  },
  {
    name: 'Ungarn', code: 'HU', dialCode: '+36' 
  },
  {
    name: 'Vereinigtes Königreich', code: 'GB', dialCode: '+44' 
  },
  {
    name: 'Weißrussland', code: 'BY', dialCode: '+375' 
  },
  {
    name: 'Zypern', code: 'CY', dialCode: '+357' 
  },
  // Americas
  {
    name: 'Argentinien', code: 'AR', dialCode: '+54' 
  },
  {
    name: 'Brasilien', code: 'BR', dialCode: '+55' 
  },
  {
    name: 'Chile', code: 'CL', dialCode: '+56' 
  },
  {
    name: 'Kanada', code: 'CA', dialCode: '+1' 
  },
  {
    name: 'Kolumbien', code: 'CO', dialCode: '+57' 
  },
  {
    name: 'Mexiko', code: 'MX', dialCode: '+52' 
  },
  {
    name: 'Peru', code: 'PE', dialCode: '+51' 
  },
  {
    name: 'USA', code: 'US', dialCode: '+1' 
  },
  {
    name: 'Venezuela', code: 'VE', dialCode: '+58' 
  },
  // Africa
  {
    name: 'Ägypten', code: 'EG', dialCode: '+20' 
  },
  {
    name: 'Kenia', code: 'KE', dialCode: '+254' 
  },
  {
    name: 'Marokko', code: 'MA', dialCode: '+212' 
  },
  {
    name: 'Nigeria', code: 'NG', dialCode: '+234' 
  },
  {
    name: 'Südafrika', code: 'ZA', dialCode: '+27' 
  },
  {
    name: 'Tunesien', code: 'TN', dialCode: '+216' 
  },
  // Middle East & Asia
  {
    name: 'Australien', code: 'AU', dialCode: '+61' 
  },
  {
    name: 'China', code: 'CN', dialCode: '+86' 
  },
  {
    name: 'Indien', code: 'IN', dialCode: '+91' 
  },
  {
    name: 'Indonesien', code: 'ID', dialCode: '+62' 
  },
  {
    name: 'Israel', code: 'IL', dialCode: '+972' 
  },
  {
    name: 'Japan', code: 'JP', dialCode: '+81' 
  },
  {
    name: 'Malaysia', code: 'MY', dialCode: '+60' 
  },
  {
    name: 'Neuseeland', code: 'NZ', dialCode: '+64' 
  },
  {
    name: 'Pakistan', code: 'PK', dialCode: '+92' 
  },
  {
    name: 'Philippinen', code: 'PH', dialCode: '+63' 
  },
  {
    name: 'Saudi-Arabien', code: 'SA', dialCode: '+966' 
  },
  {
    name: 'Singapur', code: 'SG', dialCode: '+65' 
  },
  {
    name: 'Südkorea', code: 'KR', dialCode: '+82' 
  },
  {
    name: 'Thailand', code: 'TH', dialCode: '+66' 
  },
  {
    name: 'Vereinigte Arabische Emirate', code: 'AE', dialCode: '+971' 
  },
  {
    name: 'Vietnam', code: 'VN', dialCode: '+84' 
  },
];
