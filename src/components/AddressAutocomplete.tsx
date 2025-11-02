import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressComponents {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  initialValue = '',
  placeholder = 'Start typing your address...',
  className = '',
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Load Google Places API dynamically
    const loadGoogleMapsAPI = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

      console.log('🔧 AddressAutocomplete: Starting API load process');
      console.log('🔧 API Key present:', !!apiKey);
      console.log('🔧 API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');

      if (!apiKey) {
        console.error('❌ Google Places API key not found. Please add VITE_GOOGLE_PLACES_API_KEY to your .env file');
        setHasError(true);
        return;
      }

      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ Google Places API already loaded');
        setIsLoaded(true);
        initAutocomplete();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('🔄 Google Places API script already exists, waiting for load...');
        // Script exists, wait for it to load
        const checkGoogleMaps = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('✅ Google Places API loaded from existing script');
            setIsLoaded(true);
            initAutocomplete();
          } else {
            console.log('⏳ Still waiting for Google Places API...');
            setTimeout(checkGoogleMaps, 100);
          }
        };
        checkGoogleMaps();
        return;
      }

      // Load the script
      console.log('📦 Loading Google Places API script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Places API script loaded successfully');
        setIsLoaded(true);
        initAutocomplete();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Places API:', error);
        console.error('❌ Script URL:', script.src);
        setHasError(true);
      };
      document.head.appendChild(script);
      console.log('📦 Google Places API script added to document head');
    };

    loadGoogleMapsAPI();
  }, []);

  const initAutocomplete = () => {
    console.log('🔧 Initializing autocomplete...');
    console.log('🔧 Input ref:', !!inputRef.current);
    console.log('🔧 Window.google:', !!window.google);
    console.log('🔧 Google.maps:', !!(window.google && window.google.maps));
    console.log('🔧 Google.maps.places:', !!(window.google && window.google.maps && window.google.maps.places));
    console.log('🔧 Autocomplete ref exists:', !!autocompleteRef.current);

    if (!inputRef.current || !window.google || autocompleteRef.current) {
      console.log('❌ Cannot initialize autocomplete - missing requirements');
      return;
    }

    try {
      // Create autocomplete instance
      console.log('🔧 Creating autocomplete instance...');
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'AU' }, // Restrict to Australia
          fields: ['address_components', 'formatted_address', 'geometry']
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      console.log('✅ Autocomplete initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing autocomplete:', error);
    }
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();

    if (!place.address_components) {
      console.warn('No address components found');
      return;
    }

    // Parse address components
    const address: AddressComponents = {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'AU'
    };

    // Map Google's address components to our format
    place.address_components.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number')) {
        address.line1 = component.long_name + ' ';
      } else if (types.includes('route')) {
        address.line1 += component.long_name;
      } else if (types.includes('subpremise')) {
        address.line2 = component.long_name;
      } else if (types.includes('locality')) {
        address.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        address.state = component.short_name;
      } else if (types.includes('postal_code')) {
        address.postalCode = component.long_name;
      } else if (types.includes('country')) {
        address.country = component.short_name;
      }
    });

    // Clean up address line 1
    address.line1 = address.line1.trim();

    // Update input value with formatted address
    if (place.formatted_address) {
      setInputValue(place.formatted_address);
    }

    // Call the callback with parsed address
    onAddressSelect(address);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyEvent<HTMLInputElement>) => {
    // Prevent form submission when selecting from dropdown
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address-autocomplete">
        Address Lookup
        {!isLoaded && !hasError && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
        {hasError && <span className="text-sm text-red-500 ml-2">(Unavailable)</span>}
      </Label>
      <Input
        ref={inputRef}
        id="address-autocomplete"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={
          hasError
            ? 'Address lookup unavailable - check console for details'
            : isLoaded
              ? placeholder
              : 'Loading address lookup...'
        }
        className={className}
        disabled={disabled || (!isLoaded && !hasError)}
      />
      {isLoaded && (
        <p className="text-xs text-gray-500">
          Start typing your address and select from the suggestions to auto-fill the form below.
        </p>
      )}
      {hasError && (
        <p className="text-xs text-red-500">
          Address lookup is currently unavailable. Please fill in the address fields manually below.
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;