import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry"
];

const majorIndianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", 
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam"
];

export default function Checkout() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  // UI States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- ADD THIS BOUNCER EFFECT ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Catch unauthorized direct URL access
      navigate('/signin?redirect=/checkout');
    }
  }, [navigate]);
  // --------
  
  // Location Search States (OpenStreetMap)
  const [searchQuery, setSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  // Core Shipping Form Data
  const [shippingAddress, setShippingAddress] = useState({
    phone: '',
    flat: '',
    building: '',
    line2: '',
    pin: '',
    city: '',
    state: ''
  });

  const calculatedCartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const authToken = localStorage.getItem('token');

  // Handle clicking outside the location search dropdown to close it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced API call to OpenStreetMap for live location search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setLocationResults([]);
      return;
    }
    
    const debounceTimer = setTimeout(() => {
      axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&addressdetails=1&countrycodes=in&limit=5`)
        .then(response => setLocationResults(response.data))
        .catch(error => console.error("Location Search Error:", error));
    }, 600);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Auto-populate the shipping form when a user selects a location from the dropdown
  const handleSelectLocation = (selectedLocation) => {
    setSearchQuery(selectedLocation.display_name);
    setIsDropdownVisible(false);
    
    const addressDetails = selectedLocation.address || {};
    
    setShippingAddress(previousState => ({
      ...previousState,
      pin: addressDetails.postcode || previousState.pin,
      city: addressDetails.city || addressDetails.state_district || addressDetails.county || previousState.city,
      state: addressDetails.state || previousState.state
    }));
  };

  // Validation Check: Ensures all required fields are filled and phone number matches Indian 10-digit format
  const isFormComplete = 
    shippingAddress.phone.match(/^[6-9]\d{9}$/) && 
    shippingAddress.flat && 
    shippingAddress.building && 
    shippingAddress.pin.length === 6 && 
    shippingAddress.city && 
    shippingAddress.state;

  // Main Payment Orchestrator
  const handlePaymentSubmission = async () => {
    if (!authToken) return toast.error('Please log in to continue.');
    if (!window.Razorpay) return toast.error('Payment gateway is currently unavailable.');
    
    setIsProcessingPayment(true);

    try {
      // Step 1: Tell the backend to create a pending order and fetch the Razorpay Order ID
      const finalAddressPayload = { ...shippingAddress, searchLocation: searchQuery };
      
      const { data: orderResponseData } = await axios.post(
        `${backendUrl}/payments/checkout`,
        { cartItems: cart, shippingAddress: finalAddressPayload }, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Step 2: Configure the Razorpay Modal
      const razorpayOptions = {
        key: razorpayKeyId,
        amount: orderResponseData.amount,
        currency: orderResponseData.currency,
        name: 'Coloured Corners',
        description: 'Secure Checkout',
        order_id: orderResponseData.rzpOrderId, 
        
        // Step 3: Handle the success callback from Razorpay
        handler: async function (paymentResponse) {
          try {
            // Send the cryptographic proofs to our backend for verification
            await axios.post(
              `${backendUrl}/payments/verify`,
              {
                rzpOrderId: paymentResponse.razorpay_order_id,
                rzpPaymentId: paymentResponse.razorpay_payment_id,
                rzpSig: paymentResponse.razorpay_signature,
                orderId: orderResponseData.orderId,
              },
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            // THE FIX: Use the new single clearCart function!
            await clearCart(); 
            navigate('/order-success', { state: { orderId: orderResponseData.orderId } });
            
          } catch (verificationError) {
            navigate('/order-failed', { state: { reason: 'Payment signature verification failed.' } }); 
          }
        },
        
        // Handle when the user manually closes the Razorpay modal
        modal: { 
          ondismiss: () => setIsProcessingPayment(false) 
        },
        theme: { color: '#16A34A' } // Tailwind Green-600
      };

      // Step 4: Initialize and open the Razorpay UI
      const razorpayInstance = new window.Razorpay(razorpayOptions);
      
      // Handle native failures from the Razorpay modal (e.g., declined cards)
      razorpayInstance.on('payment.failed', function (failedResponse) {
        navigate('/order-failed', { state: { reason: failedResponse.error.description } });
      });
      
      razorpayInstance.open();

    } catch (checkoutError) {
      console.error(checkoutError);
      toast.error(checkoutError.response?.data?.message || 'Failed to initiate checkout. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // Guard clause: Do not render the checkout form if the cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="text-center mt-20">
          <h2>Your cart is empty!</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-5 text-green-600 underline">
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="p-10 max-w-[1100px] mx-auto mt-5 flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Shipping Form */}
        <div className="flex-1 bg-white/5 p-8 rounded-2xl border border-[#222]">
          <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
          <div className="flex flex-col gap-5">
            
            {/* OpenStreetMap Auto-Complete Search */}
            <div className="relative" ref={searchContainerRef}>
              <input 
                placeholder="Search delivery location online..." 
                value={searchQuery} 
                onChange={e => { setSearchQuery(e.target.value); setIsDropdownVisible(true); }}
                onFocus={() => setIsDropdownVisible(true)}
                className="w-full p-4 bg-[#111] border border-green-500/50 rounded-lg text-white focus:border-green-500 focus:outline-none placeholder-gray-500"
              />
              {isDropdownVisible && locationResults.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {locationResults.map(location => (
                    <li 
                      key={location.place_id} 
                      onClick={() => handleSelectLocation(location)}
                      className="p-3 hover:bg-white/10 cursor-pointer text-sm border-b border-[#333] last:border-0"
                    >
                      {location.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Explicit Address Inputs */}
            <div className="border-t border-[#333] pt-5">
              <span className="text-sm text-green-500 font-semibold mb-3 block">Complete Address</span>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <input 
                    required
                    placeholder="Flat / Floor No." 
                    value={shippingAddress.flat} 
                    onChange={e => setShippingAddress({...shippingAddress, flat: e.target.value})}
                    className="w-1/3 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                  <input 
                    required
                    placeholder="Building Name / Society" 
                    value={shippingAddress.building} 
                    onChange={e => setShippingAddress({...shippingAddress, building: e.target.value})}
                    className="flex-1 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>

                <input 
                  placeholder="Additional Address (Landmark, Area) - Optional" 
                  value={shippingAddress.line2} 
                  onChange={e => setShippingAddress({...shippingAddress, line2: e.target.value})}
                  className="p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                />

                <div className="flex gap-4">
                  <input 
                    required
                    maxLength={6}
                    placeholder="6-Digit Pincode" 
                    value={shippingAddress.pin} 
                    onChange={e => setShippingAddress({...shippingAddress, pin: e.target.value.replace(/\D/g, '')})}
                    className="w-32 shrink-0 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                  
                  <input 
                    required
                    list="indian-cities"
                    placeholder="Search City" 
                    value={shippingAddress.city} 
                    onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="flex-1 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                  <datalist id="indian-cities">
                    {majorIndianCities.map(city => <option key={city} value={city} />)}
                  </datalist>

                  <select 
                    value={shippingAddress.state} 
                    onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="flex-1 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Contact Information */}
            <div className="border-t border-[#333] pt-5">
              <span className="text-sm text-green-500 font-semibold mb-3 block">Contact Info</span>
              <div className="flex gap-4">
                <span className="p-4 bg-[#111] border border-[#444] rounded-lg text-gray-400 select-none">
                  +91
                </span>
                <input 
                  required
                  maxLength={10}
                  placeholder="10-digit Mobile Number" 
                  value={shippingAddress.phone} 
                  onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value.replace(/\D/g, '')})}
                  className={`flex-1 p-4 bg-[#111] border rounded-lg text-white focus:outline-none transition-colors ${
                    shippingAddress.phone.length > 0 && !shippingAddress.phone.match(/^[6-9]\d{9}$/) 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#444] focus:border-green-500'
                  }`}
                />
              </div>
              {/* Inline error for invalid phone numbers */}
              {shippingAddress.phone.length > 0 && !shippingAddress.phone.match(/^[6-9]\d{9}$/) && (
                <p className="text-red-500 text-xs mt-2">Please enter a valid 10-digit Indian mobile number.</p>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="w-full lg:w-[380px] bg-white/5 p-8 rounded-2xl border border-[#222] h-fit">
          <h3 className="text-xl font-semibold mb-5 border-b border-[#333] pb-3">Order Summary</h3>
          
          <div className="flex flex-col gap-4 mb-8">
            {cart.map(cartItem => (
              <div key={cartItem.product.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{cartItem.qty}x {cartItem.product.name}</span>
                <span className="font-medium">₹{cartItem.product.price * cartItem.qty}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-[#333] pt-5 mb-8">
            <span className="text-lg">Total to Pay:</span>
            <span className="text-2xl font-bold text-green-600">₹{calculatedCartTotal}</span>
          </div>

          {/* Submit Button dynamically unlocks based on form validation */}
          <button 
            onClick={handlePaymentSubmission}
            disabled={isProcessingPayment || !isFormComplete}
            className={`w-full p-4 rounded-lg text-lg font-bold transition-all ${
              (isProcessingPayment || !isFormComplete) 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
            }`}
          >
            {isProcessingPayment 
              ? 'Processing...' 
              : !isFormComplete 
                ? 'Complete Details to Pay' 
                : `Pay ₹${calculatedCartTotal}`
            }
          </button>
        </div>

      </div>
    </div>
  );
}