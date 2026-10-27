import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  User,
  Clock,
  Info,
  Search,
  MapPin,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Tag,
  ArrowUpDown,
  Phone,
  MessageSquare,
  ShieldCheck,
  Key,
  Camera,
  Star,
  Upload,
  Image as ImageIcon,
  LogIn,
  UserPlus,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Package,
  ShoppingBag,
  Trash2,
  ExternalLink,
  Mail,
  FileText,
} from "lucide-react";

/* ------------------------------------------------------------------
   RENTLY — MERN Intermediate Peer-to-Peer Sharing Platform
   Palette: Dessert Rose
     --cream   #ECEBE8  page base
     --blush   #F5E2E3  card surface
     --petal   #ECCBC9  secondary / tags
     --mauve   #E0C5C4  borders / dividers
     --rose    #D0A0A3  primary accent (buttons, active states)
     --ink     #4A3335  headings
     --ink-soft #8A6668 body / muted text
 ------------------------------------------------------------------- */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const PALETTE = {
  cream: "#ECEBE8",
  blush: "#F5E2E3",
  petal: "#ECCBC9",
  mauve: "#E0C5C4",
  rose: "#D0A0A3",
  ink: "#4A3335",
  inkSoft: "#8A6668",
};

const DISTANCES = [5, 10, 15, 20, 25, 30];

/* ------------------------------------------------------------------
   Dynamic Geolocation & Haversine Distance Engine
   Accurately maps cities & localities across Tamil Nadu / South India
------------------------------------------------------------------- */
const GEO_COORDINATES = {
  // Coimbatore & Neighborhoods
  "perur": { lat: 10.9708, lng: 76.9114 },
  "641010": { lat: 10.9708, lng: 76.9114 },
  "navakkarai": { lat: 10.8650, lng: 76.9030 },
  "641105": { lat: 10.8650, lng: 76.9030 },
  "peelamedu": { lat: 11.0280, lng: 77.0050 },
  "641004": { lat: 11.0280, lng: 77.0050 },
  "gandhipuram": { lat: 11.0180, lng: 76.9670 },
  "641012": { lat: 11.0180, lng: 76.9670 },
  "rs puram": { lat: 11.0100, lng: 76.9450 },
  "r.s. puram": { lat: 11.0100, lng: 76.9450 },
  "641002": { lat: 11.0100, lng: 76.9450 },
  "ukkadam": { lat: 10.9930, lng: 76.9610 },
  "641001": { lat: 10.9930, lng: 76.9610 },
  "saravanampatti": { lat: 11.0790, lng: 76.9990 },
  "641035": { lat: 11.0790, lng: 76.9990 },
  "singanallur": { lat: 10.9980, lng: 77.0250 },
  "641005": { lat: 10.9980, lng: 77.0250 },
  "saibaba colony": { lat: 11.0320, lng: 76.9470 },
  "641011": { lat: 11.0320, lng: 76.9470 },
  "kuniyamuthur": { lat: 10.9630, lng: 76.9530 },
  "641008": { lat: 10.9630, lng: 76.9530 },
  "kovaipudur": { lat: 10.9380, lng: 76.9440 },
  "641042": { lat: 10.9380, lng: 76.9440 },
  "thudiyalur": { lat: 11.0820, lng: 76.9380 },
  "ganapathy": { lat: 11.0380, lng: 76.9850 },
  "pollachi": { lat: 10.6580, lng: 77.0080 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "kovai": { lat: 11.0168, lng: 76.9558 },

  // Chennai & Neighborhoods
  "anna nagar": { lat: 13.0850, lng: 80.2101 },
  "600040": { lat: 13.0850, lng: 80.2101 },
  "velachery": { lat: 12.9815, lng: 80.2180 },
  "600042": { lat: 12.9815, lng: 80.2180 },
  "t nagar": { lat: 13.0418, lng: 80.2341 },
  "t. nagar": { lat: 13.0418, lng: 80.2341 },
  "usman road": { lat: 13.0418, lng: 80.2341 },
  "600017": { lat: 13.0418, lng: 80.2341 },
  "adyar": { lat: 13.0012, lng: 80.2565 },
  "600020": { lat: 13.0012, lng: 80.2565 },
  "guindy": { lat: 13.0067, lng: 80.2025 },
  "600032": { lat: 13.0067, lng: 80.2025 },
  "porur": { lat: 13.0382, lng: 80.1565 },
  "600116": { lat: 13.0382, lng: 80.1565 },
  "tambaram": { lat: 12.9249, lng: 80.1000 },
  "600045": { lat: 12.9249, lng: 80.1000 },
  "mylapore": { lat: 13.0368, lng: 80.2676 },
  "nungambakkam": { lat: 13.0569, lng: 80.2425 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "madras": { lat: 13.0827, lng: 80.2707 },

  // Other Major Cities
  "tiruppur": { lat: 11.1085, lng: 77.3411 },
  "erode": { lat: 11.3410, lng: 77.7172 },
  "salem": { lat: 11.6643, lng: 78.1460 },
  "madurai": { lat: 9.9252, lng: 78.1198 },
  "trichy": { lat: 10.7905, lng: 78.7047 },
  "tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
};

function getCoordinates(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.toLowerCase();

  // First match specific locality or pincode keywords
  for (const [key, coord] of Object.entries(GEO_COORDINATES)) {
    if (s.includes(key)) {
      return coord;
    }
  }

  // Regex check for 6-digit Tamil Nadu / Karnataka pincodes
  const pinMatch = s.match(/\b(641\d{3}|600\d{3}|638\d{3}|636\d{3}|625\d{3}|620\d{3}|560\d{3})\b/);
  if (pinMatch) {
    const pin = pinMatch[1];
    if (pin.startsWith("641")) return GEO_COORDINATES["coimbatore"];
    if (pin.startsWith("600")) return GEO_COORDINATES["chennai"];
    if (pin.startsWith("638")) return GEO_COORDINATES["erode"];
    if (pin.startsWith("636")) return GEO_COORDINATES["salem"];
    if (pin.startsWith("625")) return GEO_COORDINATES["madurai"];
    if (pin.startsWith("620")) return GEO_COORDINATES["trichy"];
    if (pin.startsWith("560")) return GEO_COORDINATES["bangalore"];
  }

  return null;
}

function calculateDistanceKm(userLocStr, itemLocStr, defaultFallback = 5) {
  if (!userLocStr && !itemLocStr) return defaultFallback;

  const userCoord = getCoordinates(userLocStr || "Navakkarai, Coimbatore");
  const itemCoord = getCoordinates(itemLocStr || "Navakkarai, Coimbatore");

  if (!userCoord || !itemCoord) {
    // If exact coords couldn't be parsed, check word overlap
    if (userLocStr && itemLocStr) {
      const uTokens = userLocStr.toLowerCase().split(/[\s,.-]+/);
      const iTokens = itemLocStr.toLowerCase().split(/[\s,.-]+/);
      const common = uTokens.filter((t) => t.length > 3 && iTokens.includes(t));
      if (common.length > 0) return 3;
    }
    return defaultFallback;
  }

  // Haversine formula (Earth radius ~6371 km)
  const R = 6371;
  const dLat = ((itemCoord.lat - userCoord.lat) * Math.PI) / 180;
  const dLng = ((itemCoord.lng - userCoord.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userCoord.lat * Math.PI) / 180) *
      Math.cos((itemCoord.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);

  return km < 1 ? 1 : km;
}

const INITIAL_FALLBACK_PRODUCTS = [];

// Automatic one-time cleanup of legacy mock user sessions from prior testing
try {
  if (typeof window !== "undefined" && !localStorage.getItem("rently_v3_clean_initialized")) {
    localStorage.removeItem("rentalhub_active_user");
    localStorage.removeItem("rentalhub_registered_users");
    localStorage.removeItem("rentalhub_custom_products");
    localStorage.removeItem("rentalhub_custom_rentals");
    localStorage.setItem("rently_v3_clean_initialized", "true");
  }
} catch (e) {}

export default function RentalHubDashboard() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("rently_v3_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(null);
  const [sort, setSort] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'sell' | 'rent' | 'profile' | 'recent' | 'about' | 'handshake' | 'auth' | 'admin_hidden'
  const [profileActiveTab, setProfileActiveTab] = useState("selling"); // 'selling' | 'renting' | 'orders' | 'profile'
  const [feedView, setFeedView] = useState("all"); // 'all' | 'selling' | 'renting'
  const [rentTarget, setRentTarget] = useState(null);
  const [handshakeRental, setHandshakeRental] = useState(null);
  const [handshakeType, setHandshakeType] = useState("pickup");
  const [handshakeRole, setHandshakeRole] = useState("seller_pickup"); // 'seller_pickup' | 'renter_return'
  const [activeChatRental, setActiveChatRental] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [rentals, setRentals] = useState(() => {
    try {
      const saved = localStorage.getItem("rently_v3_rentals");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Auth State: Clean state (Guest by default until logged in or registered)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("rently_v3_active_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active user location for dynamic distance calculations
  const activeUserLocation = currentUser?.location || "Coimbatore";

  // Products dynamically enriched with accurate distance from active user
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const dynamicKm = calculateDistanceKm(
        activeUserLocation,
        p.location || p.sellerAddress,
        p.distanceKm || 5
      );
      return {
        ...p,
        distanceKm: dynamicKm,
      };
    });
  }, [products, activeUserLocation]);

  // Memoized user's items for selling, renting, and orders
  const userSellingProducts = useMemo(() => {
    if (!currentUser) return [];
    return enrichedProducts.filter((p) => checkIsOwnProduct(p, currentUser));
  }, [enrichedProducts, currentUser]);

  const userRentedItems = useMemo(() => {
    if (!currentUser) return [];
    const curEmail = currentUser.email?.toLowerCase().trim();
    const curId = currentUser._id || currentUser.id;

    return rentals.filter((r) => {
      const matchId = r.renterId && curId && (r.renterId === curId);
      const matchEmail = r.renterEmail && curEmail && (r.renterEmail.toLowerCase().trim() === curEmail);
      return matchId || matchEmail;
    });
  }, [rentals, currentUser]);

  const userReceivedOrders = useMemo(() => {
    if (!currentUser) return [];
    const curEmail = currentUser.email?.toLowerCase().trim();
    const curId = currentUser._id || currentUser.id;

    return rentals.filter((r) => {
      const matchId = r.sellerId && curId && (r.sellerId === curId);
      const matchEmail = r.sellerEmail && curEmail && (r.sellerEmail.toLowerCase().trim() === curEmail);
      return matchId || matchEmail;
    });
  }, [rentals, currentUser]);

  // Incoming rental booking requests on owner's items awaiting handover
  const pendingIncomingOrders = useMemo(() => {
    return userReceivedOrders.filter((r) => !r.pickupVerified);
  }, [userReceivedOrders]);

  const isSearching = query.trim().length > 0;

  const flash = (msg) => {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({ ...item, id: item._id || item.id }));
          setProducts(formatted);
          try {
            localStorage.setItem("rently_v3_products", JSON.stringify(formatted));
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Using fallback products state.", e);
    }
  };

  const fetchRentals = async () => {
    try {
      const res = await fetch(`${API_BASE}/rentals`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRentals(data);
          try {
            localStorage.setItem("rently_v3_rentals", JSON.stringify(data));
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Could not fetch rentals from server.", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRentals();

    // Auto-sync polling every 4 seconds so listings from any other account appear automatically
    const syncInterval = setInterval(() => {
      fetchProducts();
      fetchRentals();
    }, 4000);

    const onFocus = () => {
      fetchProducts();
      fetchRentals();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const trackRecentlyViewed = (product) => {
    setRecentlyViewed((prev) => {
      const exists = prev.some((p) => (p._id || p.id) === (product._id || product.id));
      if (exists) return prev;
      return [product, ...prev];
    });
  };

  const handleViewProduct = (product) => {
    const dynamicKm = calculateDistanceKm(
      activeUserLocation,
      product.location || product.sellerAddress,
      product.distanceKm || 5
    );
    const enriched = { ...product, distanceKm: dynamicKm };
    trackRecentlyViewed(enriched);
    setActiveProduct(enriched);
  };

  const handleNav = (where, payload) => {
    if (where === "sell") {
      if (!currentUser) {
        flash("Please log in or sign up to list an item for rent.");
        setActiveModal("auth");
      } else {
        setActiveModal("sell");
      }
    } else if (where === "rent") {
      if (!currentUser) {
        flash("Please log in or sign up to book a rental.");
        setActiveModal("auth");
      } else if (payload) {
        // Prevent owners from renting their own products
        if (checkIsOwnProduct(payload, currentUser)) {
          flash("You cannot rent your own item. You are the owner of this listing.");
          return;
        }

        trackRecentlyViewed(payload);
        setRentTarget(payload);
        setActiveModal("rent");
      }
    } else if (where === "my_items" || where === "my_listings") {
      if (!currentUser) {
        flash("Please log in to view the items you sell and rent.");
        setActiveModal("auth");
      } else {
        setProfileActiveTab("selling");
        setActiveModal("activity_hub");
      }
    } else if (where === "my_rentals") {
      if (!currentUser) {
        flash("Please log in to view items you have rented or borrowed.");
        setActiveModal("auth");
      } else {
        setProfileActiveTab("renting");
        setActiveModal("activity_hub");
      }
    } else if (where === "profile" || where === "account") {
      if (!currentUser) setActiveModal("auth");
      else {
        setActiveModal("profile");
      }
    } else if (where === "recent") setActiveModal("recent");
    else if (where === "about") setActiveModal("about");
    else if (where === "agreement" || where === "terms") setActiveModal("agreement");
    else if (where === "auth") setActiveModal("auth");
    else if (where === "admin_hidden") setActiveModal("admin_hidden");
  };

  // Add Product
  const handleAddProduct = async (newProdData) => {
    const itemLocation =
      newProdData.location?.trim() ||
      currentUser?.location?.trim() ||
      "Perur, Coimbatore";
    const sellerId = currentUser?._id || currentUser?.id || ("u_" + Date.now());
    const sellerName = currentUser?.name?.trim() || "Member";
    const sellerPhone = currentUser?.phone?.trim() || "";
    const sellerEmail = currentUser?.email?.trim() || "";
    const sellerAddress = itemLocation;

    const payload = {
      ...newProdData,
      location: itemLocation,
      sellerAddress: sellerAddress,
      sellerId: sellerId,
      sellerName: sellerName,
      sellerPhone: sellerPhone,
      sellerEmail: sellerEmail,
      rating: 5.0,
      reviewCount: 1,
      id: "p_" + Date.now(),
      _id: "p_" + Date.now(),
    };

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const finalItem = { ...payload, ...created, id: created._id || created.id || payload.id };
        setProducts((prev) => {
          const filtered = prev.filter((p) => (p._id || p.id) !== finalItem.id);
          const updated = [finalItem, ...filtered];
          try {
            localStorage.setItem("rently_v3_products", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        flash(`"${newProdData.title}" listed successfully!`);
        fetchProducts();
      } else {
        setProducts((prev) => {
          const updated = [payload, ...prev];
          try {
            localStorage.setItem("rently_v3_products", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        flash(`"${newProdData.title}" listed successfully!`);
      }
    } catch (err) {
      setProducts((prev) => {
        const updated = [payload, ...prev];
        try {
          localStorage.setItem("rently_v3_products", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      flash(`"${newProdData.title}" listed successfully!`);
    }
    setActiveModal(null);
    setFeedView("all");
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    try {
      await fetch(`${API_BASE}/products/${productId}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Delete API call failed, proceeding locally", e);
    }
    setProducts((prev) => {
      const updated = prev.filter((p) => (p._id || p.id) !== productId);
      try {
        localStorage.setItem("rently_v3_products", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    flash("Listing removed successfully.");
  };



  // Create Rental
  const handleCreateRental = async (bookingData) => {
    // Check if user is attempting to rent their own item
    if (checkIsOwnProduct(bookingData, currentUser)) {
      flash("You cannot rent a product you posted. You are the owner of this item.");
      setActiveModal(null);
      setRentTarget(null);
      return;
    }

    try {
      const payload = {
        ...bookingData,
        renterName: currentUser?.name || "Renter",
        renterEmail: currentUser?.email || "",
        renterPhone: currentUser?.phone || "",
      };
      const res = await fetch(`${API_BASE}/rentals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setRentals((prev) => [created, ...prev]);
        flash(`Booking confirmed! Your Pickup OTP is ${created.pickupOtp}. Share this with ${bookingData.sellerName} at handover.`);
      } else {
        const localCreated = {
          ...payload,
          _id: "r_" + Date.now(),
          pickupOtp: String(Math.floor(100000 + Math.random() * 900000)),
          returnOtp: String(Math.floor(100000 + Math.random() * 900000)),
          status: "Pickup Pending",
        };
        setRentals((prev) => [localCreated, ...prev]);
        flash(`Booking confirmed! Your Pickup OTP is ${localCreated.pickupOtp}. Share this with ${bookingData.sellerName} at handover.`);
      }
    } catch (e) {
      const localCreated = {
        ...bookingData,
        renterName: currentUser?.name || "Renter",
        renterEmail: currentUser?.email || "",
        renterPhone: currentUser?.phone || "",
        _id: "r_" + Date.now(),
        pickupOtp: String(Math.floor(100000 + Math.random() * 900000)),
        returnOtp: String(Math.floor(100000 + Math.random() * 900000)),
        status: "Pickup Pending",
      };
      setRentals((prev) => [localCreated, ...prev]);
      flash(`Booking confirmed! Your Pickup OTP is ${localCreated.pickupOtp}. Share this with ${bookingData.sellerName} at handover.`);
    }
    setActiveModal(null);
    setRentTarget(null);
  };

  // Handshake verification (Rapido model)
  const handleVerifyPickup = async (rentalId, otp, photos) => {
    try {
      const res = await fetch(`${API_BASE}/rentals/${rentalId}/verify-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, photos }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedRental = data.rental || data;
        setRentals((prev) => prev.map((r) => ((r._id || r.id) === rentalId ? updatedRental : r)));
        const msg = data.message || "✓ Pickup Verified! You can now safely hand over the equipment.";
        flash(msg);
        return { success: true, message: msg, rental: updatedRental };
      } else {
        return { success: false, error: data.error || "Incorrect Pickup OTP. Please check customer's code." };
      }
    } catch (e) {
      const rental = rentals.find((r) => (r._id || r.id) === rentalId);
      if (rental && rental.pickupOtp && String(rental.pickupOtp).trim() !== String(otp).trim()) {
        return { success: false, error: "Incorrect Pickup OTP. Please ask customer to read the 6 digits from their screen." };
      }
      const updatedRental = { ...rental, pickupVerified: true, pickupPhotos: photos, status: "Active" };
      setRentals((prev) =>
        prev.map((r) =>
          (r._id || r.id) === rentalId ? updatedRental : r
        )
      );
      const msg = `✓ Pickup Confirmed! You can now safely hand over "${rental?.productTitle || 'item'}" to customer.`;
      flash(msg);
      return { success: true, message: msg, rental: updatedRental };
    }
  };

  const handleVerifyReturn = async (rentalId, otp, photos) => {
    try {
      const res = await fetch(`${API_BASE}/rentals/${rentalId}/verify-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, photos }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedRental = data.rental || data;
        setRentals((prev) => prev.map((r) => ((r._id || r.id) === rentalId ? updatedRental : r)));
        const msg = data.message || "✓ Return Verified & Rental Completed!";
        flash(msg);
        return { success: true, message: msg, rental: updatedRental };
      } else {
        return { success: false, error: data.error || "Incorrect Return OTP. Please check owner's code." };
      }
    } catch (e) {
      const rental = rentals.find((r) => (r._id || r.id) === rentalId);
      if (rental && rental.returnOtp && String(rental.returnOtp).trim() !== String(otp).trim()) {
        return { success: false, error: "Incorrect Return OTP. Please ask owner to read the 6 digits from their screen." };
      }
      const updatedRental = { ...rental, returnVerified: true, depositRefunded: true, returnPhotos: photos, status: "Completed" };
      setRentals((prev) =>
        prev.map((r) =>
          (r._id || r.id) === rentalId ? updatedRental : r
        )
      );
      const msg = `✓ Return Confirmed! "${rental?.productTitle || 'item'}" returned and rental completed.`;
      flash(msg);
      return { success: true, message: msg, rental: updatedRental };
    }
  };

  const handleOpenChat = (rental) => {
    if (!currentUser) {
      flash("Please log in to open private rental chat.");
      setActiveModal("auth");
      return;
    }
    const curEmail = currentUser.email?.toLowerCase().trim();
    const curName = currentUser.name?.toLowerCase().trim();
    const curPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, "") : "";

    const rEmail = rental.renterEmail?.toLowerCase().trim();
    const rName = rental.renterName?.toLowerCase().trim();
    const rPhone = rental.renterPhone ? rental.renterPhone.replace(/\D/g, "") : "";

    const sEmail = rental.sellerEmail?.toLowerCase().trim();
    const sName = rental.sellerName?.toLowerCase().trim();
    const sPhone = rental.sellerPhone ? rental.sellerPhone.replace(/\D/g, "") : "";

    const isParty =
      (curEmail && (curEmail === rEmail || curEmail === sEmail)) ||
      (curName && (curName === rName || curName === sName)) ||
      (curPhone && (curPhone === rPhone || curPhone === sPhone));

    if (!isParty) {
      flash("🔒 Privacy Restricted: This chat & damage proof is strictly private between the owner and customer.");
      return;
    }
    setActiveChatRental(rental);
  };

  const handleSendMessage = async (rentalId, text, photos = []) => {
    if (!currentUser) return;
    try {
      const payload = {
        sender: currentUser.name || "User",
        senderEmail: currentUser.email || "",
        text,
        photos,
      };
      const res = await fetch(`${API_BASE}/rentals/${rentalId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedRental = await res.json();
        setRentals((prev) =>
          prev.map((r) => ((r._id || r.id) === (updatedRental._id || updatedRental.id) ? updatedRental : r))
        );
        setActiveChatRental(updatedRental);
      } else {
        // Fallback local update
        const newMsg = {
          sender: currentUser.name || "User",
          senderEmail: currentUser.email || "",
          text,
          photos,
          createdAt: new Date().toISOString(),
        };
        setRentals((prev) =>
          prev.map((r) => {
            if ((r._id || r.id) === rentalId) {
              const updated = {
                ...r,
                messages: [...(r.messages || []), newMsg],
              };
              if (activeChatRental && (activeChatRental._id || activeChatRental.id) === rentalId) {
                setActiveChatRental(updated);
              }
              return updated;
            }
            return r;
          })
        );
      }
    } catch (e) {
      console.warn("Using offline message state fallback:", e);
      const newMsg = {
        sender: currentUser.name || "User",
        senderEmail: currentUser.email || "",
        text,
        photos,
        createdAt: new Date().toISOString(),
      };
      setRentals((prev) =>
        prev.map((r) => {
          if ((r._id || r.id) === rentalId) {
            const updated = {
              ...r,
              messages: [...(r.messages || []), newMsg],
            };
            if (activeChatRental && (activeChatRental._id || activeChatRental.id) === rentalId) {
              setActiveChatRental(updated);
            }
            return updated;
          }
          return r;
        })
      );
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    let finalUser = null;
    try {
      const payload = {
        ...updatedData,
        email: currentUser?.email,
        _id: currentUser?._id,
      };
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        finalUser = await res.json();
      } else {
        finalUser = { ...currentUser, ...updatedData };
      }
    } catch (e) {
      finalUser = { ...currentUser, ...updatedData };
    }

    if (finalUser) {
      setCurrentUser(finalUser);
      try {
        localStorage.setItem("rently_v3_active_user", JSON.stringify(finalUser));
      } catch {}

      // Update any listed products by this seller
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (checkIsOwnProduct(p, finalUser) || p.sellerEmail === finalUser.email) {
            return {
              ...p,
              sellerName: finalUser.name,
              sellerPhone: finalUser.phone || p.sellerPhone,
              sellerAddress: finalUser.location || p.sellerAddress,
              location: finalUser.location || p.location,
            };
          }
          return p;
        });
        try {
          localStorage.setItem("rently_v3_products", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
    flash("Profile updated successfully!");
  };

  const results = useMemo(() => {
    let list = enrichedProducts.filter((p) =>
      p.title.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (radius) list = list.filter((p) => p.distanceKm <= radius);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [enrichedProducts, query, radius, sort]);

  return (
    <div
      className="min-h-screen w-full flex flex-col sm:flex-row"
      style={{
        background: PALETTE.cream,
        fontFamily:
          "'Work Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif",
        color: PALETTE.ink,
      }}
    >
      <GoogleFontLoader />

      {/* ---------------- SIDEBAR ---------------- */}
      <Sidebar
        onNav={handleNav}
        currentUser={currentUser}
        sellingCount={userSellingProducts.length}
        rentingCount={userRentedItems.length}
        pendingOrdersCount={pendingIncomingOrders.length}
      />

      {/* ---------------- MAIN ---------------- */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Header
          query={query}
          setQuery={setQuery}
          radius={radius}
          setRadius={setRadius}
          sort={sort}
          setSort={setSort}
          isSearching={isSearching}
          currentUser={currentUser}
          onSell={() => handleNav("sell")}
          onAuth={() => handleNav("auth")}
          onNav={handleNav}
          sellingCount={userSellingProducts.length}
          rentingCount={userRentedItems.length}
          pendingIncomingCount={pendingIncomingOrders.length}
          onOpenOrders={() => {
            setProfileActiveTab("orders");
            setActiveModal("activity_hub");
          }}
        />

        <div className="flex-1 min-h-0 px-6 md:px-10 pb-10">
          {/* Owner Incoming Rental Request Alert Banner */}
          {currentUser && pendingIncomingOrders.length > 0 && (
            <div className="mb-6 p-4 rounded-3xl bg-amber-50/95 border-2 border-amber-300 text-amber-950 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs font-bold text-lg">
                  🔔
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      Someone Wants to Rent Your Gear ({pendingIncomingOrders.length} New Request{pendingIncomingOrders.length > 1 ? "s" : ""})
                    </h4>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Handover Pending
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                    Customer <strong>{pendingIncomingOrders[0].renterName}</strong> wants to rent your <strong>"{pendingIncomingOrders[0].productTitle}"</strong> for {pendingIncomingOrders[0].days || 1} day(s) · Rental Price: <strong>₹{pendingIncomingOrders[0].totalPrice}</strong> {pendingIncomingOrders[0].advanceDeposit > 0 ? `· Surety Deposit to collect: ₹${pendingIncomingOrders[0].advanceDeposit}` : ""}.
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium mt-1">
                    🔒 <em>Secret Pickup OTP is on the customer's phone screen. When you meet for handover, ask them for the 6 digits and verify it in Rently.</em>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                <a
                  href={`tel:${pendingIncomingOrders[0].renterPhone}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs"
                >
                  <Phone size={12} /> Call Customer
                </a>
                <button
                  onClick={() => handleOpenChat(pendingIncomingOrders[0])}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-pink-900 border border-pink-300 hover:bg-pink-50 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Open private chat and baseline damage inspection proof"
                >
                  <MessageSquare size={12} color={PALETTE.rose} /> Chat & Proof
                </button>
                <button
                  onClick={() => {
                    setProfileActiveTab("orders");
                    setActiveModal("activity_hub");
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                  style={{ background: PALETTE.rose }}
                >
                  <Key size={13} /> View Order & Handover →
                </button>
              </div>
            </div>
          )}

          {/* Banner */}
          <div
            className="mb-6 rounded-2xl p-4 flex items-center justify-between text-xs gap-3 border shadow-2xs"
            style={{
              background: PALETTE.blush,
              borderColor: PALETTE.mauve,
              color: PALETTE.ink,
            }}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} color={PALETTE.rose} className="shrink-0" />
              <div className="leading-relaxed">
                <strong>Intermediate Platform (Zero Website Transactions):</strong> Rently is an intermediary technology portal and is not responsible for any products. Rental charges & seller-decided Pre-Advance Surety Deposits are paid directly between owner and customer (Cash/UPI).
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <button
                onClick={() => handleNav("about")}
                className="underline font-semibold hover:opacity-80 cursor-pointer"
                style={{ color: PALETTE.rose }}
              >
                About & Policy
              </button>
              <span className="text-slate-400">•</span>
              <button
                onClick={() => handleNav("agreement")}
                className="underline font-semibold hover:opacity-80 cursor-pointer"
                style={{ color: PALETTE.rose }}
              >
                Intermediary Agreement
              </button>
            </div>
          </div>

          {isSearching ? (
            <SearchResults
              results={results}
              currentUser={currentUser}
              onView={handleViewProduct}
              onRent={(p) => handleNav("rent", p)}
              onManageListing={() => {
                setProfileActiveTab("selling");
                setActiveModal("activity_hub");
              }}
            />
          ) : (
            <Feed
              items={enrichedProducts}
              feedView={feedView}
              setFeedView={setFeedView}
              currentUser={currentUser}
              userSellingProducts={userSellingProducts}
              userRentedItems={userRentedItems}
              onOpenSell={() => handleNav("sell")}
              onView={handleViewProduct}
              onRent={(p) => handleNav("rent", p)}
              onManageListing={() => {
                setProfileActiveTab("selling");
                setActiveModal("activity_hub");
              }}
            />
          )}
        </div>

        {/* Footer with Intermediary Links & Customer Support Email */}
        <footer className="px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Rently © 2026 Peer-to-Peer Sharing. All rights reserved.
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center text-xs">
            <button
              onClick={() => handleNav("about")}
              className="hover:underline text-slate-600 cursor-pointer"
            >
              About & Policy
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => handleNav("agreement")}
              className="hover:underline text-slate-600 cursor-pointer"
            >
              Intermediary Agreement
            </button>
            <span className="text-slate-300">•</span>
            <a
              href="mailto:rently2007@gmail.com"
              className="hover:underline font-semibold flex items-center gap-1 text-pink-700"
              title="Email Customer Support"
            >
              Support: rently2007@gmail.com
            </a>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => handleNav("admin_hidden")}
              className="hover:underline text-slate-400 text-[11px] cursor-pointer"
            >
              Internal Audit
            </button>
          </div>
        </footer>
      </main>

      {/* ---------------- MODALS ---------------- */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          currentUser={currentUser}
          onClose={() => setActiveProduct(null)}
          onManageListing={() => {
            setProfileActiveTab("selling");
            setActiveModal("activity_hub");
          }}
          onRent={(p) => {
            setActiveProduct(null);
            handleNav("rent", p);
          }}
        />
      )}

      {activeModal === "sell" && (
        <SellModal
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddProduct}
        />
      )}

      {activeModal === "rent" && rentTarget && (
        <RentModal
          product={rentTarget}
          onClose={() => {
            setActiveModal(null);
            setRentTarget(null);
          }}
          onConfirm={handleCreateRental}
        />
      )}

      {activeModal === "auth" && (
        <AuthModal
          onClose={() => setActiveModal(null)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            try {
              localStorage.setItem("rently_v3_active_user", JSON.stringify(user));
            } catch {}
            setActiveModal(null);
            setFeedView("all");
            fetchProducts();
            fetchRentals();
            flash(`Welcome back, ${user.name}!`);
          }}
        />
      )}

      {activeModal === "activity_hub" && currentUser && (
        <ThingsSellRentModal
          products={products}
          rentals={rentals}
          userSellingProducts={userSellingProducts}
          userRentedItems={userRentedItems}
          userReceivedOrders={userReceivedOrders}
          activeTab={profileActiveTab}
          setActiveTab={setProfileActiveTab}
          onOpenSell={() => setActiveModal("sell")}
          onDeleteProduct={handleDeleteProduct}
          onViewProduct={handleViewProduct}
          onClose={() => setActiveModal(null)}
          onOpenHandshake={(rental, type, role) => {
            setHandshakeRental(rental);
            setHandshakeType(type);
            setHandshakeRole(role || (type === "pickup" ? "seller_pickup" : "renter_return"));
            setActiveModal("handshake");
          }}
          onOpenChat={handleOpenChat}
        />
      )}

      {activeModal === "profile" && currentUser && (
        <MyAccountModal
          userProfile={currentUser}
          sellingCount={userSellingProducts.length}
          rentingCount={userRentedItems.length}
          ordersCount={userReceivedOrders.length}
          onClose={() => setActiveModal(null)}
          onUpdateProfile={handleUpdateProfile}
          onLogout={() => {
            setCurrentUser(null);
            try {
              localStorage.removeItem("rently_v3_active_user");
            } catch {}
            setActiveModal(null);
            setFeedView("all");
            fetchProducts();
            fetchRentals();
            flash("Logged out successfully.");
          }}
        />
      )}

      {activeModal === "handshake" && handshakeRental && (
        <HandshakeModal
          rental={handshakeRental}
          type={handshakeType}
          role={handshakeRole}
          onClose={() => {
            setActiveModal(null);
            setHandshakeRental(null);
          }}
          onVerifyPickup={handleVerifyPickup}
          onVerifyReturn={handleVerifyReturn}
          onOpenChat={handleOpenChat}
        />
      )}

      {activeChatRental && (
        <RentalChatModal
          rental={activeChatRental}
          currentUser={currentUser}
          onClose={() => setActiveChatRental(null)}
          onSendMessage={handleSendMessage}
        />
      )}

      {activeModal === "recent" && (
        <RecentlyViewedModal
          items={recentlyViewed}
          onClose={() => setActiveModal(null)}
          onView={(p) => {
            setActiveModal(null);
            handleViewProduct(p);
          }}
          onRent={(p) => {
            setActiveModal(null);
            handleNav("rent", p);
          }}
        />
      )}

      {activeModal === "about" && (
        <AboutModal
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
          onOpenAgreement={() => setActiveModal("agreement")}
        />
      )}

      {activeModal === "agreement" && (
        <AgreementModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "admin_hidden" && (
        <AdminPortalModal
          rentals={rentals}
          products={products}
          onClose={() => setActiveModal(null)}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}

/* ------------------------------ Star Rating UI Component ------------------------------ */

function StarRating({ rating = 4.8, reviewCount = 12 }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            fill={star <= Math.round(rating) ? "#F59E0B" : "none"}
            color={star <= Math.round(rating) ? "#F59E0B" : "#CBD5E1"}
          />
        ))}
      </div>
      <span className="font-semibold text-slate-800 ml-0.5">{rating.toFixed(1)}</span>
      <span className="text-slate-500">({reviewCount})</span>
    </div>
  );
}

/* ------------------------------ Sidebar ------------------------------ */

function Sidebar({ onNav, currentUser, sellingCount = 0, rentingCount = 0, pendingOrdersCount = 0 }) {
  const totalItemsCount = (sellingCount || 0) + (rentingCount || 0);
  const navItems = [
    {
      key: "my_items",
      label: "Things I Sell & Rent",
      icon: Package,
      badge: currentUser
        ? pendingOrdersCount > 0
          ? `🔔 ${pendingOrdersCount} request${pendingOrdersCount > 1 ? "s" : ""}`
          : totalItemsCount
        : null,
      isPendingAlert: pendingOrdersCount > 0,
    },
    { key: "recent", label: "Recently viewed", icon: Clock },
    { key: "about", label: "About & How it works", icon: Info },
  ];

  return (
    <aside
      className="hidden sm:flex flex-col w-[230px] shrink-0 px-5 pt-8 pb-6 border-r"
      style={{
        background: PALETTE.blush,
        borderColor: PALETTE.mauve,
      }}
    >
      <button
        onClick={() => onNav(currentUser ? "profile" : "auth")}
        className="group flex items-center gap-3 mb-8 text-left cursor-pointer w-full p-2 -ml-2 rounded-2xl transition hover:bg-white/40"
        title={currentUser ? "View My Account" : "Click to log in"}
      >
        <span
          className="flex items-center justify-center rounded-full w-11 h-11 shrink-0 overflow-hidden transition-transform group-hover:scale-105 border-2 border-white/80 shadow-xs"
          style={{
            background: PALETTE.rose,
            boxShadow: `0 2px 8px ${PALETTE.rose}40`,
          }}
        >
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} color="#fff" strokeWidth={2} />
          )}
        </span>
        <span className="min-w-0">
          <span
            className="block text-[15px] leading-tight font-semibold truncate"
            style={{ color: PALETTE.ink }}
          >
            {currentUser?.name || "Sign In / Register"}
          </span>
          <span className="block text-xs font-medium" style={{ color: PALETTE.inkSoft }}>
            {currentUser ? "My Account" : "Click to log in"}
          </span>
        </span>
      </button>

      <div
        className="h-px w-full mb-4"
        style={{ background: PALETTE.mauve }}
      />

      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ key, label, icon: Icon, badge, isPendingAlert }) => (
          <button
            key={key}
            onClick={() => onNav(key)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer ${
              isPendingAlert ? "bg-amber-100/70 border border-amber-300 font-semibold" : ""
            }`}
            style={{ color: PALETTE.ink }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = PALETTE.petal)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = isPendingAlert ? "rgba(254, 243, 199, 0.7)" : "transparent")
            }
          >
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <Icon size={16} color={isPendingAlert ? "#D97706" : PALETTE.rose} strokeWidth={2} className="shrink-0" />
              <span className="truncate">{label}</span>
            </div>
            {badge !== null && badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 ml-1.5 shadow-2xs ${
                  isPendingAlert ? "bg-amber-600 animate-pulse" : ""
                }`}
                style={isPendingAlert ? {} : { background: PALETTE.rose }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div
          className="rounded-2xl p-4 text-xs leading-relaxed"
          style={{ background: PALETTE.petal, color: PALETTE.ink }}
        >
          <span className="block font-semibold mb-1">Intermediary Guarantee</span>
          Direct contact & dual OTP handshake. Rently is an intermediary platform with zero product liability.
          <div className="mt-2.5 pt-2 border-t border-pink-300/60 flex flex-col gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => onNav("agreement")}
              className="text-left underline font-medium hover:text-pink-900 cursor-pointer"
            >
              📄 Intermediary Agreement
            </button>
            <a
              href="mailto:rently2007@gmail.com"
              className="underline font-medium hover:text-pink-900"
            >
              📧 rently2007@gmail.com
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------ Header ------------------------------ */

function Header({
  query,
  setQuery,
  radius,
  setRadius,
  sort,
  setSort,
  isSearching,
  currentUser,
  onSell,
  onAuth,
  onNav,
  sellingCount = 0,
  rentingCount = 0,
  pendingIncomingCount = 0,
  onOpenOrders,
}) {
  return (
    <header
      className="px-6 md:px-10 pt-8 pb-6 border-b"
      style={{ borderColor: PALETTE.mauve }}
    >
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {currentUser ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/70">
                👋 Hello, {currentUser.name}
              </span>
              {pendingIncomingCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenOrders}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition cursor-pointer shadow-2xs animate-pulse"
                  title="You have new incoming rental booking requests on your items"
                >
                  🔔 {pendingIncomingCount} New Request{pendingIncomingCount > 1 ? "s" : ""}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onAuth}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition"
              style={{ background: PALETTE.petal, color: PALETTE.ink }}
            >
              <LogIn size={14} color={PALETTE.rose} /> Log In / Sign Up
            </button>
          )}
        </div>

        <h1
          className="text-center flex-1 select-none cursor-pointer"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.6rem",
            letterSpacing: "0.02em",
            color: PALETTE.ink,
          }}
          onClick={() => setQuery("")}
        >
          Rent<span style={{ fontStyle: "italic", color: PALETTE.rose }}>ly</span>
        </h1>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onSell}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.rose}, #c08386)`,
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Sell an item
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div
          className="flex items-center gap-3 rounded-full px-5 py-3"
          style={{
            background: PALETTE.blush,
            border: `1.5px solid ${PALETTE.mauve}`,
          }}
        >
          <Search size={18} color={PALETTE.rose} strokeWidth={2.2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products to borrow or rent..."
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-60"
            style={{ color: PALETTE.ink }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} color={PALETTE.inkSoft} />
            </button>
          )}
        </div>

        {isSearching && (
          <FilterBar
            radius={radius}
            setRadius={setRadius}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>
    </header>
  );
}

function FilterBar({ radius, setRadius, sort, setSort }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="flex items-center gap-1 text-xs font-medium mr-1"
          style={{ color: PALETTE.inkSoft }}
        >
          <MapPin size={13} /> Distance
        </span>
        {DISTANCES.map((d) => (
          <Chip
            key={d}
            active={radius === d}
            onClick={() => setRadius(radius === d ? null : d)}
          >
            {d} km
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="flex items-center gap-1 text-xs font-medium mr-1"
          style={{ color: PALETTE.inkSoft }}
        >
          <ArrowUpDown size={13} /> Price
        </span>
        <Chip active={sort === "low"} onClick={() => setSort(sort === "low" ? null : "low")}>
          Low to high
        </Chip>
        <Chip active={sort === "high"} onClick={() => setSort(sort === "high" ? null : "high")}>
          High to low
        </Chip>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
      style={{
        background: active ? PALETTE.rose : PALETTE.petal,
        color: active ? "#fff" : PALETTE.ink,
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Feed & Product Cards ------------------------------ */

function checkIsOwnProduct(product, currentUser) {
  if (!product || !currentUser) return false;
  const curId = currentUser._id || currentUser.id;
  const curEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : "";
  const curName = currentUser.name ? currentUser.name.toLowerCase().trim() : "";

  const pSellerId = product.sellerId;
  const pEmail = product.sellerEmail ? product.sellerEmail.toLowerCase().trim() : "";
  const pName = product.sellerName ? product.sellerName.toLowerCase().trim() : "";

  // 1. Strict ID match
  if (pSellerId && curId && String(pSellerId).trim() === String(curId).trim()) {
    return true;
  }

  // 2. Strict Email match (if both accounts have emails set)
  if (pEmail && curEmail && pEmail === curEmail) {
    return true;
  }

  // 3. Fallback: match by exact name ONLY IF neither product nor user has an email
  if (!pEmail && !curEmail && pName && curName && pName === curName) {
    return true;
  }

  return false;
}

function SearchResults({ results, onView, onRent, currentUser, onManageListing }) {
  return (
    <section className="pt-6">
      <p className="text-sm mb-4" style={{ color: PALETTE.inkSoft }}>
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>
      {results.length === 0 ? (
        <EmptyState text="No products match your search. Try clearing filters!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((p) => (
            <ResultCard
              key={p.id || p._id}
              product={p}
              onView={onView}
              onRent={onRent}
              currentUser={currentUser}
              onManageListing={onManageListing}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResultCard({ product, onView, onRent, currentUser, onManageListing }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col border"
      style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
    >
      <img
        src={product.images && product.images[0] ? product.images[0] : "https://picsum.photos/700/500"}
        alt={product.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
            style={{ background: PALETTE.petal, color: PALETTE.ink }}
          >
            {product.tag}
          </span>
          <StarRating rating={product.rating || 4.8} reviewCount={product.reviewCount || 12} />
        </div>

        <h3 className="text-[15px] font-semibold leading-snug" style={{ color: PALETTE.ink }}>
          {product.title}
        </h3>
        <p className="text-xs flex items-center gap-1" style={{ color: PALETTE.inkSoft }}>
          <MapPin size={12} /> {product.location} · {product.distanceKm} km away
        </p>
        <p className="text-xs font-semibold" style={{ color: PALETTE.ink }}>
          Seller: {product.sellerName || (checkIsOwnProduct(product, currentUser) ? currentUser?.name : "Owner")} {checkIsOwnProduct(product, currentUser) ? "⭐ (You)" : ""}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-1">
          <p className="text-sm font-bold" style={{ color: PALETTE.rose }}>
            ₹{product.price} / {product.priceUnit}
          </p>
          {product.advanceDeposit ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200 shadow-2xs" title="Refundable security deposit decided by seller, paid hand-to-hand">
              Advance: ₹{product.advanceDeposit}
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <ActionButtons
            product={product}
            onView={onView}
            onRent={onRent}
            compact
            currentUser={currentUser}
            onManageListing={onManageListing}
          />
        </div>
      </div>
    </div>
  );
}

function Feed({
  items,
  feedView = "all",
  setFeedView,
  currentUser,
  userSellingProducts = [],
  userRentedItems = [],
  onOpenSell,
  onView,
  onRent,
  onManageListing,
}) {
  const scrollerRef = useRef(null);
  const scrollBy = (dy) => scrollerRef.current?.scrollBy({ top: dy, behavior: "smooth" });

  const displayedItems = feedView === "selling" ? userSellingProducts : items;

  return (
    <section className="pt-4 flex flex-col min-h-0 flex-1">
      {/* Category / Feed Mode Tabs */}
      {currentUser && (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b overflow-x-auto" style={{ borderColor: PALETTE.mauve }}>
          <button
            type="button"
            onClick={() => setFeedView("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              feedView === "all" ? "text-white shadow-xs" : "bg-white/70 text-slate-700 hover:bg-white"
            }`}
            style={feedView === "all" ? { background: PALETTE.rose } : {}}
          >
            All Market Gear ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFeedView("selling")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              feedView === "selling" ? "text-white shadow-xs" : "bg-white/70 text-slate-700 hover:bg-white"
            }`}
            style={feedView === "selling" ? { background: PALETTE.rose } : {}}
          >
            <Tag size={13} /> Things I Sell / Rent Out ({userSellingProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setFeedView("renting")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              feedView === "renting" ? "text-white shadow-xs" : "bg-white/70 text-slate-700 hover:bg-white"
            }`}
            style={feedView === "renting" ? { background: PALETTE.rose } : {}}
          >
            <Package size={13} /> Things I Borrow / Rent ({userRentedItems.length})
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            {feedView === "selling"
              ? "Your Listed Gear for Rent & Sale"
              : feedView === "renting"
              ? "Gear You Borrowed / Rented"
              : "Nearby Equipment Feed"}
          </h2>
          {feedView === "selling" && (
            <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
              Items you have listed on Rently. Other users can book these from you.
            </p>
          )}
          {feedView === "renting" && (
            <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
              Items you have booked or borrowed from nearby owners.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {feedView === "selling" && (
            <button
              type="button"
              onClick={onOpenSell}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition"
              style={{ background: PALETTE.rose }}
            >
              + List New Item
            </button>
          )}
          <div className="hidden sm:flex flex-col gap-2">
            <RoundIconButton onClick={() => scrollBy(-320)}>
              <ChevronUp size={16} />
            </RoundIconButton>
            <RoundIconButton onClick={() => scrollBy(320)}>
              <ChevronDown size={16} />
            </RoundIconButton>
          </div>
        </div>
      </div>

      {feedView === "renting" ? (
        <div
          ref={scrollerRef}
          className="flex flex-col gap-4 overflow-y-auto pr-1 -mr-1"
          style={{ scrollbarWidth: "thin", maxHeight: "calc(100vh - 340px)" }}
        >
          {userRentedItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/70 border border-slate-200 text-center flex flex-col items-center gap-3">
              <Package size={36} color={PALETTE.rose} />
              <h3 className="text-base font-semibold" style={{ color: PALETTE.ink }}>
                No active rentals found
              </h3>
              <p className="text-xs max-w-md" style={{ color: PALETTE.inkSoft }}>
                You haven't borrowed or rented any equipment yet. Explore our marketplace to borrow cameras, camping gear, and power tools from neighbors!
              </p>
              <button
                type="button"
                onClick={() => setFeedView("all")}
                className="mt-2 px-4 py-2 rounded-full text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition"
                style={{ background: PALETTE.rose }}
              >
                Browse Available Gear →
              </button>
            </div>
          ) : (
            userRentedItems.map((r) => (
              <div
                key={r._id || r.id}
                className="p-4 rounded-2xl bg-white/80 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: PALETTE.petal }}
                  >
                    <Package size={22} color={PALETTE.rose} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                      {r.productTitle}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Seller: <strong>{r.sellerName}</strong> ({r.sellerPhone})
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rental Price: <strong>₹{r.totalPrice}</strong> · Booked: {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold block mb-1 ${
                        r.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "Active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status || "Pickup Pending"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">
                      Pickup OTP: <strong>{r.pickupOtp}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="flex flex-col gap-5 overflow-y-auto pr-1 -mr-1 snap-y snap-mandatory"
          style={{ scrollbarWidth: "thin", maxHeight: "calc(100vh - 340px)" }}
        >
          {displayedItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/70 border border-slate-200 text-center flex flex-col items-center gap-3">
              <Tag size={36} color={PALETTE.rose} />
              <h3 className="text-base font-semibold" style={{ color: PALETTE.ink }}>
                {feedView === "selling"
                  ? "You haven't listed any items for rent or sale yet"
                  : "No equipment listed in the marketplace yet"}
              </h3>
              <p className="text-xs max-w-md" style={{ color: PALETTE.inkSoft }}>
                {feedView === "selling"
                  ? "List cameras, bikes, tools, camping equipment, or party gear to start earning today!"
                  : "Be the first to list equipment or gear for neighbors in your area to rent!"}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={onOpenSell}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer hover:opacity-95 shadow-md transition"
                  style={{ background: PALETTE.rose }}
                >
                  + List an Item Now
                </button>
              </div>
            </div>
          ) : (
            displayedItems.map((p) => (
              <FeedCard
                key={p.id || p._id}
                product={p}
                onView={onView}
                onRent={onRent}
                currentUser={currentUser}
                onManageListing={onManageListing}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function FeedCard({ product, onView, onRent, currentUser, onManageListing }) {
  return (
    <div
      className="snap-start shrink-0 w-full rounded-2xl overflow-hidden flex border"
      style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
    >
      <img
        src={product.images && product.images[0] ? product.images[0] : "https://picsum.photos/700/500"}
        alt={product.title}
        className="w-44 sm:w-56 h-auto object-cover shrink-0"
      />
      <div className="p-4 flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
            style={{ background: PALETTE.petal, color: PALETTE.ink }}
          >
            <Tag size={9} className="inline -mt-0.5 mr-1" />
            {product.tag}
          </span>
          <StarRating rating={product.rating || 4.8} reviewCount={product.reviewCount || 16} />
        </div>

        <h3
          className="text-[14.5px] font-semibold leading-snug truncate"
          style={{ color: PALETTE.ink }}
          title={product.title}
        >
          {product.title}
        </h3>
        <p className="text-xs line-clamp-2" style={{ color: PALETTE.inkSoft }}>
          {product.description}
        </p>
        <p className="text-xs flex items-center gap-1" style={{ color: PALETTE.inkSoft }}>
          <MapPin size={12} /> {product.distanceKm} km · {product.location}
        </p>
        <p className="text-xs font-semibold" style={{ color: PALETTE.ink }}>
          Seller: {product.sellerName || (checkIsOwnProduct(product, currentUser) ? currentUser?.name : "Owner")} {checkIsOwnProduct(product, currentUser) ? "⭐ (You)" : ""}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-1">
          <p className="text-sm font-bold" style={{ color: PALETTE.rose }}>
            ₹{product.price} / {product.priceUnit}
          </p>
          {product.advanceDeposit ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200 shadow-2xs" title="Refundable security deposit decided by seller, paid hand-to-hand">
              Surety Adv: ₹{product.advanceDeposit}
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex gap-2 pt-1">
          <ActionButtons
            product={product}
            onView={onView}
            onRent={onRent}
            compact
            currentUser={currentUser}
            onManageListing={onManageListing}
          />
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ product, onView, onRent, compact, currentUser, onManageListing }) {
  const isOwn = checkIsOwnProduct(product, currentUser);
  const pad = compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <>
      {isOwn ? (
        <button
          type="button"
          onClick={() => {
            if (onManageListing) onManageListing();
          }}
          className={`rounded-full font-bold bg-pink-100 text-pink-900 border border-pink-300 hover:bg-pink-200 transition cursor-pointer shadow-2xs ${pad}`}
          title="You listed this item. Click to view incoming booking requests or manage in Activity Hub."
        >
          ⭐ Your Item (Owner)
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRent(product)}
          className={`rounded-full font-semibold text-white cursor-pointer hover:opacity-90 transition ${pad}`}
          style={{ background: PALETTE.rose }}
        >
          Rent
        </button>
      )}
      <button
        type="button"
        onClick={() => onView(product)}
        className={`rounded-full font-semibold cursor-pointer hover:bg-black/5 transition ${pad}`}
        style={{
          background: "transparent",
          color: PALETTE.ink,
          border: `1.4px solid ${PALETTE.rose}`,
        }}
      >
        View details
      </button>
    </>
  );
}

function RoundIconButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center"
      style={{ background: PALETTE.petal, color: PALETTE.ink }}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Reusable Password Input with Show/Hide ------------------------------ */

function PasswordInputField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = true,
  autoComplete,
  error,
  extraLabelRight,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block font-semibold">
          {label}
        </label>
        {extraLabelRight}
      </div>
      <div className="relative flex items-center">
        <input
          id={id}
          required={required}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full rounded-xl pl-3.5 pr-11 py-2 text-sm bg-white/80 border ${
            error ? "border-rose-400" : "border-transparent focus:border-rose-300"
          } outline-none transition shadow-2xs`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          title={showPassword ? "Hide password" : "Show password"}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2.5 p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 focus:outline-none transition cursor-pointer flex items-center justify-center"
        >
          {showPassword ? (
            <EyeOff size={16} color={PALETTE.inkSoft} />
          ) : (
            <Eye size={16} color={PALETTE.inkSoft} />
          )}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Intermediary Platform Agreement & Policy Modal ------------------------------ */

function AgreementModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-200/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Legal Terms & User Agreement
            </span>
            <h2
              className="text-2xl font-semibold mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
            >
              Rently Intermediary Agreement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 cursor-pointer hover:opacity-80 transition"
            style={{ background: PALETTE.petal }}
            title="Close"
          >
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-800">
          {/* Section 1: Intermediary Technology Platform */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5 text-amber-900">
              <ShieldCheck size={16} className="text-amber-700 shrink-0" />
              1. Exclusive Intermediary Technology Platform Status
            </h4>
            <p>
              <strong>Rently</strong> operates strictly and exclusively as an <strong>online technology intermediary platform</strong> facilitating peer-to-peer communication between independent equipment owners ("Sellers/Owners") and potential renters ("Customers/Borrowers").
            </p>
            <p className="mt-1.5">
              Rently <strong>does not own, inspect, manufacture, store, pack, deliver, possess, test, or guarantee</strong> any of the items, tools, electronics, or equipment listed on this website.
            </p>
          </div>

          {/* Section 2: Zero Liability for Products */}
          <div className="p-4 rounded-2xl bg-white/85 border border-slate-200">
            <h4 className="font-bold text-sm mb-1.5 text-slate-900 flex items-center gap-1.5">
              <FileText size={15} color={PALETTE.rose} />
              2. Absolute Disclaimer of Liability for Products & Goods
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700">
              <li>
                <strong>No Responsibility for Product Quality:</strong> Rently is <strong>NOT responsible or liable</strong> for the authenticity, fitness, safety, condition, working state, roadworthiness, or legality of any product rented or borrowed through the website.
              </li>
              <li>
                <strong>Damages & Malfunctions:</strong> Any breakdown, physical damage, malfunction, or wear-and-tear occurring before, during, or after the rental period is entirely the responsibility of the owner and renter. Rently disclaims all liability for equipment failure.
              </li>
              <li>
                <strong>Personal Injury & Accidents:</strong> Rently shall not be held liable for any bodily harm, personal injury, health hazard, accident, fire, property damage, or monetary loss arising out of the handling or operation of any product.
              </li>
              <li>
                <strong>Loss & Theft:</strong> Rently is not responsible for missing accessories, stolen items, delayed returns, or unreturned products.
              </li>
            </ul>
          </div>

          {/* Section 3: Direct Transactions & Pre-Advance Deposits */}
          <div className="p-4 rounded-2xl bg-white/85 border border-slate-200">
            <h4 className="font-bold text-sm mb-1.5 text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={15} color={PALETTE.rose} />
              3. Direct Peer-to-Peer Transactions (Zero Financial Liability)
            </h4>
            <p className="text-slate-700">
              Rently does not operate as a payment gateway, escrow holder, or merchant. <strong>No financial transactions happen on our website.</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-1.5 text-slate-700">
              <li>
                <strong>Rental Fees:</strong> Paid directly by the renter to the owner during equipment pickup (in Cash or via direct UPI).
              </li>
              <li>
                <strong>Pre-Advance Surety Deposit:</strong> The deposit amount is decided solely by the owner as a security measure against damage. It must be paid directly to the owner and is to be refunded directly by the owner to the customer upon undamaged return.
              </li>
              <li>
                <strong>Disputes:</strong> Rently will not intervene, hold funds, or mediate monetary claims between users. All transactions are at the sole risk and discretion of the participating parties.
              </li>
            </ul>
          </div>

          {/* Section 4: Mandatory Physical Inspection */}
          <div className="p-4 rounded-2xl bg-white/85 border border-slate-200">
            <h4 className="font-bold text-sm mb-1.5 text-slate-900 flex items-center gap-1.5">
              <Camera size={15} color={PALETTE.rose} />
              4. Mandatory Physical Inspection & Handshake Protocol
            </h4>
            <p className="text-slate-700">
              To safeguard both parties, all users agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700">
              <li>Conduct a thorough on-the-spot physical inspection of the equipment at the time of pickup.</li>
              <li>Upload Pre-Rental Inspection condition photos into the Rently Handshake verification tool.</li>
              <li>Verify handover and return using the dual 6-digit OTP codes.</li>
              <li>Upload Post-Rental condition photos at the time of return.</li>
            </ul>
          </div>

          {/* Section 5: Customer Support Contact */}
          <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-0.5 flex items-center gap-1.5">
                <Mail size={15} color={PALETTE.rose} />
                5. Customer Support & Grievance Contact
              </h4>
              <p className="text-slate-600">
                For customer support, queries, reporting fraudulent listings, or platform assistance, please reach out directly to:
              </p>
              <p className="mt-1 font-semibold text-sm" style={{ color: PALETTE.ink }}>
                📧 <a href="mailto:rently2007@gmail.com" className="underline hover:opacity-80">rently2007@gmail.com</a>
              </p>
            </div>
            <a
              href="mailto:rently2007@gmail.com"
              className="px-4 py-2 rounded-full text-xs font-semibold text-white shrink-0 hover:opacity-90 shadow-xs flex items-center gap-1.5"
              style={{ background: PALETTE.rose }}
            >
              <Mail size={13} /> Email Support
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-pink-200/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-md cursor-pointer hover:opacity-90 transition"
            style={{ background: PALETTE.rose }}
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ User Auth Modal (Login / Sign Up / Forgot Password) ------------------------------ */

function AuthModal({ onClose, onLoginSuccess }) {
  // mode: "login" | "signup" | "forgot"
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const getLocalAccounts = () => {
    try {
      const stored = localStorage.getItem("rently_v3_registered_users");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalAccount = (userObj, password) => {
    try {
      const list = getLocalAccounts();
      const filtered = list.filter((u) => u.email.toLowerCase() !== userObj.email.toLowerCase());
      localStorage.setItem(
        "rently_v3_registered_users",
        JSON.stringify([...filtered, { ...userObj, password }])
      );
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const emailTrimmed = formData.email.trim().toLowerCase();

    // ---------------- FORGOT / RESET PASSWORD MODE ----------------
    if (authMode === "forgot") {
      if (!emailTrimmed) {
        setError("Please enter your registered email address.");
        return;
      }
      if (!formData.newPassword || formData.newPassword.length < 4) {
        setError("New password must be at least 4 characters long.");
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError("Passwords do not match. Please ensure both fields match.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/user/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailTrimmed,
            newPassword: formData.newPassword,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          // Update local accounts cache
          const localAccounts = getLocalAccounts();
          const updated = localAccounts.map((u) =>
            u.email.toLowerCase() === emailTrimmed ? { ...u, password: formData.newPassword } : u
          );
          localStorage.setItem("rently_v3_registered_users", JSON.stringify(updated));

          setSuccessMsg("Password reset successfully! You can now log in with your new password.");
          setFormData((prev) => ({
            ...prev,
            password: prev.newPassword,
            newPassword: "",
            confirmNewPassword: "",
          }));
          return;
        }

        // Check offline fallback if account exists locally
        const localAccounts = getLocalAccounts();
        const found = localAccounts.find((u) => u.email.toLowerCase() === emailTrimmed);
        if (found) {
          found.password = formData.newPassword;
          localStorage.setItem("rently_v3_registered_users", JSON.stringify(localAccounts));
          setSuccessMsg("Password reset successfully! You can now log in with your new password.");
          setFormData((prev) => ({
            ...prev,
            password: prev.newPassword,
            newPassword: "",
            confirmNewPassword: "",
          }));
          return;
        }

        setError(data.error || "No account found with this email address. Please check your email or create an account.");
      } catch (err) {
        // Offline / network failure handling
        const localAccounts = getLocalAccounts();
        const found = localAccounts.find((u) => u.email.toLowerCase() === emailTrimmed);
        if (found) {
          found.password = formData.newPassword;
          localStorage.setItem("rently_v3_registered_users", JSON.stringify(localAccounts));
          setSuccessMsg("Password reset successfully! You can now log in.");
          setFormData((prev) => ({
            ...prev,
            password: prev.newPassword,
            newPassword: "",
            confirmNewPassword: "",
          }));
          return;
        }

        setError("Unable to reach authentication server. Please check your connection or try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ---------------- SIGN UP MODE ----------------
    if (authMode === "signup") {
      if (!formData.name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (formData.password.length < 4) {
        setError("Password should be at least 4 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match. Please re-enter.");
        return;
      }
      if (!agreedToTerms) {
        setError("You must review and agree to the Intermediary Platform Agreement & Zero Liability Terms to create an account.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/user/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: emailTrimmed,
            phone: formData.phone.trim() || "+91 98765 43210",
            location: formData.location || "Anna Nagar, Chennai",
            password: formData.password,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          saveLocalAccount(data, formData.password);
          onLoginSuccess(data);
          return;
        } else {
          setError(data.error || "Registration failed. Please try a different email.");
        }
      } catch (err) {
        // Fallback for offline mode
        const localList = getLocalAccounts();
        if (localList.some((u) => u.email.toLowerCase() === emailTrimmed)) {
          setError("An account with this email already exists locally. Please log in.");
        } else {
          const newLocalUser = {
            _id: "u_" + Date.now(),
            name: formData.name.trim(),
            email: emailTrimmed,
            phone: formData.phone.trim() || "+91 98765 43210",
            location: formData.location || "Anna Nagar, Chennai",
            avatar: `https://picsum.photos/seed/${encodeURIComponent(emailTrimmed)}/200/200`,
            bio: "Rently member ready to rent and share gear.",
          };
          saveLocalAccount(newLocalUser, formData.password);
          onLoginSuccess(newLocalUser);
          return;
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // ---------------- LOGIN MODE ----------------
    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        saveLocalAccount(data, formData.password);
        onLoginSuccess(data);
        return;
      }

      // If backend returned an error, check local store fallback
      const localAccounts = getLocalAccounts();
      const found = localAccounts.find((u) => u.email.toLowerCase() === emailTrimmed);
      if (found) {
        if (found.password === formData.password) {
          const { password, ...safeUser } = found;
          onLoginSuccess(safeUser);
          return;
        } else {
          setError("Incorrect password. Please try again or use Forgot Password.");
          return;
        }
      }

      setError(data.error || "Invalid email or password.");
    } catch (err) {
      // Network failure offline check
      const localAccounts = getLocalAccounts();
      const found = localAccounts.find((u) => u.email.toLowerCase() === emailTrimmed);
      if (found) {
        if (found.password === formData.password) {
          const { password, ...safeUser } = found;
          onLoginSuccess(safeUser);
          return;
        } else {
          setError("Incorrect password. Please try again or use Forgot Password.");
          return;
        }
      }
      setError("Network error. Could not connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-2xl font-semibold flex items-center gap-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            {authMode === "signup" && (
              <>
                <UserPlus size={22} color={PALETTE.rose} />
                Create New Account
              </>
            )}
            {authMode === "login" && (
              <>
                <LogIn size={22} color={PALETTE.rose} />
                User Login
              </>
            )}
            {authMode === "forgot" && (
              <>
                <Lock size={22} color={PALETTE.rose} />
                Reset Password
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 cursor-pointer hover:opacity-80 transition"
            style={{ background: PALETTE.petal }}
            title="Close"
          >
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        {/* Informational Subtext for Forgot Password Mode */}
        {authMode === "forgot" && (
          <p className="text-xs mb-4" style={{ color: PALETTE.inkSoft }}>
            Enter your registered email address along with your new password below to reset your account password.
          </p>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            {authMode === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setSuccessMsg(null);
                  setError(null);
                }}
                className="self-start px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition"
                style={{ background: PALETTE.rose }}
              >
                Log In Now →
              </button>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {/* Sign-up Only Fields */}
          {authMode === "signup" && (
            <div>
              <label htmlFor="signup-name" className="block font-semibold mb-1">
                Full Name *
              </label>
              <input
                id="signup-name"
                required
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-white/80 border border-transparent focus:border-rose-300 outline-none shadow-2xs"
              />
            </div>
          )}

          {/* Email Field (Used by all modes) */}
          <div>
            <label htmlFor="auth-email" className="block font-semibold mb-1">
              {authMode === "forgot" ? "Registered Email Address *" : "Email Address *"}
            </label>
            <input
              id="auth-email"
              required
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2 text-sm bg-white/80 border border-transparent focus:border-rose-300 outline-none shadow-2xs"
            />
          </div>

          {/* More Sign-up Only Fields */}
          {authMode === "signup" && (
            <>
              <div>
                <label htmlFor="signup-phone" className="block font-semibold mb-1">
                  Phone Number *
                </label>
                <input
                  id="signup-phone"
                  required
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-sm bg-white/80 border border-transparent focus:border-rose-300 outline-none shadow-2xs"
                />
              </div>

              <div>
                <label htmlFor="signup-location" className="block font-semibold mb-1">
                  Neighborhood / City
                </label>
                <input
                  id="signup-location"
                  type="text"
                  placeholder="e.g. Anna Nagar, Chennai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-sm bg-white/80 border border-transparent focus:border-rose-300 outline-none shadow-2xs"
                />
              </div>
            </>
          )}

          {/* Password Field for Login Mode (with Forgot Password quick link & show/hide) */}
          {authMode === "login" && (
            <PasswordInputField
              id="login-password"
              label="Password *"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="current-password"
              extraLabelRight={
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-semibold cursor-pointer hover:underline transition"
                  style={{ color: PALETTE.inkSoft }}
                >
                  Forgot password?
                </button>
              }
            />
          )}

          {/* Password & Confirm Password for Sign-Up Mode (with show/hide) */}
          {authMode === "signup" && (
            <>
              <PasswordInputField
                id="signup-password"
                label="Password *"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="new-password"
              />
              <PasswordInputField
                id="signup-confirm-password"
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
            </>
          )}

          {/* New Password & Confirm New Password for Forgot Password Mode (with show/hide) */}
          {authMode === "forgot" && (
            <>
              <PasswordInputField
                id="forgot-new-password"
                label="New Password *"
                placeholder="Enter at least 4 characters"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                autoComplete="new-password"
              />
              <PasswordInputField
                id="forgot-confirm-password"
                label="Confirm New Password *"
                placeholder="Re-enter new password"
                value={formData.confirmNewPassword}
                onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                autoComplete="new-password"
              />
            </>
          )}

          {/* Intermediary Agreement & Terms Checklist for Sign-Up */}
          {authMode === "signup" && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col gap-2 mt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (error) setError(null);
                  }}
                  className="mt-1 w-4 h-4 rounded text-pink-600 focus:ring-pink-400 cursor-pointer shrink-0"
                />
                <div className="text-xs text-amber-950 leading-snug">
                  <span className="font-semibold block text-amber-900">
                    I agree to the Rently Intermediary Platform Terms & Conditions *
                  </span>
                  <span className="text-[11px] text-amber-900/90 block mt-1">
                    I acknowledge that <strong>Rently is exclusively an intermediary technology portal</strong> and is <strong>not responsible or liable</strong> for any listed products, conditions, damages, accidents, or theft. All rental fees and refundable surety deposits are transacted directly between owner and customer (Cash/UPI).
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/80 text-[11px] flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(true)}
                  className="underline font-bold text-pink-700 hover:text-pink-900 cursor-pointer flex items-center gap-1"
                >
                  <FileText size={12} /> Read Full Intermediary Agreement
                </button>
                <a
                  href="mailto:rently2007@gmail.com"
                  className="text-slate-600 hover:underline flex items-center gap-1"
                  title="Customer Support & Queries"
                >
                  <Mail size={11} /> Support: rently2007@gmail.com
                </a>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-full text-sm font-semibold text-white shadow-md cursor-pointer hover:opacity-95 transition disabled:opacity-50"
            style={{ background: PALETTE.rose }}
          >
            {loading ? (
              "Please wait..."
            ) : authMode === "signup" ? (
              "Register Account"
            ) : authMode === "forgot" ? (
              "Reset Password"
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div className="mt-5 flex flex-col items-center gap-2 text-xs">
          {authMode === "login" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="underline font-semibold cursor-pointer hover:opacity-80 transition"
                style={{ color: PALETTE.ink }}
              >
                New user? Create an account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("forgot");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs hover:underline cursor-pointer transition"
                style={{ color: PALETTE.inkSoft }}
              >
                Forgot your password? Click here to reset
              </button>
            </>
          )}

          {authMode === "signup" && (
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className="underline font-semibold cursor-pointer hover:opacity-80 transition"
              style={{ color: PALETTE.ink }}
            >
              Already have an account? Log in
            </button>
          )}

          {authMode === "forgot" && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="underline font-semibold cursor-pointer hover:opacity-80 transition"
                style={{ color: PALETTE.ink }}
              >
                ← Back to Log In
              </button>
              <span style={{ color: PALETTE.mauve }}>•</span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="underline font-semibold cursor-pointer hover:opacity-80 transition"
                style={{ color: PALETTE.ink }}
              >
                Create an account
              </button>
            </div>
          )}
        </div>
      </div>

      {showAgreementModal && (
        <AgreementModal onClose={() => setShowAgreementModal(false)} />
      )}
    </div>
  );
}

/* ------------------------------ Product Modal (Direct Seller Contact & Ratings) ------------------------------ */

function ProductModal({ product, onClose, onRent, currentUser, onManageListing }) {
  const [activeImg, setActiveImg] = useState(0);
  const cleanPhone = (product.sellerPhone || "+91 98401 23456").replace(/\D/g, "");
  const isOwn = checkIsOwnProduct(product, currentUser);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="relative">
          <img
            src={product.images && product.images[activeImg] ? product.images[activeImg] : "https://picsum.photos/700/500"}
            alt={product.title}
            className="w-full h-72 sm:h-96 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-white transition"
            style={{ background: "rgba(255,255,255,0.85)" }}
          >
            <X size={18} color={PALETTE.ink} />
          </button>
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 left-4 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImg(i)}
                  className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer"
                  style={{
                    border: `2px solid ${i === activeImg ? PALETTE.rose : "rgba(255,255,255,0.8)"}`,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1"
                style={{ background: PALETTE.petal, color: PALETTE.ink }}
              >
                {product.tag}
              </span>
              {isOwn && (
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-pink-100 text-pink-900 border border-pink-300">
                  ⭐ Your Listed Gear
                </span>
              )}
            </div>
            <StarRating rating={product.rating || 4.8} reviewCount={product.reviewCount || 24} />
          </div>

          <h2
            className="text-2xl mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            {product.title}
          </h2>
          <p className="text-sm flex items-center gap-1 mb-4" style={{ color: PALETTE.inkSoft }}>
            <MapPin size={13} /> {product.location} · {product.distanceKm} km away
          </p>
          <p className="text-base leading-relaxed mb-6" style={{ color: PALETTE.ink }}>
            {product.description}
          </p>

          {/* Seller Card */}
          <div className="rounded-2xl p-5 mb-6 bg-white/70 border border-pink-200">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PALETTE.rose }}>
              Direct Seller & Pickup Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <p className="text-slate-500">Seller Name</p>
                <p className="font-semibold text-sm">
                  {product.sellerName || (isOwn ? currentUser?.name : "Owner")} {isOwn ? "(You)" : ""}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-semibold text-sm">{product.sellerPhone || (isOwn ? currentUser?.phone : "+91 8754104594")}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500">Pickup Location</p>
                <p className="font-semibold">{product.sellerAddress || product.location}</p>
              </div>
            </div>

            {!isOwn && (
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <a
                  href={`tel:${product.sellerPhone || "+919840123456"}`}
                  className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "#25D366" }}
                >
                  <Phone size={14} /> Call Seller
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "#128C7E" }}
                >
                  <MessageSquare size={14} /> WhatsApp Seller
                </a>
              </div>
            )}
          </div>

          {/* Deposit & Pricing Information */}
          <div className="rounded-2xl p-4 border border-amber-200/80 bg-amber-50/70 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-amber-200/60">
              <div>
                <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-amber-700" /> Pre-Advance Surety Deposit:
                </span>
                <span className="text-base font-bold text-amber-950">
                  ₹{product.advanceDeposit || 0}
                </span>
                <span className="text-[10px] text-amber-800 ml-1.5 font-medium">(Decided by Seller · 100% Refundable)</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80">
                Zero Website Fees
              </span>
            </div>
            <p className="text-[10px] text-amber-900/90 pt-2 leading-relaxed">
              <strong>Intermediate Notice:</strong> No payment occurs on Rently. You pay the rental fee + refundable pre-advance directly to the seller at pickup (Cash/UPI). The seller refunds the advance directly to you at return if the item is undamaged.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl px-5 py-4 mt-4" style={{ background: PALETTE.petal }}>
            <div>
              <p className="text-xs" style={{ color: PALETTE.inkSoft }}>Rental price</p>
              <p className="text-xl font-semibold">
                ₹{product.price} <span className="text-sm font-normal">/ {product.priceUnit}</span>
              </p>
            </div>
            {isOwn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onManageListing) onManageListing();
                  }}
                  className="rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-90 transition"
                  style={{ background: PALETTE.rose }}
                >
                  Manage in Activity Hub →
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRent(product)}
                className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md cursor-pointer hover:opacity-90 transition"
                style={{ background: PALETTE.rose }}
              >
                Book Rental & Get OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Sell Modal (Native Device Image Upload) ------------------------------ */

function SellModal({ currentUser, onClose, onSubmit }) {
  const userLoc = currentUser?.location?.trim() || "";
  const [formData, setFormData] = useState({
    title: "",
    tag: "Electronics",
    price: "",
    priceUnit: "day",
    advanceDeposit: "",
    location: userLoc || "Navakkarai, Coimbatore",
    description: "",
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.description) return;

    const finalLocation =
      formData.location.trim() ||
      currentUser?.location?.trim() ||
      "Navakkarai, Coimbatore";

    onSubmit({
      ...formData,
      location: finalLocation,
      sellerAddress: finalLocation,
      price: Number(formData.price),
      advanceDeposit: Number(formData.advanceDeposit) || 0,
      images: uploadedPhotos.length > 0
        ? uploadedPhotos
        : ["https://picsum.photos/seed/item_" + Date.now() + "/700/500"],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            List an Item for Rent
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5" style={{ background: PALETTE.petal }}>
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Product Title *</label>
            <input
              required
              type="text"
              placeholder="e.g. Sony Alpha A7 III Camera"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2 text-sm bg-white/80 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Category *</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm bg-white/80 outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Sports">Sports</option>
                <option value="Tools">Tools</option>
                <option value="Furniture">Furniture</option>
                <option value="Outdoors">Outdoors</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Rental Price (₹) *</label>
              <div className="flex gap-1">
                <input
                  required
                  type="number"
                  placeholder="500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-sm bg-white/80 outline-none"
                />
                <select
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  className="rounded-xl px-2 py-2 text-xs bg-white/80 outline-none"
                >
                  <option value="day">/day</option>
                  <option value="week">/week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pre-Advance Surety Deposit (Decided by Seller) */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-xs text-amber-950 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-700" />
                Pre-Advance / Surety Deposit (₹)
              </label>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Decided by You
              </span>
            </div>
            <input
              type="number"
              min="0"
              placeholder="e.g. 1000 (Refundable upon undamaged return)"
              value={formData.advanceDeposit}
              onChange={(e) => setFormData({ ...formData, advanceDeposit: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2 text-xs bg-white outline-none border border-amber-200"
            />
            <p className="text-[10px] text-amber-850 mt-1.5 leading-relaxed">
              <strong>Intermediate Notice:</strong> No payment is processed on our website. The customer will pay this surety deposit directly to you (Cash/UPI) during pickup. You will refund it directly to the customer when the item is returned without damage.
            </p>
          </div>

          {/* Item Pickup Location / Address Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold flex items-center gap-1.5">
                <MapPin size={14} color={PALETTE.rose} /> Item Location / Pickup Area *
              </label>
              {currentUser?.location && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, location: currentUser.location }))}
                  className="text-[11px] text-pink-700 underline font-medium hover:text-pink-900 cursor-pointer"
                >
                  Use my profile address
                </button>
              )}
            </div>
            <input
              required
              type="text"
              placeholder="e.g. Navakkarai, Coimbatore or Peelamedu, Coimbatore"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2 text-sm bg-white/80 outline-none border border-pink-200 focus:border-pink-400 focus:bg-white transition"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {currentUser?.location
                ? `Defaults to your profile location (${currentUser.location}). You can edit this for this specific item.`
                : "Accurate area & city allows nearby customers to find your item with the distance filter."}
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-1">Description *</label>
            <textarea
              required
              rows={2}
              placeholder="Describe condition, accessories included..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl px-3 py-2 text-sm bg-white/80 outline-none"
            />
          </div>

          {/* User-Friendly File Upload for Product Photos */}
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-1">
              <Camera size={14} color={PALETTE.rose} /> Select Product Photos from Device *
            </label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer bg-white/60 hover:bg-white border-pink-300">
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <Upload size={20} color={PALETTE.rose} />
                <p className="text-xs font-semibold mt-1">Click to select photos from device</p>
                <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto p-2 bg-white/50 rounded-xl">
                {uploadedPhotos.map((img, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden h-16 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-white shadow-md"
            style={{ background: PALETTE.rose }}
          >
            Post Item Listing
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ Rent Booking Modal ------------------------------ */

function RentModal({ product, onClose, onConfirm }) {
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const rentalFee = (product.price || 0) * days;
  const advanceDeposit = Number(product.advanceDeposit) || 0;
  const totalHandoverDue = rentalFee + advanceDeposit;

  const handleConfirm = () => {
    onConfirm({
      productId: product._id || product.id,
      productTitle: product.title,
      sellerName: product.sellerName || "Equipment Owner",
      sellerEmail: product.sellerEmail || "",
      sellerPhone: product.sellerPhone || "+91 8754104594",
      sellerAddress: product.sellerAddress || product.location,
      startDate,
      days,
      totalPrice: rentalFee,
      advanceDeposit,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-6 border shadow-2xl"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            Confirm Booking
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 cursor-pointer hover:opacity-80" style={{ background: PALETTE.petal }}>
            <X size={16} color={PALETTE.ink} />
          </button>
        </div>

        <div className="flex gap-3 mb-4 p-3 rounded-2xl bg-white/60">
          <img
            src={product.images && product.images[0] ? product.images[0] : "https://picsum.photos/200/200"}
            alt={product.title}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold truncate">{product.title}</h4>
            <p className="text-xs text-slate-600">
              Seller: {product.sellerName || "Equipment Owner"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5 text-xs">
          <div>
            <label className="block font-semibold mb-1">Rental Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm bg-white/80 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Duration ({product.priceUnit}s)</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-8 h-8 rounded-full font-bold text-sm bg-white/80 cursor-pointer"
              >
                -
              </button>
              <span className="font-semibold text-base">{days} {product.priceUnit}{days > 1 ? "s" : ""}</span>
              <button
                onClick={() => setDays(days + 1)}
                className="w-8 h-8 rounded-full font-bold text-sm bg-white/80 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Detailed Price & Deposit Breakdown */}
          <div className="rounded-2xl p-4 flex flex-col gap-2.5 border border-pink-200/80 bg-white/70">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Rental Charges ({days} {product.priceUnit}{days > 1 ? "s" : ""})</span>
              <span className="font-semibold text-slate-800">₹{rentalFee}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1 text-amber-900 font-semibold">
                <ShieldCheck size={13} className="text-amber-700" />
                Pre-Advance Surety Deposit:
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-900">₹{advanceDeposit}</span>
                <span className="block text-[10px] text-emerald-700 font-medium">(100% Refundable)</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <p className="text-xs font-bold text-slate-900">Total Handover Amount</p>
                <p className="text-[10px] text-slate-500">Pay direct to owner at pickup (Cash/UPI)</p>
              </div>
              <p className="text-xl font-bold" style={{ color: PALETTE.rose }}>₹{totalHandoverDue}</p>
            </div>
          </div>

          {/* Intermediate Platform Notice */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold flex items-center gap-1 text-[11px] mb-0.5">
              <ShieldCheck size={13} className="text-amber-700" />
              Intermediate Platform Notice
            </p>
            <p className="text-[10px] text-amber-850">
              No money is collected on our website. Pay the rental amount + surety advance directly to the seller upon item inspection & OTP handshake. The seller will refund the <strong>₹{advanceDeposit} advance directly</strong> to you when you return the product without any damage.
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full rounded-full py-3 text-sm font-semibold text-white shadow-md cursor-pointer hover:opacity-90 transition"
          style={{ background: PALETTE.rose }}
        >
          Confirm Booking & Get Pickup OTP
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Handshake Verification Modal (Rapido Model) ------------------------------ */

function HandshakeModal({
  rental,
  type,
  role,
  onClose,
  onVerifyPickup,
  onVerifyReturn,
  onOpenChat,
}) {
  const [otpInput, setOtpInput] = useState("");
  const [photosList, setPhotosList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successFeedback, setSuccessFeedback] = useState(null);

  const effectiveRole = role || (type === "pickup" ? "seller_pickup" : "renter_return");

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotosList((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setPhotosList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVerify = async () => {
    if (!otpInput.trim()) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    const finalPhotos = photosList.length > 0
      ? photosList
      : ["https://picsum.photos/seed/proof_" + Date.now() + "/600/400"];

    try {
      let res;
      if (type === "pickup" || effectiveRole === "seller_pickup") {
        res = await onVerifyPickup(rental._id || rental.id, otpInput.trim(), finalPhotos);
      } else {
        // Return verification requires NO photo upload
        res = await onVerifyReturn(rental._id || rental.id, otpInput.trim());
      }

      if (res && res.success) {
        setSuccessFeedback({
          message: res.message,
          rental: res.rental || rental,
        });
      } else if (res && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg("Verification failed. Please check network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-200/60">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{ background: PALETTE.rose }}
            >
              <Key size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
                >
                  {effectiveRole === "seller_pickup"
                    ? "Verify Customer's Pickup OTP"
                    : "Verify Return OTP from Owner"}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                  Rapido-Style OTP
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {effectiveRole === "seller_pickup"
                  ? `Owner Handover: Verify customer ${rental.renterName}'s OTP`
                  : `Customer Return: Verify owner ${rental.sellerName}'s Return OTP`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 cursor-pointer hover:opacity-80 transition"
            style={{ background: PALETTE.petal }}
          >
            <X size={16} color={PALETTE.ink} />
          </button>
        </div>

        {/* Success Feedback Screen */}
        {successFeedback ? (
          <div className="flex flex-col items-center text-center p-6 bg-white/90 rounded-2xl border border-emerald-300 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-emerald-950">
                {effectiveRole === "seller_pickup"
                  ? "✓ Handover Confirmed & Verified!"
                  : "✓ Return Confirmed & Rental Completed!"}
              </h3>
              <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed font-medium">
                {successFeedback.message}
              </p>
            </div>

            <div className="w-full p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Product:</span>
                <span className="font-semibold text-slate-900">{rental.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  {effectiveRole === "seller_pickup" ? "Customer:" : "Owner:"}
                </span>
                <span className="font-semibold text-slate-900">
                  {effectiveRole === "seller_pickup" ? rental.renterName : rental.sellerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="font-bold text-emerald-700">
                  {effectiveRole === "seller_pickup" ? "Active (In-Use)" : "Completed"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat(successFeedback.rental || rental);
                }}
                className="flex-1 py-3 rounded-full text-xs font-bold border border-pink-300 bg-pink-50 text-pink-900 cursor-pointer hover:bg-pink-100 transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={13} color={PALETTE.rose} /> View Chat & Proof
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-95 transition"
                style={{ background: PALETTE.rose }}
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-800">
            {/* Context Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs">
              <p className="font-semibold flex items-center gap-1 text-amber-900 mb-1">
                <ShieldCheck size={14} className="text-amber-700" />
                {effectiveRole === "seller_pickup"
                  ? "Owner Pickup Verification Instructions:"
                  : "Customer Return Verification Instructions:"}
              </p>
              <p className="text-[11px] leading-relaxed">
                {effectiveRole === "seller_pickup" ? (
                  <>
                    Customer <strong>{rental.renterName}</strong> has the <strong>6-digit Pickup OTP</strong> displayed on their screen. Upload baseline condition photos below, enter the customer's OTP, and hand over <strong>"{rental.productTitle}"</strong>.
                  </>
                ) : (
                  <>
                    After physically returning <strong>"{rental.productTitle}"</strong> to owner <strong>{rental.sellerName}</strong> and settling any refundable surety deposit, ask the owner for their <strong>6-digit Return OTP</strong> and enter it below to complete the rental.
                  </>
                )}
              </p>
            </div>

            {/* Surety Deposit Reminder */}
            {rental.advanceDeposit > 0 && (
              <div className={`p-3 rounded-2xl border text-xs ${
                effectiveRole === "renter_return"
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : "bg-white/80 border-slate-200 text-slate-800"
              }`}>
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1 text-[11px]">
                    {effectiveRole === "renter_return" ? (
                      <CheckCircle2 size={13} className="text-emerald-700" />
                    ) : (
                      <ShieldCheck size={13} className="text-amber-700" />
                    )}
                    {effectiveRole === "renter_return"
                      ? "Pre-Advance Deposit Refund to Collect from Owner:"
                      : "Pre-Advance Surety to Collect from Customer:"}
                  </span>
                  <span className="text-sm font-bold">₹{rental.advanceDeposit}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {effectiveRole === "renter_return"
                    ? "If the item is undamaged, the owner refunds this ₹" + rental.advanceDeposit + " directly to you (Cash/UPI)."
                    : "Collect this refundable deposit directly from the customer. You must refund it upon undamaged return."}
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-start gap-2">
                <Info size={15} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* OTP Input Form */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: PALETTE.ink }}>
                {effectiveRole === "seller_pickup"
                  ? "Enter Customer's 6-Digit Pickup OTP *"
                  : "Enter Owner's 6-Digit Return OTP *"}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ""));
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full rounded-2xl px-4 py-3 text-center text-2xl tracking-widest font-mono font-bold bg-white border border-pink-200 focus:border-rose-400 outline-none shadow-xs text-slate-900"
              />
              <p className="text-[10px] text-slate-500 mt-1 text-center">
                {effectiveRole === "seller_pickup"
                  ? "Ask the customer to check the 'Things I Borrow / Rent' tab on their screen."
                  : "Ask the owner to check the 'Customer Orders' tab on their screen."}
              </p>
            </div>

            {/* 📸 PICKUP ONLY: Owner Uploads Condition Proof Photos */}
            {effectiveRole === "seller_pickup" ? (
              <div className="p-3.5 rounded-2xl bg-white/90 border border-pink-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold flex items-center gap-1.5 text-pink-950">
                    <Camera size={14} color={PALETTE.rose} />
                    Product Condition Photos (Owner Upload · Legal Proof) *
                  </label>
                  <span className="text-[10px] font-semibold text-pink-800 bg-pink-100 px-2 py-0.5 rounded-full">
                    Damage Evidence
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-600 mb-2 leading-tight">
                  Take clear photos of the product condition right now before handing over. These photos will be posted to your private chat with the receiver as mutual proof to check for damages upon return.
                </p>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-2xl cursor-pointer bg-pink-50/50 hover:bg-pink-50 border-pink-300 transition">
                  <div className="flex flex-col items-center justify-center">
                    <Upload size={16} color={PALETTE.rose} />
                    <p className="text-[11px] font-semibold mt-0.5 text-slate-700">Select photos from device</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {photosList.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                    {photosList.map((url, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden h-14 border border-slate-300">
                        <img src={url} alt="Proof" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* RETURN ONLY: No photo upload needed; Customer checks original pickup proof in chat */
              <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-blue-700" />
                    Damage Inspection (Check Original Pickup Proof)
                  </h4>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Zero Return Upload
                  </span>
                </div>
                <p className="text-[11px] text-blue-900/90 leading-relaxed mb-2">
                  No return image upload is required. The owner uploaded baseline condition photos during pickup, which are safely preserved in your private chat. Inspect the product together to ensure no new damages.
                </p>
                {onOpenChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat(rental);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-white text-blue-900 border border-blue-300 hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} className="text-blue-700" />
                    Open Private Chat & Inspect Condition Proof ({rental.pickupPhotos?.length || 0})
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleVerify}
              disabled={isSubmitting || !otpInput.trim()}
              className="w-full rounded-full py-3 text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-95 transition disabled:opacity-50"
              style={{ background: PALETTE.rose }}
            >
              {isSubmitting
                ? "Verifying with Backend..."
                : effectiveRole === "seller_pickup"
                ? "Verify Pickup OTP & Save Condition Proof"
                : "Verify Return OTP & Complete Rental"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Private Rental Chat & Damage Proof Modal ------------------------------ */

function RentalChatModal({ rental, currentUser, onClose, onSendMessage }) {
  const [inputText, setInputText] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedProofImg, setSelectedProofImg] = useState(null);
  const messagesEndRef = useRef(null);

  const curEmail = currentUser?.email?.toLowerCase().trim();
  const curName = currentUser?.name?.toLowerCase().trim();
  const rEmail = rental.renterEmail?.toLowerCase().trim();
  const sEmail = rental.sellerEmail?.toLowerCase().trim();

  const isOwner = (curEmail && curEmail === sEmail) || (!curEmail && currentUser?.name === rental.sellerName);
  const isRenter = (curEmail && curEmail === rEmail) || (!curEmail && currentUser?.name === rental.renterName);

  const otherPartyName = isOwner ? rental.renterName : rental.sellerName;
  const otherPartyRole = isOwner ? "Receiver / Customer" : "Owner / Seller";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [rental.messages]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedPhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && attachedPhotos.length === 0) return;
    setIsSending(true);
    await onSendMessage(rental._id || rental.id, inputText.trim(), attachedPhotos);
    setInputText("");
    setAttachedPhotos([]);
    setIsSending(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(74,51,53,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-[88vh] max-h-[750px] rounded-3xl flex flex-col border shadow-2xl overflow-hidden"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-3 bg-white/70" style={{ borderColor: PALETTE.mauve }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700 shrink-0 border border-pink-200 shadow-2xs font-bold text-base">
              💬
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold truncate" style={{ color: PALETTE.ink }}>
                  Chat: {rental.productTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Lock size={10} /> Private (2 People Only)
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5">
                Between <strong>{rental.sellerName}</strong> (Owner) & <strong>{rental.renterName}</strong> (Receiver)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 cursor-pointer hover:bg-slate-200/60 transition shrink-0"
            style={{ background: PALETTE.petal }}
            title="Close"
          >
            <X size={16} color={PALETTE.ink} />
          </button>
        </div>

        {/* Mutual Damage Inspection Proof Bar */}
        <div className="p-3 sm:p-4 bg-amber-50/95 border-b border-amber-200/80 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Camera size={15} className="text-amber-800 shrink-0" />
              <h4 className="text-xs font-bold text-amber-950">
                Mutual Damage Inspection Proof (Uploaded by Owner at Pickup)
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {rental.pickupPhotos?.length || 0} Photo{rental.pickupPhotos?.length === 1 ? "" : "s"}
            </span>
          </div>

          {rental.pickupPhotos && rental.pickupPhotos.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {rental.pickupPhotos.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedProofImg(url)}
                  className="relative group cursor-pointer shrink-0 rounded-xl overflow-hidden border border-amber-300 w-16 h-16 shadow-2xs hover:scale-105 transition"
                  title="Click to view full photo proof"
                >
                  <img src={url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                    <Eye size={14} />
                  </div>
                </div>
              ))}
              <div className="text-[11px] text-amber-900/90 pl-2 leading-tight">
                <span className="font-semibold block">Official Baseline Condition</span>
                <span>Compare returned product against these photos to ensure zero damage.</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-amber-900 leading-tight">
              📸 <em>Condition proof photos will be saved here when the owner verifies the customer's Pickup OTP at handover.</em>
            </p>
          )}
        </div>

        {/* Chat Feed */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3.5"
          style={{ background: "rgba(255,255,255,0.4)" }}
        >
          {(!rental.messages || rental.messages.length === 0) ? (
            <div className="text-center py-10 text-xs text-slate-500 flex flex-col items-center gap-2">
              <MessageSquare size={32} color={PALETTE.rose} />
              <p>No messages exchanged yet.</p>
              <p className="text-[11px]">Say hello or coordinate pickup / return time!</p>
            </div>
          ) : (
            rental.messages.map((msg, i) => {
              const isMe = curEmail
                ? msg.senderEmail?.toLowerCase().trim() === curEmail
                : msg.sender?.toLowerCase().includes(curName || "");

              if (msg.isProof) {
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-amber-100/90 border border-amber-300 text-xs text-amber-950 my-2 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-900">
                      <Camera size={14} />
                      <span>{msg.sender}</span>
                      <span className="text-[10px] font-normal text-amber-800 ml-auto">
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mb-2 font-medium">{msg.text}</p>
                    {msg.photos && msg.photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {msg.photos.map((p, pi) => (
                          <div
                            key={pi}
                            onClick={() => setSelectedProofImg(p)}
                            className="rounded-xl overflow-hidden h-24 border border-amber-300 cursor-pointer hover:opacity-90 transition shadow-2xs"
                          >
                            <img src={p} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (msg.senderEmail === "system@rently.com" || msg.sender?.toLowerCase().includes("system")) {
                return (
                  <div key={i} className="text-center my-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-200/80 text-[11px] text-slate-700 font-medium">
                      ℹ️ {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-slate-500 mb-1 px-1 font-medium">
                    {isMe ? "You" : msg.sender} · {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                      isMe
                        ? "text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                    }`}
                    style={isMe ? { background: PALETTE.rose } : {}}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {msg.photos && msg.photos.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {msg.photos.map((p, pi) => (
                          <div
                            key={pi}
                            onClick={() => setSelectedProofImg(p)}
                            className="rounded-lg overflow-hidden h-20 border border-white/40 cursor-pointer"
                          >
                            <img src={p} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white/90 border-t flex flex-col gap-2 shrink-0" style={{ borderColor: PALETTE.mauve }}>
          {attachedPhotos.length > 0 && (
            <div className="flex gap-2 p-1.5 overflow-x-auto bg-slate-100 rounded-xl">
              {attachedPhotos.map((url, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden w-14 h-14 border border-slate-300 shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 cursor-pointer transition shrink-0" title="Attach condition photo">
              <Camera size={18} color={PALETTE.rose} />
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </label>

            <input
              type="text"
              placeholder={`Message ${otherPartyName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-xs bg-slate-100 border border-transparent focus:border-rose-300 outline-none transition"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && attachedPhotos.length === 0)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition disabled:opacity-40 shrink-0"
              style={{ background: PALETTE.rose }}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox Modal for Full-Size Proof Image */}
      {selectedProofImg && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedProofImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedProofImg(null)}
              className="absolute -top-10 right-0 text-white text-sm font-bold bg-white/20 px-3 py-1 rounded-full cursor-pointer hover:bg-white/40"
            >
              ✕ Close Preview
            </button>
            <img
              src={selectedProofImg}
              alt="Condition Proof"
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border-2 border-white/20"
            />
            <p className="text-white/80 text-xs mt-3 bg-black/50 px-4 py-1.5 rounded-full font-medium">
              📸 Mutual Product Condition Proof · Recorded on Rently
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Things I Sell & Rent Activity Hub ------------------------------ */

function ThingsSellRentModal({
  userSellingProducts = [],
  userRentedItems = [],
  userReceivedOrders = [],
  activeTab = "selling",
  setActiveTab,
  onOpenSell,
  onDeleteProduct,
  onViewProduct,
  onClose,
  onOpenHandshake,
  onOpenChat,
}) {
  const [tab, setTab] = useState(activeTab || "selling");

  useEffect(() => {
    if (activeTab) setTab(activeTab);
  }, [activeTab]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-2xl font-semibold flex items-center gap-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
            >
              Things I Sell & Rent
            </h2>
            <p className="text-xs text-slate-600">
              Manage equipment you list, items you borrow, and incoming customer orders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 cursor-pointer hover:opacity-80 transition"
            style={{ background: PALETTE.petal }}
            title="Close"
          >
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/70 border border-slate-200 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setTab("selling");
              setActiveTab?.("selling");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              tab === "selling" ? "text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
            }`}
            style={tab === "selling" ? { background: PALETTE.rose } : {}}
          >
            <Tag size={13} />
            Things I Sell / Rent Out
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === "selling" ? "bg-white/30 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {userSellingProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("renting");
              setActiveTab?.("renting");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              tab === "renting" ? "text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
            }`}
            style={tab === "renting" ? { background: PALETTE.rose } : {}}
          >
            <Package size={13} />
            Things I Borrow / Rent
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === "renting" ? "bg-white/30 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {userRentedItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("orders");
              setActiveTab?.("orders");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              tab === "orders" ? "text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
            }`}
            style={tab === "orders" ? { background: PALETTE.rose } : {}}
          >
            <ShieldCheck size={13} />
            Orders on My Gear
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === "orders" ? "bg-white/30 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {userReceivedOrders.length}
            </span>
          </button>
        </div>

        {/* ==================== TAB 1: THINGS I SELL / RENT OUT ==================== */}
        {tab === "selling" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-pink-200/60">
              <div>
                <h3 className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                  Your Listed Equipment & Gear
                </h3>
                <p className="text-xs text-slate-600">
                  {userSellingProducts.length} item{userSellingProducts.length === 1 ? "" : "s"} listed for rent or sale by you.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenSell}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-90 transition flex items-center gap-1"
                  style={{ background: PALETTE.rose }}
                >
                  <Plus size={13} /> List New Item
                </button>
              </div>
            </div>

            {userSellingProducts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/70 border border-slate-200 text-center flex flex-col items-center gap-3">
                <ShoppingBag size={38} color={PALETTE.rose} />
                <h4 className="text-base font-semibold" style={{ color: PALETTE.ink }}>
                  You haven't listed any equipment yet
                </h4>
                <p className="text-xs max-w-md text-slate-600">
                  Have cameras, camping gear, tools, audio equipment, or bikes sitting idle? Put them to work and start earning rental income right in your neighborhood!
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onOpenSell}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition"
                    style={{ background: PALETTE.rose }}
                  >
                    + List an Item to Sell/Rent
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[58vh] overflow-y-auto pr-1">
                {userSellingProducts.map((p) => (
                  <div
                    key={p.id || p._id}
                    className="p-3.5 rounded-2xl bg-white/85 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images && p.images[0] ? p.images[0] : "https://picsum.photos/700/500"}
                        alt={p.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
                            style={{ background: PALETTE.petal, color: PALETTE.ink }}
                          >
                            {p.tag}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> {p.location}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold truncate" style={{ color: PALETTE.ink }} title={p.title}>
                          {p.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: PALETTE.rose }}>
                            ₹{p.price} / {p.priceUnit}
                          </span>
                          {p.advanceDeposit ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Surety Deposit: ₹{p.advanceDeposit}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">
                              No deposit required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onViewProduct(p)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <ExternalLink size={12} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p._id || p.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        title="Remove this listing"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: THINGS I BORROW / RENT (CUSTOMER / RENTER VIEW) ==================== */}
        {tab === "renting" && (
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-pink-200/60">
              <h3 className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                Items You Have Rented / Borrowed
              </h3>
              <p className="text-xs text-slate-600">
                Rapido-style OTP protocol: Show your Pickup OTP to the owner during pickup. At return, enter the Return OTP provided by the owner.
              </p>
            </div>

            {userRentedItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/70 border border-slate-200 text-center flex flex-col items-center gap-3">
                <Package size={38} color={PALETTE.rose} />
                <h4 className="text-base font-semibold" style={{ color: PALETTE.ink }}>
                  No active borrowed equipment
                </h4>
                <p className="text-xs max-w-md text-slate-600">
                  You haven't borrowed or rented any gear yet. Pick from a wide selection of cameras, outdoor tents, power tools, and sports gear nearby!
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition"
                  style={{ background: PALETTE.rose }}
                >
                  Browse Nearby Marketplace
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-h-[58vh] overflow-y-auto pr-1">
                {userRentedItems.map((r) => {
                  const isPickupPending = !r.pickupVerified;
                  const isActive = r.pickupVerified && !r.returnVerified;
                  const isCompleted = r.pickupVerified && r.returnVerified;

                  return (
                    <div
                      key={r._id || r.id}
                      className="p-4 rounded-2xl bg-white/85 border border-slate-200 flex flex-col gap-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                            {r.productTitle}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Owner: <strong>{r.sellerName}</strong> · Phone: <strong>{r.sellerPhone}</strong>
                          </p>
                          <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-1 flex-wrap">
                            <span>Rental Fee: <strong>₹{r.totalPrice}</strong> ({r.days || 1} day{r.days === 1 ? "" : "s"})</span>
                            {r.advanceDeposit > 0 && (
                              <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Surety Deposit: ₹{r.advanceDeposit} ({r.depositRefunded ? "✓ Refunded by Owner" : "Refundable upon zero damage"})
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isActive
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isCompleted ? "Completed" : isActive ? "Active (In-Use)" : "Pickup Pending"}
                        </span>
                      </div>

                      {/* 1. PICKUP PENDING: Rapido Model -> Pickup OTP generated ONLY FOR CUSTOMER */}
                      {isPickupPending && (
                        <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-pink-900 flex items-center gap-1.5 mb-1">
                              <Key size={14} className="text-pink-700" />
                              Your 6-Digit Pickup OTP (Rapido Style):
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-2xl font-black tracking-widest text-pink-700 bg-white px-3.5 py-1 rounded-xl border border-pink-300 shadow-2xs">
                                {r.pickupOtp}
                              </span>
                              <span className="text-[11px] text-pink-800 font-medium">
                                Share with owner ({r.sellerName}) at handover
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1.5">
                              📢 Tell this code to the owner when you meet for pickup. The owner enters this in Rently to confirm handover and give you the item.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 2. ACTIVE (IN USE): Customer enters Return OTP provided by Owner */}
                      {isActive && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1 mb-0.5">
                              <CheckCircle2 size={14} className="text-blue-700" />
                              Gear In Use · Ready for Return Handshake
                            </span>
                            <p className="text-[10px] text-slate-600">
                              When returning the item to <strong>{r.sellerName}</strong>, collect your refundable deposit of ₹{r.advanceDeposit}. Ask the owner for their 6-digit Return OTP and enter it below.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenHandshake(r, "return", "renter_return")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shrink-0 shadow-xs cursor-pointer transition flex items-center gap-1.5"
                          >
                            <Key size={13} /> Enter Owner's Return OTP
                          </button>
                        </div>
                      )}

                      {/* 3. COMPLETED */}
                      {isCompleted && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-emerald-600" />
                            Rental Completed & Returned
                          </span>
                          <span className="text-[11px] font-medium text-emerald-700">
                            Deposit refunded directly by owner
                          </span>
                        </div>
                      )}

                      {/* Action Row: Private Chat & Proof Access */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenChat) onOpenChat(r);
                          }}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-pink-900 border border-pink-300 hover:bg-pink-50 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="Open private chat and damage inspection photos between you and the owner"
                        >
                          <MessageSquare size={13} color={PALETTE.rose} />
                          💬 Private Chat & Condition Proof {r.pickupPhotos?.length > 0 ? `(${r.pickupPhotos.length} photos)` : ""}
                        </button>

                        <div className="text-[11px] text-slate-500">
                          Owner Phone: <a href={`tel:${r.sellerPhone}`} className="text-pink-700 font-semibold hover:underline">{r.sellerPhone}</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: CUSTOMER ORDERS ON MY GEAR (SELLER / OWNER VIEW) ==================== */}
        {tab === "orders" && (
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-pink-200/60">
              <h3 className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                Customer Bookings for Your Listed Gear
              </h3>
              <p className="text-xs text-slate-600">
                Rapido-style OTP protocol: Ask the customer for their Pickup OTP and verify it before handing over. At return, share your Return OTP with the customer.
              </p>
            </div>

            {userReceivedOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/70 border border-slate-200 text-center flex flex-col items-center gap-3">
                <ShieldCheck size={38} color={PALETTE.rose} />
                <h4 className="text-base font-semibold" style={{ color: PALETTE.ink }}>
                  No incoming customer bookings yet
                </h4>
                <p className="text-xs max-w-md text-slate-600">
                  Once a user places a rental booking on any gear you sell or rent out, their reservation will show up here for you to verify during handover.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-h-[58vh] overflow-y-auto pr-1">
                {userReceivedOrders.map((r) => {
                  const isPickupPending = !r.pickupVerified;
                  const isActive = r.pickupVerified && !r.returnVerified;
                  const isCompleted = r.pickupVerified && r.returnVerified;

                  return (
                    <div
                      key={r._id || r.id}
                      className="p-4 rounded-2xl bg-white/85 border border-slate-200 flex flex-col gap-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                            {r.productTitle}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Customer: <strong>{r.renterName}</strong> · Phone: <strong>{r.renterPhone}</strong>
                          </p>
                          <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-1 flex-wrap">
                            <span>Rental Income: <strong>₹{r.totalPrice}</strong></span>
                            {r.advanceDeposit > 0 && (
                              <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Advance Held: ₹{r.advanceDeposit} ({r.depositRefunded ? "✓ Refunded to Customer" : "Refund directly at return if undamaged"})
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isActive
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isCompleted ? "Completed" : isActive ? "Active (In-Use)" : "Pickup Pending"}
                        </span>
                      </div>

                      {/* 1. PICKUP PENDING: Seller does NOT have OTP -> asks customer and enters it */}
                      {isPickupPending && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                              <Key size={14} className="text-amber-800" />
                              Awaiting Customer Pickup Handshake (Rapido Style)
                            </span>
                            <p className="text-[10px] text-slate-600">
                              When customer <strong>{r.renterName}</strong> arrives to pick up the gear, ask for their 6-digit Pickup OTP. Take condition photos and verify OTP here before handing over.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenHandshake(r, "pickup", "seller_pickup")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-white shrink-0 shadow-xs cursor-pointer hover:opacity-95 transition flex items-center gap-1.5"
                            style={{ background: PALETTE.rose }}
                          >
                            <Key size={13} /> Verify Customer's Pickup OTP
                          </button>
                        </div>
                      )}

                      {/* 2. ACTIVE (IN USE): Return OTP generated ONLY FOR SELLER */}
                      {isActive && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                              <Key size={14} className="text-emerald-700" />
                              Your 6-Digit Return OTP (Share with Customer upon Return):
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-2xl font-black tracking-widest text-emerald-800 bg-white px-3.5 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                                {r.returnOtp}
                              </span>
                              <span className="text-[11px] text-emerald-800 font-medium">
                                Share with customer ({r.renterName}) after return inspection
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1.5">
                              📢 Inspect the returned product condition and refund the advance deposit of ₹{r.advanceDeposit}. Then tell this code to customer {r.renterName} so they can close the rental.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 3. COMPLETED */}
                      {isCompleted && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-emerald-600" />
                            Handover & Return Completed
                          </span>
                          <span className="text-[11px] font-medium text-emerald-700">
                            All verifications closed
                          </span>
                        </div>
                      )}

                      {/* Action Row: Private Chat & Proof Access */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenChat) onOpenChat(r);
                          }}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-pink-900 border border-pink-300 hover:bg-pink-50 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="Open private chat and damage inspection photos between you and the customer"
                        >
                          <MessageSquare size={13} color={PALETTE.rose} />
                          💬 Private Chat & Condition Proof {r.pickupPhotos?.length > 0 ? `(${r.pickupPhotos.length} photos)` : ""}
                        </button>

                        <div className="text-[11px] text-slate-500">
                          Customer Phone: <a href={`tel:${r.renterPhone}`} className="text-pink-700 font-semibold hover:underline">{r.renterPhone}</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ------------------------------ My Account Modal ------------------------------ */

function MyAccountModal({
  userProfile,
  sellingCount = 0,
  rentingCount = 0,
  ordersCount = 0,
  onClose,
  onLogout,
  onUpdateProfile,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    location: userProfile?.location || "Anna Nagar, Chennai",
    avatar: userProfile?.avatar || "https://picsum.photos/seed/useravatar/200/200",
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "Anna Nagar, Chennai",
        avatar: userProfile.avatar || "https://picsum.photos/seed/useravatar/200/200",
      });
    }
  }, [userProfile]);

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFormData((prev) => ({ ...prev, avatar: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-pink-200/60">
          <div>
            <h2
              className="text-2xl font-semibold flex items-center gap-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
            >
              <User size={22} color={PALETTE.rose} /> My Account
            </h2>
            <p className="text-xs text-slate-600">
              Manage your personal profile, contact information, and security.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 cursor-pointer hover:opacity-80 transition"
            style={{ background: PALETTE.petal }}
            title="Close"
          >
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={formData.avatar || userProfile?.avatar || "https://picsum.photos/seed/useravatar/200/200"}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{userProfile?.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 size={11} /> Verified Member
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {userProfile?.email} · {userProfile?.phone}
                </p>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                  <MapPin size={12} color={PALETTE.rose} /> {userProfile?.location || "Anna Nagar, Chennai"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-pink-300 text-pink-800 bg-white cursor-pointer hover:bg-pink-50 transition"
              >
                {isEditing ? "Cancel" : "✏️ Edit Profile"}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-rose-300 text-rose-700 bg-white cursor-pointer hover:bg-rose-50 transition"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="block text-base font-bold text-slate-800">{sellingCount}</span>
              <span className="text-[11px] text-slate-500">Items Listed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="block text-base font-bold text-slate-800">{rentingCount}</span>
              <span className="text-[11px] text-slate-500">Active Rentals</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="block text-base font-bold text-slate-800">{ordersCount}</span>
              <span className="text-[11px] text-slate-500">Customer Orders</span>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-5 pt-4 border-t border-slate-200 flex flex-col gap-3 text-xs">
              <h4 className="font-bold text-slate-800 text-xs">Update Profile & Contact Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-xs bg-white outline-none border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-xs bg-white outline-none border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-xs bg-white outline-none border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Location / Pickup Area *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-xs bg-white outline-none border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 flex items-center gap-1">
                  <Camera size={13} color={PALETTE.rose} /> Upload Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-800 hover:file:bg-pink-200 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-90 transition"
                  style={{ background: PALETTE.rose }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Internal Audit Modal ------------------------------ */

function AdminPortalModal({ rentals, products, onClose }) {
  const [selectedRental, setSelectedRental] = useState(rentals[0] || null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-2xl font-bold flex items-center gap-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
            >
              <ShieldCheck size={24} color={PALETTE.rose} /> Internal Audit & Damage Inspection Portal
            </h2>
            <p className="text-xs text-slate-600">
              Review pre-rental vs post-rental inspection photos side-by-side.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5" style={{ background: PALETTE.petal }}>
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        {selectedRental ? (
          <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 mb-6">
            <h3 className="text-base font-bold mb-3" style={{ color: PALETTE.ink }}>
              Audit: {selectedRental.productTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 mb-2">Pickup Photos (Pre-Rental Proof)</h4>
                {selectedRental.pickupPhotos && selectedRental.pickupPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRental.pickupPhotos.map((url, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden h-28 border border-amber-300">
                        <img src={url} alt="Pickup" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-amber-700">No pickup photos uploaded yet.</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 mb-2">Return Photos (Post-Rental Proof)</h4>
                {selectedRental.returnPhotos && selectedRental.returnPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRental.returnPhotos.map((url, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden h-28 border border-emerald-300">
                        <img src={url} alt="Return" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-emerald-700">No return photos uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {rentals.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelectedRental(r)}
              className={`p-3 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                selectedRental?._id === r._id ? "bg-white border-2 border-pink-300" : "bg-white/60 hover:bg-white"
              }`}
            >
              <div>
                <span className="font-bold block">{r.productTitle}</span>
                <span className="text-slate-500">Seller: {r.sellerName}</span>
              </div>
              <span className="font-bold text-emerald-700">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Recently Viewed & About Modals ------------------------------ */

function RecentlyViewedModal({ items, onClose, onView, onRent }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-semibold flex items-center gap-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            <Clock size={20} color={PALETTE.rose} /> Recently Viewed Items
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5" style={{ background: PALETTE.petal }}>
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState text="You haven't clicked or viewed any products in this session yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((p) => (
              <div
                key={p.id || p._id}
                className="p-3.5 rounded-2xl bg-white/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: PALETTE.ink }}>
                      {p.title}
                    </h4>
                    <p className="text-xs" style={{ color: PALETTE.rose }}>
                      ₹{p.price} / {p.priceUnit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onView(p)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ border: `1px solid ${PALETTE.rose}`, color: PALETTE.ink }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onRent(p)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: PALETTE.rose }}
                  >
                    Rent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AboutModal({ currentUser, onClose, onOpenAgreement }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(74,51,53,0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl"
        style={{ background: PALETTE.blush, borderColor: PALETTE.mauve }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-200/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Intermediary Marketplace Platform
            </span>
            <h2
              className="text-2xl font-semibold mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
            >
              About Rent<span style={{ fontStyle: "italic", color: PALETTE.rose }}>ly</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 cursor-pointer hover:opacity-80 transition"
            style={{ background: PALETTE.petal }}
            title="Close"
          >
            <X size={18} color={PALETTE.ink} />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-800">
          <p className="text-sm leading-relaxed" style={{ color: PALETTE.ink }}>
            <strong>Rently</strong> is a local peer-to-peer sharing technology platform that connects people who need gear with neighbors who own it. Borrow cameras, power tools, camping equipment, and party gear without high purchase costs.
          </p>

          {/* User Terms & Conditions Status Badge */}
          {currentUser ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 font-bold">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-xs text-emerald-900">
                    Terms & Conditions Acknowledged
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                    Agreement Verified
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Hi <strong>{currentUser.name}</strong>, you have agreed to Rently's Intermediary Terms & Conditions when creating your account. You will not be asked to acknowledge this again.
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  ✓ You agreed to all intermediary platform conditions and zero product liability clauses listed below.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-700 shrink-0" />
                <span>
                  <strong>One-Time Sign-Up Agreement:</strong> You will only be asked to acknowledge and agree to these terms once when creating your account.
                </span>
              </div>
            </div>
          )}

          {/* Core Intermediary Policy & Zero Liability */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-amber-900">
              <ShieldCheck size={16} className="text-amber-700 shrink-0" />
              1. Intermediary Technology Platform (Zero Product Liability)
            </h4>
            <p>
              Please note that <strong>Rently is solely an intermediary technology portal</strong>. Rently:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-amber-900">
              <li><strong>Does NOT own, inspect, store, or warranty</strong> any of the equipment or goods listed.</li>
              <li><strong>Is NOT responsible or liable</strong> for any product defects, malfunctions, damages, accidents, physical injury, or theft.</li>
              <li>All responsibility for evaluating item condition, safe operation, and return rests entirely between the seller/owner and the customer.</li>
            </ul>
          </div>

          {/* Zero Website Financial Transactions */}
          <div className="p-4 rounded-2xl bg-white/85 border border-slate-200">
            <h4 className="font-bold text-sm mb-1.5 text-slate-900 flex items-center gap-1.5">
              <FileText size={15} color={PALETTE.rose} />
              2. Direct Peer-to-Peer Transactions (No Website Escrow)
            </h4>
            <p className="text-slate-700">
              <strong>Zero payment transactions take place on Rently.</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-700">
              <li><strong>Rental Price:</strong> Handled hand-to-hand or via direct UPI between the renter and owner during pickup.</li>
              <li><strong>Pre-Advance Surety Deposit:</strong> The owner decides the refundable surety deposit amount for security. The renter pays this directly to the owner, and the owner refunds it directly upon undamaged return.</li>
            </ul>
          </div>

          {/* Handshake & Inspection Features */}
          <div className="p-4 rounded-2xl bg-white/85 border border-slate-200">
            <h4 className="font-bold text-sm mb-1.5 text-slate-900 flex items-center gap-1.5">
              <Camera size={15} color={PALETTE.rose} />
              3. Built-In Safety & Handshake Features
            </h4>
            <div className="space-y-1 text-slate-700">
              <p><strong>1. Direct Contact:</strong> View phone number, address, and WhatsApp contact to coordinate convenient pickup.</p>
              <p><strong>2. Handshake Dual OTP:</strong> Secure 6-digit OTP codes exchanged at physical pickup & return.</p>
              <p><strong>3. Photo Inspections:</strong> Pre-rental condition photos and post-rental return photos are uploaded to document state.</p>
            </div>
          </div>

          {/* Customer Support & Contact Box */}
          <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-0.5 flex items-center gap-1.5">
                <Mail size={15} color={PALETTE.rose} />
                4. Customer Support & Any Queries
              </h4>
              <p className="text-slate-600">
                Have questions, need assistance, or want to report an issue? Our customer support team is here to help:
              </p>
              <p className="mt-1 font-semibold text-sm" style={{ color: PALETTE.ink }}>
                📧 <a href="mailto:rently2007@gmail.com" className="underline hover:opacity-80">rently2007@gmail.com</a>
              </p>
            </div>
            <a
              href="mailto:rently2007@gmail.com"
              className="px-4 py-2 rounded-full text-xs font-semibold text-white shrink-0 hover:opacity-90 shadow-xs flex items-center gap-1.5"
              style={{ background: PALETTE.rose }}
            >
              <Mail size={13} /> Email Support
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-pink-200/80 flex items-center justify-between gap-3 flex-wrap">
          {onOpenAgreement && (
            <button
              onClick={() => {
                onClose();
                onOpenAgreement();
              }}
              className="text-xs font-bold text-pink-800 underline hover:text-pink-950 cursor-pointer flex items-center gap-1.5"
            >
              <FileText size={14} /> Read Full Intermediary Agreement
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-md cursor-pointer hover:opacity-90 transition"
            style={{ background: PALETTE.rose }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      className="rounded-2xl p-10 text-center text-sm border border-dashed"
      style={{ background: PALETTE.blush, color: PALETTE.inkSoft, borderColor: PALETTE.mauve }}
    >
      {text}
    </div>
  );
}

function Toast({ message }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-full px-6 py-3 text-sm font-medium text-white shadow-xl"
      style={{ background: PALETTE.ink }}
    >
      {message}
    </div>
  );
}

function GoogleFontLoader() {
  useEffect(() => {
    const id = "rentalhub-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Work+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}
