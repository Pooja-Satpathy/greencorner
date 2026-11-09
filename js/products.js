/* ==========================================================================
   GreenCorner – products.js
   GreenCorner's curated plant & gardening picks. GreenCorner does not sell
   products: each pick links to store search results (Nurserylive, Ugaoo,
   Amazon.in, Flipkart) so visitors can compare and buy directly.
   Photos are served from Unsplash (free Unsplash License).
   Also contains shared helpers (store links, image URLs, search, icons).
   ========================================================================== */
(function (window) {
  'use strict';

  const GC = (window.GC = window.GC || {});

  /** Public site URL – used for canonical links and structured data. */
  GC.SITE_URL = "https://pooja-satpathy.github.io/greencorner/";

  /** Build a resized Unsplash image URL (auto WebP/AVIF, cropped). */
  GC.imageUrl = function (photoId, width) {
    return 'https://images.unsplash.com/photo-' + photoId + '?auto=format&fit=crop&w=' + (width || 800) + '&q=75';
  };

  /**
   * Stores we link to. {q} is replaced with the URL-encoded search term.
   * GreenCorner is not affiliated with these stores and earns no commission.
   */
  GC.stores = [
    {
      id: "nurserylive",
      name: "Nurserylive",
      url: "https://nurserylive.com/search?q={q}",
      note: "Specialist online nursery"
    },
    {
      id: "ugaoo",
      name: "Ugaoo",
      url: "https://www.ugaoo.com/pages/search?q={q}",
      note: "Online plant & garden store"
    },
    {
      id: "amazon",
      name: "Amazon.in",
      url: "https://www.amazon.in/s?k={q}",
      note: "Marketplace"
    },
    {
      id: "flipkart",
      name: "Flipkart",
      url: "https://www.flipkart.com/search?q={q}",
      note: "Marketplace"
    }
  ];

  /** Build the "where to buy" links for a product, in the product's preferred store order. */
  GC.storeLinks = function (product) {
    return (product.stores || []).map(function (id) {
      const s = GC.stores.find(function (x) { return x.id === id; });
      return s ? { id: s.id, name: s.name, note: s.note, url: s.url.replace('{q}', encodeURIComponent(product.search || product.name)) } : null;
    }).filter(Boolean);
  };

  /** SVG icon paths (24×24, stroke = currentColor). */
  GC.icons = {
    leaf: "<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/>",
    search: "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>",
    bag: "<path d=\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\"/><path d=\"M3 6h18\"/><path d=\"M16 10a4 4 0 0 1-8 0\"/>",
    menu: "<path d=\"M4 7h16M4 12h16M4 17h16\"/>",
    close: "<path d=\"M18 6 6 18M6 6l12 12\"/>",
    arrow: "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
    truck: "<path d=\"M2 6h12v10H2z\"/><path d=\"M14 9h4l3 3v4h-7\"/><circle cx=\"6.5\" cy=\"17.5\" r=\"1.8\"/><circle cx=\"17.5\" cy=\"17.5\" r=\"1.8\"/>",
    sprout: "<path d=\"M7 20h10\"/><path d=\"M12 20v-8\"/><path d=\"M12 12c0-3.5-2.5-6-7-6 0 3.5 2.5 6 7 6Z\"/><path d=\"M12 12c0-3 2-5.5 6.5-5.5 0 3-2 5.5-6.5 5.5Z\"/>",
    shield: "<path d=\"M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z\"/><path d=\"m9 12 2 2 4-4\"/>",
    chat: "<path d=\"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z\"/><path d=\"M8.5 12h.01M12 12h.01M15.5 12h.01\"/>",
    package: "<path d=\"M21 8 12 3 3 8v8l9 5 9-5V8Z\"/><path d=\"m3 8 9 5 9-5\"/><path d=\"M12 13v8\"/>",
    sun: "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>",
    droplet: "<path d=\"M12 2.7s-6 6.5-6 11.3a6 6 0 0 0 12 0c0-4.8-6-11.3-6-11.3Z\"/>",
    check: "<path d=\"M20 6 9 17l-5-5\"/>",
    checkCircle: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8.5 12 2.5 2.5 4.5-5\"/>",
    plus: "<path d=\"M12 5v14M5 12h14\"/>",
    info: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5M12 8h.01\"/>",
    paw: "<circle cx=\"8\" cy=\"6.5\" r=\"1.7\"/><circle cx=\"16\" cy=\"6.5\" r=\"1.7\"/><circle cx=\"4.8\" cy=\"11.5\" r=\"1.7\"/><circle cx=\"19.2\" cy=\"11.5\" r=\"1.7\"/><path d=\"M12 11.5c-2.8 0-5 3-5 5.2 0 1.6 1.3 2.3 2.8 2.3 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.5 0 2.8-.7 2.8-2.3 0-2.2-2.2-5.2-5-5.2Z\"/>",
    ruler: "<path d=\"M3 17 17 3l4 4L7 21z\"/><path d=\"m7 13 2 2M10 10l2 2M13 7l2 2\"/>",
    calendar: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M16 3v4M8 3v4M3 10h18\"/>",
    bell: "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.9 1.9 0 0 0 3.4 0\"/>",
    trash: "<path d=\"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6\"/>",
    mail: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 7 9 6 9-6\"/>",
    phone: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z\"/>",
    pin: "<path d=\"M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z\"/><circle cx=\"12\" cy=\"9.5\" r=\"2.5\"/>",
    clock: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>",
    home: "<path d=\"m3 11 9-8 9 8\"/><path d=\"M5 10v10h14V10\"/><path d=\"M10 20v-5h4v5\"/>",
    tree: "<path d=\"M12 22v-5\"/><path d=\"M12 3 6 10h3l-4 6h14l-4-6h3Z\"/>",
    tag: "<path d=\"M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/>",
    quote: "<path fill=\"currentColor\" stroke=\"none\" d=\"M9.6 6C6.5 7.4 4.5 10 4.5 13.3c0 2.6 1.6 4.2 3.6 4.2 1.8 0 3.2-1.4 3.2-3.2s-1.3-3-3-3c-.3 0-.7 0-.9.1.3-1.6 1.7-3.2 3.4-4.1L9.6 6Zm9 0c-3.1 1.4-5.1 4-5.1 7.3 0 2.6 1.6 4.2 3.6 4.2 1.8 0 3.2-1.4 3.2-3.2s-1.3-3-3-3c-.3 0-.7 0-.9.1.3-1.6 1.7-3.2 3.4-4.1L18.6 6Z\"/>",
    heart: "<path d=\"M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z\"/>",
    scissors: "<circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12\"/>",
    cloudSun: "<path d=\"M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4\"/><path d=\"M15.9 13A4 4 0 1 0 8 11.5\"/><path d=\"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z\"/>",
    moon: "<path d=\"M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z\"/>",
    window: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1\"/><path d=\"M12 3v18M4 12h16\"/>",
    pot: "<path d=\"M6 12h12l-1.6 9H7.6Z\"/><path d=\"M12 12V7\"/><path d=\"M12 8.5C12 6 10.3 4.5 7.5 4.5c0 2.5 1.7 4 4.5 4Z\"/><path d=\"M12 7.5c0-2.2 1.6-3.5 4-3.5 0 2.2-1.6 3.5-4 3.5Z\"/>",
    sofa: "<path d=\"M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3\"/><path d=\"M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2Z\"/><path d=\"M5 18v2M19 18v2\"/>",
    expand: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3\"/>",
    feather: "<path d=\"M20.2 12.2A6 6 0 0 0 11.8 3.8L5 10.6V19h8.4Z\"/><path d=\"M16 8 2 22M17.5 15H9\"/>",
    gift: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5\"/>",
    book: "<path d=\"M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5Z\"/><path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/>",
    compass: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m15.5 8.5-2 5-5 2 2-5Z\"/>",
    download: "<path d=\"M12 3v12M7 10l5 5 5-5M5 21h14\"/>",
    external: "<path d=\"M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>",
    recycle: "<path d=\"M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7l1.2-2\"/><path d=\"M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.6-2.8\"/><path d=\"m14 16-3 3 3 3\"/><path d=\"M8.3 13.6 7.1 9.1l-4.5 1.2\"/><path d=\"m7.1 9.1 3.6-6.2a1.8 1.8 0 0 1 3.1 0l1.5 2.6\"/><path d=\"m13.4 5.7 4.5-1.2 1.2 4.5\"/>",
    users: "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6\"/><path d=\"M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.9.8 3 2.9 3 5.6\"/>",
    flower: "<circle cx=\"12\" cy=\"8\" r=\"2.5\"/><path d=\"M12 5.5a3 3 0 1 1 3 3M12 5.5a3 3 0 1 0-3 3M15 8.5a3 3 0 1 1-3 3M9 8.5a3 3 0 1 0 3 3\"/><path d=\"M12 11v10M12 17c-2.5 0-4-1.5-4-3.5 2.5 0 4 1.5 4 3.5ZM12 15c2.5 0 4-1.5 4-3.5-2.5 0-4 1.5-4 3.5Z\"/>"
  };

  /** Shop categories. */
  GC.categories = [
    {
      id: "indoor-plants",
      name: "Indoor Plants",
      blurb: "Easy-going greens for living rooms, bedrooms and work desks.",
      photoId: "1614594975525-e45190c55d0b"
    },
    {
      id: "outdoor-plants",
      name: "Outdoor Plants",
      blurb: "Sun-loving flowering plants and herbs for balconies and gardens.",
      photoId: "1622396727845-c15ef9ffb419"
    },
    {
      id: "succulents",
      name: "Succulents",
      blurb: "Sculptural, water-wise plants for sunny windowsills.",
      photoId: "1446071103084-c257b5f70672"
    },
    {
      id: "pots-planters",
      name: "Pots & Planters",
      blurb: "Terracotta, ceramic and hanging planters with drainage.",
      photoId: "1620293106076-ad27d651efe3"
    },
    {
      id: "seeds-soil",
      name: "Seeds & Soil",
      blurb: "Seeds, potting mixes, compost and organic plant food.",
      photoId: "1457530378978-8bac673b8062"
    },
    {
      id: "gardening-tools",
      name: "Gardening Tools",
      blurb: "Trowels, pruners, watering cans and everyday essentials.",
      photoId: "1783401726852-02ddd3a27724"
    }
  ];

  /** Plant care guides (used for internal links from product pages). */
  GC.guides = [
    {
      slug: "best-indoor-plants-for-beginners",
      title: "Best Indoor Plants for Beginners",
      excerpt: "Eight forgiving, low-maintenance houseplants that cope with Indian homes — and how to keep them happy.",
      photoId: "1604762524889-3e2fcc145683",
      read: 8
    },
    {
      slug: "money-plant-care-guide",
      title: "How to Care for a Money Plant",
      excerpt: "Light, watering, soil, pruning and propagation for India's favourite trailing plant.",
      photoId: "1586883573403-cb7ee339755b",
      read: 7
    },
    {
      slug: "how-often-to-water-indoor-plants",
      title: "How Often Should Indoor Plants Be Watered?",
      excerpt: "Why a fixed schedule fails, how to check soil moisture, and a starting-point watering chart.",
      photoId: "1673853233647-17ebc2d71b5f",
      read: 7
    },
    {
      slug: "best-plants-for-small-apartments",
      title: "Best Plants for Small Apartments",
      excerpt: "Compact, vertical and hanging plants that bring green into flats without eating floor space.",
      photoId: "1502672023488-70e25813eb80",
      read: 6
    },
    {
      slug: "common-gardening-mistakes",
      title: "10 Common Gardening Mistakes (and How to Fix Them)",
      excerpt: "From overwatering to pots without drainage — the slip-ups that trip up most new gardeners.",
      photoId: "1620862387428-80a54ba5c75c",
      read: 7
    },
    {
      slug: "balcony-garden-ideas",
      title: "How to Create a Balcony Garden",
      excerpt: "A step-by-step plan: sunlight, containers, soil, plant choices and a care routine that works.",
      photoId: "1616422271481-036413161a51",
      read: 9
    }
  ];

  /**
   * Curated picks (no prices – stores set their own).
   * search = term sent to each store's search; stores = which stores to suggest.
   * Plants include: sunlight, watering, care[], waterDays (Care Planner) and
   * finder {location, light, maintenance, space} used by the Plant Finder.
   * Non-plant products include specs[] instead.
   */
  GC.products = [
    {
      id: "snake-plant",
      name: "Snake Plant (Sansevieria)",
      category: "indoor-plants",
      photoId: "1599009944997-3544a939813c",
      alt: "Snake plant with tall upright striped leaves in a white ceramic pot",
      search: "snake plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Popular pick",
      featured: true,
      short: "Upright, architectural leaves that tolerate low light and occasional forgetfulness.",
      description: "The snake plant (Dracaena trifasciata, still widely sold as Sansevieria) is one of the most forgiving houseplants you can grow. Its stiff, upright leaves take up very little floor space, it copes with everything from a dim corner to bright indirect light, and it prefers to dry out between waterings.",
      size: "Commonly sold around 35–45 cm tall in a 6-inch nursery pot",
      sunlight: "Low to bright indirect light. Grows faster in brighter spots; avoid harsh afternoon sun.",
      watering: "Every 2–4 weeks. Water only when the soil is completely dry; water even less in winter.",
      care: [
        "Use a well-draining potting mix and a pot with a drainage hole.",
        "Overwatering is the most common cause of soft, mushy leaves — when in doubt, wait.",
        "Wipe dust off leaves occasionally so they can photosynthesise efficiently.",
        "Repot only when roots crowd the pot, usually every 2–3 years."
      ],
      pet: "Listed as toxic to cats and dogs by the ASPCA. Keep out of reach of pets.",
      waterDays: 18,
      finder: {
        location: ["indoor"],
        light: ["low", "medium", "bright"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-indoor-plants-for-beginners", "best-plants-for-small-apartments"],
      order: 0
    },
    {
      id: "money-plant",
      name: "Money Plant (Golden Pothos)",
      category: "indoor-plants",
      photoId: "1596724878582-76f1a8fdc24f",
      alt: "Golden pothos money plant with trailing heart-shaped leaves in a green pot",
      search: "money plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Popular pick",
      featured: true,
      short: "Fast-growing trailing vine for shelves, hanging baskets and moss poles.",
      description: "Golden pothos (Epipremnum aureum), known across India as the money plant, is a classic beginner plant. Its heart-shaped, green-and-gold leaves trail beautifully from shelves or climb a moss pole, and it grows happily in soil or even in a jar of water.",
      size: "Commonly sold around 25–35 cm trailing length in a 5-inch nursery pot",
      sunlight: "Bright indirect light is ideal. Tolerates medium and low light, but variegation may fade.",
      watering: "About once a week in summer, every 10–14 days in winter — when the top 2–3 cm of soil is dry.",
      care: [
        "Pinch or prune long vines to keep the plant bushy.",
        "Root cuttings in water: cut just below a node and change the water weekly.",
        "Yellow lower leaves usually mean too much water; let the soil dry a little more.",
        "Feed with a diluted liquid fertiliser every 4–6 weeks in spring and summer."
      ],
      pet: "Listed as toxic to cats and dogs by the ASPCA. Keep out of reach of pets.",
      waterDays: 7,
      finder: {
        location: ["indoor"],
        light: ["low", "medium", "bright"],
        maintenance: "low",
        space: "small"
      },
      guides: ["money-plant-care-guide", "best-indoor-plants-for-beginners"],
      order: 1
    },
    {
      id: "monstera-deliciosa",
      name: "Monstera Deliciosa",
      category: "indoor-plants",
      photoId: "1614594975525-e45190c55d0b",
      alt: "Monstera deliciosa with large split leaves in a white pot",
      search: "monstera plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Statement plant",
      featured: true,
      short: "Iconic split leaves that make a bold, tropical statement in bright rooms.",
      description: "Monstera deliciosa is the statement plant for bright living rooms. As it matures, its glossy leaves develop the famous splits and holes. Give it bright indirect light, room to grow and a moss pole to climb, and it will reward you with steady new growth.",
      size: "Commonly sold around 50–60 cm tall in a 8-inch nursery pot",
      sunlight: "Bright indirect light. Medium light is tolerated but leaves may stay smaller with fewer splits.",
      watering: "About once a week in summer; water when the top 4–5 cm of soil feels dry.",
      care: [
        "Provide a moss pole or stake as the plant grows taller.",
        "Wipe the large leaves with a damp cloth every few weeks.",
        "Rotate the pot every couple of weeks for even growth.",
        "Feed monthly during spring and summer with a balanced liquid fertiliser."
      ],
      pet: "Listed as toxic to cats and dogs by the ASPCA. Keep out of reach of pets.",
      waterDays: 7,
      finder: {
        location: ["indoor"],
        light: ["medium", "bright"],
        maintenance: "medium",
        space: "large"
      },
      guides: ["best-indoor-plants-for-beginners", "how-often-to-water-indoor-plants"],
      order: 2
    },
    {
      id: "zz-plant",
      name: "ZZ Plant (Zamioculcas)",
      category: "indoor-plants",
      photoId: "1632207691143-643e2a9a9361",
      alt: "ZZ plant with glossy dark green leaves in a white pot held in hands",
      search: "zz plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Low light",
      featured: true,
      short: "Glossy, almost indestructible foliage for offices and low-light corners.",
      description: "The ZZ plant stores water in thick underground rhizomes, which makes it one of the most drought-tolerant houseplants available. Its glossy, dark-green leaves look polished in offices, bedrooms and corridors with modest light.",
      size: "Commonly sold around 35–45 cm tall in a 6-inch nursery pot",
      sunlight: "Low to bright indirect light. Keep out of strong direct sun, which can scorch leaves.",
      watering: "Every 2–3 weeks. Let the soil dry out fully between waterings.",
      care: [
        "Use a chunky, fast-draining potting mix.",
        "Yellowing stems usually signal overwatering — reduce frequency.",
        "Growth is slow; that's normal, so there's no need to feed often.",
        "Wear gloves when pruning and keep away from children and pets."
      ],
      pet: "Keep away from pets and children; the sap may irritate if chewed.",
      waterDays: 16,
      finder: {
        location: ["indoor"],
        light: ["low", "medium", "bright"],
        maintenance: "low",
        space: "medium"
      },
      guides: ["best-indoor-plants-for-beginners", "best-plants-for-small-apartments"],
      order: 3
    },
    {
      id: "peace-lily",
      name: "Peace Lily (Spathiphyllum)",
      category: "indoor-plants",
      photoId: "1646297670075-f2097a5281e7",
      alt: "Peace lily with white flowers and dark green leaves by a window",
      search: "peace lily plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Flowering",
      short: "Elegant white blooms and lush leaves that tell you when they're thirsty.",
      description: "Peace lilies bring soft white blooms to rooms without direct sun. They are famously communicative: the leaves droop when the plant needs water and perk up within hours of a good drink.",
      size: "Commonly sold around 35–45 cm tall in a 6-inch nursery pot",
      sunlight: "Medium to bright indirect light. Survives lower light but flowers best in brighter spots.",
      watering: "Keep soil lightly moist. Water when the top 2 cm is dry — roughly every 5–7 days in summer.",
      care: [
        "Brown leaf tips can indicate dry air or salt build-up; flush the soil occasionally.",
        "Remove faded flowers at the base of the stem.",
        "Avoid letting the pot sit in water.",
        "Feed lightly every 6–8 weeks in the growing season."
      ],
      pet: "Listed as toxic to cats and dogs by the ASPCA. Keep out of reach of pets.",
      waterDays: 6,
      finder: {
        location: ["indoor"],
        light: ["low", "medium", "bright"],
        maintenance: "medium",
        space: "medium"
      },
      guides: ["best-indoor-plants-for-beginners", "how-often-to-water-indoor-plants"],
      order: 4
    },
    {
      id: "areca-palm",
      name: "Areca Palm",
      category: "indoor-plants",
      photoId: "1615309363679-fed456ff8113",
      alt: "Areca palm with feathery green fronds in a pot on a wooden table",
      search: "areca palm plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      short: "Feathery fronds that bring a soft, tropical feel to bright rooms.",
      description: "The areca palm (Dypsis lutescens) has arching, feathery fronds that soften corners and fill empty spaces. It likes bright, indirect light and evenly moist (not soggy) soil, making it a lovely choice for living rooms and covered verandas.",
      size: "Commonly sold around 60–75 cm tall in a 8-inch nursery pot",
      sunlight: "Bright indirect light. Avoid harsh afternoon sun, which can bleach fronds.",
      watering: "Water when the top 2–3 cm of soil is dry — about twice a week in peak summer, less in winter.",
      care: [
        "Brown tips may come from dry air, underwatering or salt build-up.",
        "Trim fully brown fronds at the base.",
        "Feed monthly in spring and summer.",
        "Repot every 2–3 years; palms prefer to be slightly root-bound."
      ],
      pet: "Listed as non-toxic to cats and dogs by the ASPCA.",
      waterDays: 4,
      finder: {
        location: ["indoor", "outdoor"],
        light: ["medium", "bright"],
        maintenance: "medium",
        space: "large"
      },
      guides: ["best-indoor-plants-for-beginners"],
      order: 5
    },
    {
      id: "spider-plant",
      name: "Spider Plant",
      category: "indoor-plants",
      photoId: "1611527664689-d430dd2a6774",
      alt: "Spider plant with arching striped leaves in a black and white pot",
      search: "spider plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Pet-friendly",
      short: "Arching striped leaves and baby plantlets — perfect for hanging planters.",
      description: "Spider plants (Chlorophytum comosum) are cheerful, adaptable and easy to share: mature plants send out runners with baby plantlets you can pot up. Their arching leaves look great in hanging planters and on shelves.",
      size: "Commonly sold around 20–30 cm spread in a 5-inch nursery pot",
      sunlight: "Bright to medium indirect light.",
      watering: "About once a week; water when the top 2–3 cm of soil is dry.",
      care: [
        "Brown tips are common and can be trimmed with clean scissors.",
        "Pot up plantlets once they have small roots.",
        "Feed every 4–6 weeks in spring and summer.",
        "Avoid waterlogged soil — use a pot with drainage."
      ],
      pet: "Listed as non-toxic to cats and dogs by the ASPCA.",
      waterDays: 7,
      finder: {
        location: ["indoor"],
        light: ["medium", "bright"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-indoor-plants-for-beginners", "best-plants-for-small-apartments"],
      order: 6
    },
    {
      id: "hibiscus",
      name: "Hibiscus (Gudhal)",
      category: "outdoor-plants",
      photoId: "1622396727845-c15ef9ffb419",
      alt: "Red hibiscus flowers blooming among green leaves",
      search: "hibiscus plant",
      stores: ["nurserylive", "amazon", "flipkart"],
      badge: "Flowering",
      featured: true,
      campaign: true,
      short: "Large, vivid red blooms for sunny balconies, terraces and gardens.",
      description: "Hibiscus rosa-sinensis, the much-loved gudhal, produces large red flowers through the warmer months. It thrives in full sun, appreciates regular watering and feeding while flowering, and can be pruned to keep it compact on a balcony.",
      size: "Commonly sold around 40–50 cm tall in a 6-inch nursery pot",
      sunlight: "Full sun — at least 5–6 hours of direct sunlight a day for good flowering.",
      watering: "Water when the top 2–3 cm of soil is dry; daily in peak summer for small pots.",
      care: [
        "Feed every 2–3 weeks during the flowering season.",
        "Prune lightly after a flowering flush to encourage branching.",
        "Check leaf undersides regularly for aphids and mealybugs.",
        "Move to a larger pot as it grows; hibiscus dislikes drying out completely."
      ],
      waterDays: 2,
      finder: {
        location: ["outdoor"],
        light: ["direct"],
        maintenance: "medium",
        space: "medium"
      },
      guides: ["balcony-garden-ideas", "common-gardening-mistakes"],
      order: 7
    },
    {
      id: "bougainvillea",
      name: "Bougainvillea",
      category: "outdoor-plants",
      photoId: "1600100397506-72b56634f9ca",
      alt: "Bright pink bougainvillea flowers against a blue sky",
      search: "bougainvillea plant",
      stores: ["nurserylive", "amazon", "flipkart"],
      campaign: true,
      short: "Hardy, drought-tolerant climber with masses of vibrant pink bracts.",
      description: "Bougainvillea is built for Indian sunshine. Once established it tolerates heat and dry spells, rewarding you with masses of colourful bracts. Train it along a railing or trellis, or keep it pruned as a bushy pot plant.",
      size: "Commonly sold around 45–60 cm tall in a 6-inch nursery pot",
      sunlight: "Full sun — 6 or more hours of direct sunlight.",
      watering: "Water deeply, then let the top few centimetres dry. Slightly dry soil encourages flowering.",
      care: [
        "Prune after each flowering flush to keep shape and encourage new blooms.",
        "Wear gloves — stems have sharp thorns.",
        "Avoid overfeeding with nitrogen, which favours leaves over flowers.",
        "Provide a trellis or railing support for climbing growth."
      ],
      waterDays: 4,
      finder: {
        location: ["outdoor"],
        light: ["direct"],
        maintenance: "low",
        space: "large"
      },
      guides: ["balcony-garden-ideas"],
      order: 8
    },
    {
      id: "tulsi",
      name: "Holy Basil (Krishna Tulsi)",
      category: "outdoor-plants",
      photoId: "1696397279839-a2b8785c2113",
      alt: "Krishna tulsi holy basil plant with purple flower spikes",
      search: "krishna tulsi plant",
      stores: ["nurserylive", "amazon", "flipkart"],
      badge: "Popular pick",
      featured: true,
      short: "Aromatic, purple-tinged tulsi for sunny balconies and windowsills.",
      description: "Krishna tulsi (Ocimum tenuiflorum) is a fragrant, purple-tinged variety of holy basil, grown in many Indian homes. It loves sun and warmth and becomes bushier when you regularly pinch off the flower spikes.",
      size: "Commonly sold around 20–30 cm tall in a 5-inch nursery pot",
      sunlight: "Full sun to bright light — at least 4–6 hours of direct sunlight.",
      watering: "Water when the top 2 cm of soil is dry; every 1–2 days in hot weather. Avoid waterlogging.",
      care: [
        "Pinch off flower spikes to encourage leafy, bushy growth.",
        "Protect from cold winds and frost in north Indian winters.",
        "Use well-draining soil — tulsi dislikes soggy roots.",
        "Harvest leaves from the top to keep the plant compact."
      ],
      waterDays: 2,
      finder: {
        location: ["outdoor", "indoor"],
        light: ["bright", "direct"],
        maintenance: "medium",
        space: "small"
      },
      guides: ["balcony-garden-ideas", "best-plants-for-small-apartments"],
      order: 9
    },
    {
      id: "mogra-jasmine",
      name: "Mogra (Arabian Jasmine)",
      category: "outdoor-plants",
      photoId: "1623171404570-1d196759fe20",
      alt: "White mogra jasmine flowers with green leaves",
      search: "mogra plant",
      stores: ["nurserylive", "amazon", "flipkart"],
      badge: "Fragrant",
      campaign: true,
      short: "Intensely fragrant white flowers for warm, sunny balconies.",
      description: "Mogra (Jasminum sambac) is treasured for its intensely fragrant white flowers, which appear mainly in the warmer months. Keep it in a sunny spot, water regularly while it's growing and prune after flowering to keep it bushy.",
      size: "Commonly sold around 30–40 cm tall in a 6-inch nursery pot",
      sunlight: "Full sun — 5–6 hours of direct sunlight for best flowering.",
      watering: "Water when the top 2–3 cm of soil is dry; more often in summer, less in winter.",
      care: [
        "Prune after flowering to encourage new flowering shoots.",
        "Feed every 3–4 weeks during the growing season.",
        "Ensure good drainage; mogra dislikes waterlogged roots.",
        "Watch for mealybugs on new growth."
      ],
      waterDays: 3,
      finder: {
        location: ["outdoor"],
        light: ["direct"],
        maintenance: "medium",
        space: "medium"
      },
      guides: ["balcony-garden-ideas"],
      order: 10
    },
    {
      id: "desi-rose",
      name: "Desi Rose",
      category: "outdoor-plants",
      photoId: "1596080170133-abfa734365f1",
      alt: "Pink rose in full bloom with green leaves",
      search: "rose plant",
      stores: ["nurserylive", "amazon", "flipkart"],
      campaign: true,
      short: "Classic fragrant pink roses for gardeners who enjoy regular care.",
      description: "A hardy, fragrant desi rose with soft pink blooms. Roses reward attention: plenty of sun, deep watering, regular feeding and seasonal pruning. Ideal for gardeners who enjoy a hands-on routine.",
      size: "Commonly sold around 30–45 cm tall in a 6-inch nursery pot",
      sunlight: "Full sun — at least 6 hours of direct sunlight.",
      watering: "Water deeply when the top 3–4 cm of soil is dry; avoid wetting leaves in the evening.",
      care: [
        "Deadhead spent blooms to encourage more flowers.",
        "Prune once a year; in much of India this is done after the monsoon.",
        "Feed with compost or a balanced fertiliser every 3–4 weeks.",
        "Inspect regularly for aphids and fungal leaf spots."
      ],
      waterDays: 2,
      finder: {
        location: ["outdoor"],
        light: ["direct"],
        maintenance: "high",
        space: "medium"
      },
      guides: ["balcony-garden-ideas", "common-gardening-mistakes"],
      order: 11
    },
    {
      id: "jade-plant",
      name: "Jade Plant (Crassula)",
      category: "succulents",
      photoId: "1621552330975-f5f9c85dc9c9",
      alt: "Jade plant with thick glossy oval leaves in a white pot",
      search: "jade plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Popular pick",
      featured: true,
      short: "Thick, glossy leaves on a tree-like frame. Loves bright light, little water.",
      description: "The jade plant (Crassula ovata) stores water in its fleshy leaves and slowly develops a miniature tree shape. Give it a bright windowsill and water sparingly, and it can live for many years.",
      size: "Commonly sold around 15–20 cm tall in a 4-inch pot",
      sunlight: "Bright light with some direct sun — an east- or south-facing window is ideal.",
      watering: "Every 2–3 weeks. Water deeply only when the soil is completely dry.",
      care: [
        "Use a gritty succulent or cactus mix.",
        "Shrivelled leaves mean it's thirsty; soft, translucent leaves mean too much water.",
        "Pinch new growth to encourage a bushy shape.",
        "Propagate easily from a single leaf or stem cutting."
      ],
      pet: "Listed as toxic to cats and dogs by the ASPCA. Keep out of reach of pets.",
      waterDays: 16,
      finder: {
        location: ["indoor", "outdoor"],
        light: ["bright", "direct"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-indoor-plants-for-beginners", "best-plants-for-small-apartments"],
      order: 12
    },
    {
      id: "aloe-vera",
      name: "Aloe Vera",
      category: "succulents",
      photoId: "1509423350716-97f9360b4e09",
      alt: "Aloe vera succulent with spiky green leaves in a white pot",
      search: "aloe vera plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      short: "Easy, sun-loving succulent with fleshy, upright leaves.",
      description: "Aloe vera is a sturdy succulent with upright, fleshy leaves. It thrives on a sunny windowsill or balcony and only needs water once the soil has dried out.",
      size: "Commonly sold around 15–25 cm tall in a 4-inch pot",
      sunlight: "Bright light with a few hours of direct sun.",
      watering: "Every 2–3 weeks; less in winter. Water deeply, then let the soil dry completely.",
      care: [
        "Plant in a gritty, fast-draining mix; terracotta pots help soil dry faster.",
        "Pups (offsets) can be separated and potted up.",
        "Introduce gradually to harsh summer sun to avoid scorching.",
        "Avoid letting water collect at the base of the leaves."
      ],
      pet: "Listed as toxic to cats and dogs by the ASPCA. Keep out of reach of pets.",
      waterDays: 16,
      finder: {
        location: ["indoor", "outdoor"],
        light: ["bright", "direct"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-indoor-plants-for-beginners", "best-plants-for-small-apartments"],
      order: 13
    },
    {
      id: "echeveria",
      name: "Echeveria Rosette",
      category: "succulents",
      photoId: "1724148893915-c3e5370067d5",
      alt: "Blue-green echeveria succulent rosette close-up",
      search: "echeveria succulent",
      stores: ["nurserylive", "amazon", "flipkart"],
      short: "Sculptural blue-green rosettes for bright windowsills and desk gardens.",
      description: "Echeverias form neat, flower-like rosettes in soft blue-green tones. They need plenty of light to keep their compact shape and only occasional watering.",
      size: "Commonly sold around 8–12 cm across in a 3-inch pot",
      sunlight: "Bright light with some direct morning sun. Stretches if light is too low.",
      watering: "Every 2–3 weeks. Water the soil, not the rosette, and let it dry completely.",
      care: [
        "Remove dried lower leaves to prevent pests hiding there.",
        "Use a shallow pot with a drainage hole and gritty mix.",
        "Reduce watering in winter and during humid monsoon weeks.",
        "A leggy, stretched rosette is asking for more light."
      ],
      waterDays: 16,
      finder: {
        location: ["indoor", "outdoor"],
        light: ["bright", "direct"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-plants-for-small-apartments"],
      order: 14
    },
    {
      id: "zebra-haworthia",
      name: "Zebra Haworthia",
      category: "succulents",
      photoId: "1711690161377-ba1bd24ab27c",
      alt: "Zebra haworthia succulent with white-striped pointed leaves in a pot",
      search: "haworthia",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Low light",
      short: "Compact, white-striped succulent that tolerates less light than most.",
      description: "Zebra haworthia has spiky, white-striped leaves and stays compact for years. Unlike many succulents it is happy in bright indirect light, making it ideal for desks and shelves near a window.",
      size: "Commonly sold around 8–12 cm tall in a 3-inch pot",
      sunlight: "Bright indirect light; tolerates medium light near a window.",
      watering: "Every 2–3 weeks, when the soil is completely dry.",
      care: [
        "Avoid harsh afternoon sun, which can turn leaves red-brown.",
        "Use a gritty succulent mix in a pot with drainage.",
        "Water sparingly in winter.",
        "Separate offsets when repotting to grow new plants."
      ],
      waterDays: 16,
      finder: {
        location: ["indoor"],
        light: ["medium", "bright"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-plants-for-small-apartments"],
      order: 15
    },
    {
      id: "mini-cactus",
      name: "Mini Cactus",
      category: "succulents",
      photoId: "1551888419-7b7a520fe0ca",
      alt: "Small green columnar cactus in a beige and white patterned ceramic pot",
      search: "cactus plant",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      short: "A cheerful desk companion that needs sun and very little water.",
      description: "Small columnar and globe cacti make easy desk plants. Place one in your sunniest window, use a gritty mix in a pot with a drainage hole, and water only occasionally.",
      size: "Commonly sold around 10–15 cm tall in 3–4 inch pots",
      sunlight: "Full sun to very bright light.",
      watering: "Every 2–4 weeks in the warm months; very little in winter.",
      care: [
        "Pot has a drainage hole — empty any saucer after watering.",
        "Handle with folded paper or gloves to avoid spines.",
        "Rotate occasionally so it grows straight.",
        "Signs of rot (soft, darkening base) usually mean too much water."
      ],
      waterDays: 21,
      finder: {
        location: ["indoor", "outdoor"],
        light: ["bright", "direct"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-plants-for-small-apartments"],
      order: 16
    },
    {
      id: "succulent-trio",
      name: "Succulent Combo",
      category: "succulents",
      photoId: "1668508380767-a13f204bde1c",
      alt: "Group of blue-green succulent rosettes planted together in a pot",
      search: "succulent plants combo",
      stores: ["nurserylive", "ugaoo", "amazon", "flipkart"],
      badge: "Starter set",
      short: "Assorted succulents — an easy starter set for sunny sills.",
      description: "Many stores sell sets of three or four assorted succulents — a simple way to start a sunny windowsill or balcony collection. Group them in a shallow pot or tray with drainage.",
      size: "Usually 3–4 small plants in 3-inch pots",
      sunlight: "Bright light with some direct sun.",
      watering: "Every 2–3 weeks; let the soil dry completely between waterings.",
      care: [
        "Group them in a shallow tray or planter with drainage.",
        "Use a gritty succulent mix when repotting.",
        "Cut back watering in winter and humid weather.",
        "Stretched growth means they need more light."
      ],
      waterDays: 16,
      finder: {
        location: ["indoor", "outdoor"],
        light: ["bright", "direct"],
        maintenance: "low",
        space: "small"
      },
      guides: ["best-plants-for-small-apartments", "common-gardening-mistakes"],
      order: 17
    },
    {
      id: "terracotta-pot-set",
      name: "Terracotta Pots",
      category: "pots-planters",
      photoId: "1620293106076-ad27d651efe3",
      alt: "Set of brown terracotta clay pots with green plants",
      search: "terracotta pot",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Popular pick",
      featured: true,
      short: "Breathable clay pots that help soil dry evenly — ideal for succulents and herbs.",
      description: "Unglazed terracotta lets soil breathe and dry evenly, which helps prevent root rot — especially for succulents, herbs and snake plants. Most stores sell single pots and sets in several sizes; choose pots with a drainage hole and a matching saucer.",
      size: "4, 6, 8 and 10 inch pots cover most plants",
      specs: [
        ["Material", "Unglazed terracotta (clay)"],
        ["Drainage", "Make sure every pot has a hole"],
        ["Best for", "Succulents, herbs, snake plants"],
        ["Tip", "Soak new pots in water for an hour before planting"]
      ],
      guides: ["common-gardening-mistakes", "balcony-garden-ideas"],
      order: 18
    },
    {
      id: "white-ceramic-planter",
      name: "White Ceramic Planter",
      category: "pots-planters",
      photoId: "1588440691140-09155c1be58a",
      alt: "White textured ceramic planter holding a leafy green plant on a windowsill",
      search: "white ceramic planter",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      short: "A minimal planter that suits any décor — choose one with a drainage hole.",
      description: "A plain white or textured ceramic planter pairs with almost any interior. Choose one with a drainage hole (a removable plug is handy), or use it as a cover pot around a plastic nursery pot and empty any water that collects.",
      size: "Pick one 2–5 cm wider than your plant's nursery pot",
      specs: [
        ["Material", "Glazed ceramic"],
        ["Drainage", "Choose one with a hole; a plug is handy"],
        ["Tip", "Use as a cover pot over a nursery pot"],
        ["Care", "Wipe clean with a damp cloth"]
      ],
      guides: ["best-indoor-plants-for-beginners"],
      order: 19
    },
    {
      id: "pastel-ceramic-pot",
      name: "Small Glazed Ceramic Pot",
      category: "pots-planters",
      photoId: "1485955900006-10f4d324d411",
      alt: "Mint-teal glazed ceramic pot holding a small succulent",
      search: "small ceramic pot",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Editor's pick",
      short: "Small glazed pots for succulents, cacti and desk plants.",
      description: "Small glazed pots in soft colours brighten desks and shelves and suit succulents, cacti and small foliage plants. Look for a drainage hole — tiny pots without one stay wet for too long.",
      size: "3–5 inch pots suit most succulents and desk plants",
      specs: [
        ["Material", "Glazed ceramic"],
        ["Drainage", "Make sure it has a hole"],
        ["Best for", "Succulents, cacti, small foliage plants"],
        ["Style", "Soft glazes brighten desks and shelves"]
      ],
      guides: ["best-plants-for-small-apartments"],
      order: 20
    },
    {
      id: "macrame-hanger",
      name: "Cotton Macramé Plant Hanger",
      category: "pots-planters",
      photoId: "1513491952389-d52ceeb8c9d3",
      alt: "Plant hanging in a macrame hanger near a bright glass window",
      search: "macrame plant hanger",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      featured: true,
      short: "Lifts trailing plants off the floor and into the light.",
      description: "A cotton macramé hanger lifts trailing plants like money plant and spider plant off the floor and closer to the light. Check the largest pot it holds and how it fixes to your ceiling — a freshly watered pot is heavier than you expect.",
      size: "Check the maximum pot size (often 6–8 inch)",
      specs: [
        ["Material", "Natural cotton cord"],
        ["Load", "Check the hook and ceiling fixing can hold a wet pot"],
        ["Check", "Whether a ceiling hook is included"],
        ["Best for", "Money plant, spider plant, ferns"]
      ],
      guides: ["best-plants-for-small-apartments", "money-plant-care-guide"],
      order: 21
    },
    {
      id: "railing-planter-set",
      name: "Balcony Railing Planters",
      category: "pots-planters",
      photoId: "1708223578831-5c737a3074ab",
      alt: "Row of potted plants on a balcony window ledge",
      search: "railing planter",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      campaign: true,
      short: "Hook-on planters that turn a railing into growing space.",
      description: "Railing planters hook onto balcony grills and turn an unused edge into a herb or flower box. Measure your railing before buying, choose UV-stabilised material that won't crack in the sun, and fix them securely.",
      size: "Measure your railing width before buying",
      specs: [
        ["Material", "UV-stabilised plastic or metal"],
        ["Drainage", "Look for multiple holes"],
        ["Fit", "Adjustable hooks fit more railings"],
        ["Safety", "Fix firmly; don't over-fill with wet soil"]
      ],
      guides: ["balcony-garden-ideas", "best-plants-for-small-apartments"],
      order: 22
    },
    {
      id: "kitchen-herb-seed-kit",
      name: "Kitchen Herb Seed Kit",
      category: "seeds-soil",
      photoId: "1752051665095-be37be749e55",
      alt: "Assorted seed packets displayed on a wooden shelf",
      search: "herb seeds",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Gift idea",
      featured: true,
      campaign: true,
      short: "Basil, coriander, methi and more for a windowsill or balcony.",
      description: "A herb seed kit is an easy, low-cost way to start a windowsill or balcony kitchen garden. Look for herbs you actually cook with — basil, coriander, methi, dill or parsley — and a sowing guide. Sowing seasons vary by region.",
      size: "Usually 4–6 seed packets per kit",
      specs: [
        ["Look for", "Basil, coriander, methi, dill, parsley"],
        ["Sunlight", "4–6 hours of direct sun for most herbs"],
        ["Germination", "Typically 5–15 days, depending on herb and temperature"],
        ["Tip", "Sow small batches every few weeks for a steady harvest"]
      ],
      guides: ["balcony-garden-ideas", "best-plants-for-small-apartments"],
      order: 23
    },
    {
      id: "winter-vegetable-seeds",
      name: "Winter Vegetable Seeds",
      category: "seeds-soil",
      photoId: "1457530378978-8bac673b8062",
      alt: "Young green vegetable seedlings growing in soil",
      search: "winter vegetable seeds",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Seasonal",
      campaign: true,
      short: "Palak, radish, carrot, peas and tomato for the cool season.",
      description: "Cool-season vegetables such as palak (spinach), radish, carrot, peas and tomato grow well in containers in many parts of India from October to February. Buy individual packets or a seasonal combo, and check your local sowing calendar.",
      size: "Buy individual packets or a seasonal combo",
      specs: [
        ["Good choices", "Palak, radish, carrot, peas, tomato"],
        ["Container depth", "At least 20–30 cm for carrots and radish"],
        ["Sunlight", "5–6 hours of direct sun"],
        ["Check", "The packing or expiry date on each packet"]
      ],
      guides: ["balcony-garden-ideas"],
      order: 24
    },
    {
      id: "marigold-seeds",
      name: "Marigold (Genda) Seeds",
      category: "seeds-soil",
      photoId: "1696324635500-10785ee184b5",
      alt: "Bright orange marigold flowers in a garden",
      search: "marigold seeds",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Seasonal",
      campaign: true,
      short: "Easy, cheerful marigolds — a great first flower to grow from seed.",
      description: "Marigolds are among the easiest flowers to grow from seed and brighten balconies for weeks. Sow in a tray or directly in pots, keep the soil lightly moist and place in full sun.",
      size: "A small packet is enough for a balcony",
      specs: [
        ["Sunlight", "Full sun, 6+ hours"],
        ["Germination", "Typically 5–10 days in warm conditions"],
        ["Spacing", "About 20–25 cm between plants"],
        ["Tip", "Pinch the growing tip once for bushier plants"]
      ],
      guides: ["balcony-garden-ideas"],
      order: 25
    },
    {
      id: "organic-potting-mix",
      name: "Organic Potting Mix",
      category: "seeds-soil",
      photoId: "1642952273588-ed6fa28870ac",
      alt: "Hand holding dark, crumbly potting soil",
      search: "potting mix",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Popular pick",
      featured: true,
      short: "Ready-to-use mix that drains well but holds moisture.",
      description: "A good potting mix is light and well-draining but still holds moisture. Look for blends of cocopeat, compost or vermicompost and perlite. For succulents, choose a cactus mix or add extra sand or perlite.",
      size: "5 kg bags suit several medium pots",
      specs: [
        ["Look for", "Cocopeat, compost/vermicompost, perlite"],
        ["Use for", "Houseplants, flowering plants, herbs"],
        ["Succulents", "Choose a cactus mix or add grit"],
        ["Storage", "Keep the bag closed in a dry, shaded place"]
      ],
      guides: ["common-gardening-mistakes", "balcony-garden-ideas"],
      order: 26
    },
    {
      id: "vermicompost",
      name: "Vermicompost",
      category: "seeds-soil",
      photoId: "1492496913980-501348b61469",
      alt: "Hands holding rich dark compost",
      search: "vermicompost",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      short: "Organic compost to enrich potting soil and garden beds.",
      description: "Vermicompost is earthworm-produced compost that improves soil structure and adds organic matter. Mix it into potting soil when planting, or top-dress pots with a handful every 4–6 weeks during the growing season.",
      size: "1–5 kg bags are handy for balconies",
      specs: [
        ["Type", "Organic vermicompost"],
        ["Mixing", "About 20–30% of your potting mix"],
        ["Top-dressing", "A handful per medium pot every 4–6 weeks"],
        ["Storage", "Keep slightly moist and shaded"]
      ],
      guides: ["balcony-garden-ideas", "common-gardening-mistakes"],
      order: 27
    },
    {
      id: "cocopeat-block",
      name: "Cocopeat Block",
      category: "seeds-soil",
      photoId: "1767380009565-52c573e16288",
      alt: "Close-up of brown coconut coir fibre",
      search: "cocopeat block",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      short: "Compressed coconut coir that expands into a light growing medium.",
      description: "Cocopeat is washed coconut coir sold as compressed blocks. Soak a block in water and it expands several times in volume into a fluffy medium that lightens heavy soil and holds moisture — ideal for seed starting and DIY potting mixes.",
      size: "Blocks expand several times when soaked",
      specs: [
        ["Material", "Washed coconut coir"],
        ["Preparation", "Soak in water and break apart once expanded"],
        ["Use for", "Seed starting, potting-mix blends"],
        ["Note", "Contains few nutrients — combine with compost"]
      ],
      guides: ["balcony-garden-ideas"],
      order: 28
    },
    {
      id: "seaweed-liquid-fertiliser",
      name: "Liquid Seaweed Fertiliser",
      category: "seeds-soil",
      photoId: "1709633644385-e4e51e5646f1",
      alt: "Hands holding a mound of dark, rich soil",
      search: "seaweed liquid fertilizer",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      short: "A gentle organic liquid feed for houseplants, flowers and vegetables.",
      description: "Seaweed-based liquid feeds are a gentle option for regular feeding during the growing season. Always dilute and apply exactly as the product label says, and water the plant first if the soil is dry.",
      size: "Small bottles (100–500 ml) last a long time",
      specs: [
        ["Dilution", "Follow the label – liquid feeds are diluted in water"],
        ["Frequency", "Every 2–4 weeks in the growing season"],
        ["Winter", "Reduce or pause feeding"],
        ["Tip", "Never feed a bone-dry plant — water first"]
      ],
      guides: ["common-gardening-mistakes", "money-plant-care-guide"],
      order: 29
    },
    {
      id: "hand-trowel",
      name: "Hand Trowel",
      category: "gardening-tools",
      photoId: "1598851418241-f52c34b6e4c3",
      alt: "Stainless steel hand trowel with a wooden handle",
      search: "hand trowel",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      short: "The basic tool for potting, repotting and mixing soil.",
      description: "A sturdy hand trowel is the first tool most gardeners need — for potting, repotting, transplanting and mixing soil. Stainless steel resists rust; a comfortable handle matters more than you'd think.",
      size: "About 30 cm long is comfortable for pots",
      specs: [
        ["Blade", "Stainless steel resists rust"],
        ["Handle", "Wood or rubber grip"],
        ["Use for", "Potting, transplanting, mixing soil"],
        ["Care", "Wipe clean and dry after use"]
      ],
      guides: ["common-gardening-mistakes"],
      order: 30
    },
    {
      id: "pruning-shears",
      name: "Bypass Pruning Shears",
      category: "gardening-tools",
      photoId: "1680124744737-03fb697f303d",
      alt: "Hand using green pruning shears to trim a plant",
      search: "pruning shears",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Popular pick",
      featured: true,
      short: "Sharp, scissor-like cuts for deadheading, trimming and cuttings.",
      description: "Bypass pruners make clean, scissor-like cuts that heal quickly — ideal for deadheading roses, trimming hibiscus and taking cuttings. A safety lock and spring-loaded handles make them easier to use.",
      size: "Bypass type, around 20 cm long",
      specs: [
        ["Blade", "Bypass style (not anvil) for live stems"],
        ["Cutting capacity", "Stems up to about 15 mm"],
        ["Features", "Safety lock, spring action"],
        ["Tip", "Wipe blades with rubbing alcohol between plants"]
      ],
      guides: ["common-gardening-mistakes", "money-plant-care-guide"],
      order: 31
    },
    {
      id: "metal-watering-can",
      name: "Long-Spout Watering Can",
      category: "gardening-tools",
      photoId: "1786459558726-2b672982ba55",
      alt: "Hand holding a galvanised metal watering can",
      search: "watering can",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      featured: true,
      short: "Reaches under leaves so water goes straight to the soil.",
      description: "A watering can with a long spout reaches the soil beneath leaves, so water goes where roots need it. A removable rose head gives a gentle shower for seedlings.",
      size: "1–2 litres for indoors; 5 litres or more for balconies",
      specs: [
        ["Material", "Galvanised metal or sturdy plastic"],
        ["Spout", "Long and narrow for precise watering"],
        ["Look for", "A removable rose head for seedlings"],
        ["Best for", "Houseplants, seedlings, balcony pots"]
      ],
      guides: ["how-often-to-water-indoor-plants"],
      order: 32
    },
    {
      id: "gardening-gloves",
      name: "Gardening Gloves",
      category: "gardening-tools",
      photoId: "1622383563227-04401ab4e5ea",
      alt: "Gloved hands planting a seedling in soil",
      search: "gardening gloves",
      stores: ["amazon", "flipkart", "nurserylive"],
      short: "Grippy, breathable gloves for potting and pruning.",
      description: "Lightweight, breathable gloves with a textured palm protect hands from soil, thorns and sap while staying comfortable in warm weather.",
      size: "Usually free size",
      specs: [
        ["Material", "Knitted fabric with a coated palm"],
        ["Use for", "Potting, pruning, weeding"],
        ["Look for", "Breathable back, grippy palm"],
        ["Care", "Hand wash and air dry"]
      ],
      guides: ["common-gardening-mistakes"],
      order: 33
    },
    {
      id: "plant-mister",
      name: "Plant Mister Spray Bottle",
      category: "gardening-tools",
      photoId: "1758273705825-4db26035332c",
      alt: "Person spraying a fine mist of water onto a potted plant",
      search: "plant mister spray bottle",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      short: "Fine mist for cleaning leaves and moistening seed trays.",
      description: "A refillable spray bottle with an adjustable nozzle is useful for cleaning dusty leaves, moistening seed trays and applying diluted plant sprays.",
      size: "300–500 ml bottles are easy to hold",
      specs: [
        ["Nozzle", "Adjustable mist to jet"],
        ["Use for", "Leaf cleaning, seedlings, diluted sprays"],
        ["Look for", "Leak-free trigger"],
        ["Note", "Misting alone has a short-lived effect on humidity"]
      ],
      guides: ["how-often-to-water-indoor-plants"],
      order: 34
    },
    {
      id: "garden-tool-kit",
      name: "Gardening Tool Kit",
      category: "gardening-tools",
      photoId: "1783401726852-02ddd3a27724",
      alt: "Gardening tools and gloves neatly organised on a pegboard",
      search: "gardening tool kit",
      stores: ["amazon", "flipkart", "nurserylive", "ugaoo"],
      badge: "Starter set",
      featured: true,
      campaign: true,
      short: "Trowel, transplanter, cultivator and more — everything to get started.",
      description: "A basic kit gives a new gardener everything in one go: hand trowel, transplanter, cultivator, pruner and gloves. It also makes a thoughtful gift for first-time plant parents.",
      size: "4–7 piece kits cover most balcony tasks",
      specs: [
        ["Look for", "Trowel, transplanter, cultivator, pruner, gloves"],
        ["Material", "Steel heads, comfortable handles"],
        ["Best for", "Balcony and terrace gardening"],
        ["Care", "Clean, dry and store indoors"]
      ],
      guides: ["balcony-garden-ideas", "common-gardening-mistakes"],
      order: 35
    }
  ];

  /* ---------------- Lookup helpers ---------------- */
  GC.getProduct = function (id) { return GC.products.find(function (p) { return p.id === id; }); };
  GC.getCategory = function (id) { return GC.categories.find(function (c) { return c.id === id; }); };
  GC.getGuide = function (slug) { return GC.guides.find(function (g) { return g.slug === slug; }); };

  /**
   * Simple product search: every word in the query must appear in the
   * product's name, category, badge, short or long description.
   */
  GC.searchProducts = function (query) {
    const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return GC.products.slice();
    return GC.products.filter(function (p) {
      const cat = GC.getCategory(p.category);
      const text = [p.name, cat ? cat.name : '', p.badge || '', p.short, p.description].join(' ').toLowerCase();
      return words.every(function (w) { return text.indexOf(w) !== -1; });
    });
  };
})(window);
