import { Link, useNavigate } from 'react-router-dom';
// 🩹 FIXED: Pointed strictly to lowercase './icons' to prevent Linux production build crashes!
import { SearchIcon, CompanyNameText, BrandLogo } from './icons';

export default function Navbar() {
  const navigate = useNavigate();

  // Re-using your bulletproof Auth State checker
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* FIGMA CONTAINER: w: 1440, h: 83, px: 64, py: 20 */}
      <nav className="mx-auto flex h-[83px] max-w-[1440px] items-center justify-between px-16 py-5">

        {/* --- LOGO + COMPANY NAME LOCKUP --- */}
        <Link to="/" className="flex h-[43px] w-[230px] items-center gap-3">

          {/* THE SWAP: Native SVG Components taking control! */}
          <BrandLogo className="w-[39px] h-[43px] shrink-0" />
          <CompanyNameText className="w-[191px] h-[29px]" />

        </Link>

        {/* --- NAV LINKS CONTAINER --- */}
        <div className="flex items-center gap-3 text-sm font-medium text-[#5C5140]">

          {/* Shop Button (w: 57, h: 35, bg: #DBD0BC, rounded: 6px) */}
          <Link
            to="/dashboard"
            className="flex h-[35px] items-center justify-center rounded-[6px] bg-[#DBD0BC] px-3 transition-colors hover:bg-[#c5b9a3]"
          >
            shop
          </Link>

          {/* Contact Button (w: 78, h: 35, bg: #DBD0BC, rounded: 6px) */}
          <Link
            to="/contact"
            className="flex h-[35px] items-center justify-center rounded-[6px] bg-[#DBD0BC] px-3 transition-colors hover:bg-[#c5b9a3]"
          >
            Contact
          </Link>

          {/* About Us Button (w: 86, h: 35, bg: #DBD0BC, rounded: 6px) */}
          <Link
            to="/about"
            className="flex h-[35px] items-center justify-center rounded-[6px] bg-[#DBD0BC] px-3 transition-colors hover:bg-[#c5b9a3]"
          >
            About Us
          </Link>

          {/* --- THE INTERCHANGEABLE AUTH BUTTON --- */}
          {/* FIGMA: w: 65, h: 35, bg: #5C5140, rounded: 6px */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex h-[35px] cursor-pointer items-center justify-center rounded-[6px] bg-[#5C5140] px-3 text-white transition-colors hover:bg-[#433a2e]"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/signin"
              className="flex h-[35px] items-center justify-center rounded-[6px] bg-[#5C5140] px-3 text-white transition-colors hover:bg-[#433a2e]"
            >
              Log in
            </Link>
          )}

          {/* --- SEARCH ICON --- */}
          {/* FIGMA: w: 36, h: 36, rounded: 18px, p: 9 */}
          <button
            onClick={() => navigate('/dashboard')}
            className="ml-1 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[18px] bg-white/40 p-[9px] text-[#5C5140] transition-all hover:bg-white/80 hover:shadow-xs"
            title="Search Products"
          >
            <SearchIcon />
          </button>

        </div>

      </nav>
    </header>
  );
}