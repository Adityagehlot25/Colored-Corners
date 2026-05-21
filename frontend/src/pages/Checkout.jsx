import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Chandigarh", "Puducherry"
];

const majorCities = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune",
    "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot",
    "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
    "Navi Mumbai", "Allahabad", "Howrah", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", "Jodhpur"
];

export default function Checkout() {
    const { cart, removeFromCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const [addr, setAddr] = useState({
        phone: '',
        flat: '',
        building: '',
        line2: '',
        pin: '',
        city: '',
        state: ''
    });

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (search.length < 3) {
            setResults([]);
            return;
        }
        const timer = setTimeout(() => {
            // Reverted to OpenStreetMap (Nominatim) - 100% Free, No API Keys needed
            axios.get(`https://nominatim.openstreetmap.org/search?q=${search}&format=json&addressdetails=1&countrycodes=in&limit=5`)
                .then(res => setResults(res.data))
                .catch(err => console.error("OSM Error:", err));
        }, 600);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSelectLocation = (loc) => {
        setSearch(loc.display_name);
        setShowDropdown(false);

        const address = loc.address || {};
        setAddr(prev => ({
            ...prev,
            pin: address.postcode || prev.pin,
            city: address.city || address.state_district || address.county || prev.city,
            state: address.state || prev.state
        }));
    };

    const isComplete = addr.phone.match(/^[6-9]\d{9}$/) &&
        addr.flat &&
        addr.building &&
        addr.pin.length === 6 &&
        addr.city &&
        addr.state;

    const handlePayment = async () => {
        if (!token) return toast.error('Please login to continue');
        setLoading(true);

        try {
            const finalAddress = { ...addr, searchLocation: search };
            const { data: orderData } = await axios.post(
                `${backendUrl}/payments/checkout`,
                { cartItems: cart, shippingAddress: finalAddress },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const options = {
                key: rzpKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Coloured Corners',
                description: 'Secure Purchase',
                order_id: orderData.rzpOrderId,
                handler: async function (res) {
                    try {
                        await axios.post(
                            `${backendUrl}/payments/verify`,
                            {
                                razorpay_order_id: res.razorpay_order_id,
                                razorpay_payment_id: res.razorpay_payment_id,
                                razorpay_signature: res.razorpay_signature,
                                internal_order_id: orderData.orderId,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        cart.forEach(item => removeFromCart(item.product.id));
                        navigate('/order-success');
                    } catch (err) {
                        navigate('/order-failed');
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
                theme: { color: '#16A34A' }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (err) {
            console.error(err);
            toast.error('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white">
                <Navbar />
                <div className="text-center mt-20">
                    <h2>Your cart is empty!</h2>
                    <button onClick={() => navigate('/dashboard')} className="mt-5 text-green-600 underline">Go Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="p-10 max-w-[1100px] mx-auto mt-5 flex flex-col lg:flex-row gap-10">

                <div className="flex-1 bg-white/5 p-8 rounded-2xl border border-[#222]">
                    <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
                    <div className="flex flex-col gap-5">

                        <div className="relative" ref={searchRef}>
                            <input
                                placeholder="Search delivery location online..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full p-4 bg-[#111] border border-green-500/50 rounded-lg text-white focus:border-green-500 focus:outline-none placeholder-gray-500"
                            />
                            {showDropdown && results.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {results.map(loc => (
                                        <li
                                            key={loc.place_id}
                                            onClick={() => handleSelectLocation(loc)}
                                            className="p-3 hover:bg-white/10 cursor-pointer text-sm border-b border-[#333] last:border-0"
                                        >
                                            {loc.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Phone Number Field */}
                        <div>
                            <span className="text-sm text-green-500 font-semibold mb-3 block">Contact Info</span>
                            <div className="flex gap-4">
                                <span className="p-4 bg-[#111] border border-[#444] rounded-lg text-gray-400 select-none">
                                    +91
                                </span>
                                <input
                                    required
                                    maxLength={10}
                                    placeholder="10-digit Mobile Number"
                                    value={addr.phone}
                                    onChange={e => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, '') })}
                                    className={`flex-1 p-4 bg-[#111] border rounded-lg text-white focus:outline-none transition-colors ${addr.phone.length > 0 && !addr.phone.match(/^[6-9]\d{9}$/)
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-[#444] focus:border-green-500'
                                        }`}
                                />
                            </div>
                            {addr.phone.length > 0 && !addr.phone.match(/^[6-9]\d{9}$/) && (
                                <p className="text-red-500 text-xs mt-2">Please enter a valid 10-digit Indian mobile number.</p>
                            )}
                        </div>

                        <div className="border-t border-[#333] pt-5">
                            <span className="text-sm text-green-500 font-semibold mb-3 block">Complete Address</span>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <input
                                        required
                                        placeholder="Flat / Floor No."
                                        value={addr.flat}
                                        onChange={e => setAddr({ ...addr, flat: e.target.value })}
                                        className="w-1/3 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                                    />
                                    <input
                                        required
                                        placeholder="Building Name / Society"
                                        value={addr.building}
                                        onChange={e => setAddr({ ...addr, building: e.target.value })}
                                        className="flex-1 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                                    />
                                </div>

                                <input
                                    placeholder="Additional Address (Landmark, Area) - Optional"
                                    value={addr.line2}
                                    onChange={e => setAddr({ ...addr, line2: e.target.value })}
                                    className="p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                                />

                                <div className="flex gap-4">
                                    <input
                                        required
                                        maxLength={6}
                                        placeholder="6-Digit Pincode"
                                        value={addr.pin}
                                        onChange={e => setAddr({ ...addr, pin: e.target.value.replace(/\D/g, '') })}
                                        className="w-32 shrink-0 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                                    />

                                    <input
                                        required
                                        list="indian-cities"
                                        placeholder="Search City"
                                        value={addr.city}
                                        onChange={e => setAddr({ ...addr, city: e.target.value })}
                                        className="flex-1 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none"
                                    />
                                    <datalist id="indian-cities">
                                        {majorCities.map(c => <option key={c} value={c} />)}
                                    </datalist>

                                    <select
                                        value={addr.state}
                                        onChange={e => setAddr({ ...addr, state: e.target.value })}
                                        className="flex-1 p-3 bg-[#0A0A0A] border border-[#444] rounded-lg text-white focus:border-green-500 focus:outline-none cursor-pointer"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="w-full lg:w-[380px] bg-white/5 p-8 rounded-2xl border border-[#222] h-fit">
                    <h3 className="text-xl font-semibold mb-5 border-b border-[#333] pb-3">Order Summary</h3>
                    <div className="flex flex-col gap-4 mb-8">
                        {cart.map(item => (
                            <div key={item.product.id} className="flex justify-between text-sm">
                                <span className="text-gray-300">{item.qty}x {item.product.name}</span>
                                <span className="font-medium">INR {item.product.price * item.qty}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-[#333] pt-5 mb-8">
                        <span className="text-lg">Total to Pay:</span>
                        <span className="text-2xl font-bold text-green-600">INR {cartTotal}</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading || !isComplete}
                        className={`w-full p-4 rounded-lg text-lg font-bold transition-all ${(loading || !isComplete) ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
                            }`}
                    >
                        {loading ? 'Processing...' : !isComplete ? 'Complete Address to Pay' : `Pay INR ${cartTotal}`}
                    </button>
                </div>

            </div>
        </div>
    );
}