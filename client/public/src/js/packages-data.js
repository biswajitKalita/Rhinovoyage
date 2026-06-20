// Comprehensive Travel Packages Database (Starting from Sivasagar, Assam)
const packagesData = [
  {
    key: "Sivasagar Heritage Trail",
    title: "Sivasagar Heritage Trail",
    duration: "2 Days / 1 Night",
    price: "₹1,999*",
    vehicle: "Private Vehicle",
    region: "Assam",
    badge: "Best Seller",
    class: "pkg-v1",
    includes: [
      "Rang Ghar & Talatal Ghar Tour",
      "Kareng Ghar Sightseeing",
      "Charaideo Maidams Heritage"
    ],
    days: [
      {
        day: "Day 1",
        title: "Ahom Capital & Royal Palaces",
        list: [
          "08:00 AM – Pickup from Sivasagar town",
          "09:00 AM – Rang Ghar",
          "11:00 AM – Talatal Ghar",
          "01:00 PM – Lunch",
          "03:00 PM – Kareng Ghar",
          "05:30 PM – Joysagar Lake sunset",
          "08:00 PM – Dinner & overnight stay"
        ]
      },
      {
        day: "Day 2",
        title: "Charaideo Maidams & Departure",
        list: [
          "07:00 AM – Breakfast",
          "08:30 AM – Charaideo Maidams",
          "12:00 PM – Lunch",
          "02:00 PM – Drop at Sivasagar"
        ]
      }
    ]
  },
  // --- NEW ACTIVE PACKAGES ---
  {
    key: "Explore Assam",
    title: "EXPLORE ASSAM",
    duration: "7 Days / 6 Nights",
    price: "₹16,500",
    vehicle: "SUV / Ertiga",
    region: "Assam",
    badge: "Eco-Tour",
    class: "pkg-v1",
    includes: [
      "Kaziranga Wildlife Safaris",
      "Brahmaputra Cruise & Umananda",
      "Majuli Island Satra Heritage"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Kaziranga",
        list: [
          "Pickup from Sivasagar",
          "Visit Orchid Park",
          "Evening cultural show",
          "Night stay: Kaziranga"
        ]
      },
      {
        day: "Day 2",
        title: "Kaziranga",
        list: [
          "Early morning Jeep Safari",
          "Elephant Safari",
          "Central Range sightseeing",
          "Night stay: Kaziranga"
        ]
      },
      {
        day: "Day 3",
        title: "Kaziranga → Guwahati",
        list: [
          "Visit Umananda Island",
          "Brahmaputra River Cruise",
          "Night stay: Guwahati"
        ]
      },
      {
        day: "Day 4",
        title: "Guwahati",
        list: [
          "Visit Kamakhya Temple",
          "Assam State Museum",
          "Srimanta Sankardev Kalakshetra",
          "Night stay: Guwahati"
        ]
      },
      {
        day: "Day 5",
        title: "Guwahati → Shillong (Day Excursion)",
        list: [
          "Umiam Lake",
          "Police Bazaar",
          "Return to Guwahati",
          "Night stay: Guwahati"
        ]
      },
      {
        day: "Day 6",
        title: "Guwahati → Majuli",
        list: [
          "Ferry to Majuli",
          "Satra visits",
          "Sunset photography",
          "Night stay: Majuli"
        ]
      },
      {
        day: "Day 7",
        title: "Majuli → Sivasagar",
        list: [
          "Return journey",
          "Visit Charaideo Maidam",
          "Tour Ends"
        ]
      }
    ]
  },
  {
    key: "Explore Meghalaya",
    title: "EXPLORE MEGHALAYA",
    duration: "6 Days / 5 Nights",
    price: "₹14,800",
    vehicle: "SUV / Ertiga",
    region: "Meghalaya",
    badge: "Scenic",
    class: "pkg-v3",
    includes: [
      "Umiam Lake & Police Bazaar",
      "Cherrapunji Falls & Caves",
      "Dawki Umngot River Boating"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Shillong",
        list: [
          "Umiam Lake",
          "Police Bazaar",
          "Night stay: Shillong"
        ]
      },
      {
        day: "Day 2",
        title: "Shillong Local",
        list: [
          "Elephant Falls",
          "Shillong Peak",
          "Ward's Lake",
          "Night stay: Shillong"
        ]
      },
      {
        day: "Day 3",
        title: "Shillong → Cherrapunji",
        list: [
          "Nohkalikai Falls",
          "Seven Sisters Falls",
          "Mawsmai Cave",
          "Night stay: Cherrapunji"
        ]
      },
      {
        day: "Day 4",
        title: "Living Root Bridge Trek",
        list: [
          "Double Decker Root Bridge",
          "Rainbow Falls",
          "Night stay: Cherrapunji"
        ]
      },
      {
        day: "Day 5",
        title: "Cherrapunji → Dawki",
        list: [
          "Crystal Clear Umngot River",
          "India-Bangladesh Border",
          "Shnongpdeng",
          "Night stay: Dawki"
        ]
      },
      {
        day: "Day 6",
        title: "Dawki → Sivasagar",
        list: [
          "Tour Ends"
        ]
      }
    ]
  },
  {
    key: "Explore Arunachal",
    title: "EXPLORE ARUNACHAL PRADESH",
    duration: "8 Days / 7 Nights",
    price: "₹19,800",
    vehicle: "4x4 SUV / Ertiga",
    region: "Arunachal",
    badge: "Adventure",
    class: "pkg-v4",
    includes: [
      "Sela Pass & Tawang Monastery",
      "Dirang Valley & Sangti Valley",
      "Bum La Pass & Madhuri Lake"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Bhalukpong",
        list: [
          "Night stay"
        ]
      },
      {
        day: "Day 2",
        title: "Bhalukpong → Dirang",
        list: [
          "Orchid Centre",
          "Sangti Valley",
          "Night stay: Dirang"
        ]
      },
      {
        day: "Day 3",
        title: "Dirang → Tawang",
        list: [
          "Sela Pass",
          "Jaswant Garh",
          "Night stay: Tawang"
        ]
      },
      {
        day: "Day 4",
        title: "Tawang Local",
        list: [
          "Tawang Monastery",
          "War Memorial",
          "Night stay"
        ]
      },
      {
        day: "Day 5",
        title: "Bum La Pass Excursion",
        list: [
          "Bum La",
          "Madhuri Lake",
          "PTSO Lake",
          "Night stay"
        ]
      },
      {
        day: "Day 6",
        title: "Tawang → Dirang",
        list: [
          "Night stay"
        ]
      },
      {
        day: "Day 7",
        title: "Dirang → Tezpur",
        list: [
          "Night stay"
        ]
      },
      {
        day: "Day 8",
        title: "Tezpur → Sivasagar",
        list: [
          "Tour Ends"
        ]
      }
    ]
  },
  {
    key: "Explore Nagaland",
    title: "EXPLORE NAGALAND",
    duration: "5 Days / 4 Nights",
    price: "₹12,500",
    vehicle: "SUV / Bolero",
    region: "Nagaland",
    badge: "Cultural",
    class: "pkg-v5",
    includes: [
      "Kohima War Cemetery",
      "Khonoma Eco-Green Village",
      "Dzukou Valley Alpine Trek"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Kohima",
        list: [
          "Night stay"
        ]
      },
      {
        day: "Day 2",
        title: "Kohima Local",
        list: [
          "War Cemetery",
          "Cathedral Church",
          "Night stay"
        ]
      },
      {
        day: "Day 3",
        title: "Khonoma Village",
        list: [
          "Traditional Naga Culture",
          "Night stay"
        ]
      },
      {
        day: "Day 4",
        title: "Dzukou Valley Trek",
        list: [
          "Full day trek",
          "Night stay"
        ]
      },
      {
        day: "Day 5",
        title: "Return to Sivasagar",
        list: [
          "Tour Ends"
        ]
      }
    ]
  },
  {
    key: "Explore Sikkim",
    title: "EXPLORE SIKKIM",
    duration: "8 Days / 7 Nights",
    price: "₹21,500",
    vehicle: "SUV / Ertiga",
    region: "Sikkim",
    badge: "Himalayan",
    class: "pkg-v6",
    includes: [
      "Gangtok MG Marg & Ropeway",
      "Tsomgo Lake & Baba Mandir",
      "Yumthang Valley & Pelling Skywalk"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Gangtok",
        list: [
          "Travel to Gangtok",
          "Night stay: Gangtok"
        ]
      },
      {
        day: "Day 2",
        title: "Gangtok Local",
        list: [
          "MG Marg",
          "Ropeway",
          "Monastery",
          "Night stay: Gangtok"
        ]
      },
      {
        day: "Day 3",
        title: "Tsomgo Lake",
        list: [
          "Baba Mandir",
          "Nathula Pass"
        ]
      },
      {
        day: "Day 4",
        title: "Gangtok → Lachung",
        list: [
          "Travel to Lachung",
          "Night stay: Lachung"
        ]
      },
      {
        day: "Day 5",
        title: "Yumthang Valley",
        list: [
          "Zero Point",
          "Night stay: Lachung"
        ]
      },
      {
        day: "Day 6",
        title: "Lachung → Gangtok",
        list: [
          "Return to Gangtok",
          "Night stay: Gangtok"
        ]
      },
      {
        day: "Day 7",
        title: "Gangtok → Pelling",
        list: [
          "Sky Walk",
          "Pemayangtse Monastery",
          "Night stay: Pelling"
        ]
      },
      {
        day: "Day 8",
        title: "Return to Sivasagar",
        list: [
          "Tour Ends"
        ]
      }
    ]
  },
  {
    key: "Explore Mizoram",
    title: "EXPLORE MIZORAM",
    duration: "6 Days / 5 Nights",
    price: "₹15,000",
    vehicle: "SUV / Maxx",
    region: "Mizoram",
    badge: "Hill Station",
    class: "pkg-v2",
    includes: [
      "Solomon's Temple Aizawl",
      "Reiek Peak Trek",
      "Vantawng Falls & Tamdil Lake"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Aizawl",
        list: [
          "Travel to Aizawl",
          "Night stay: Aizawl"
        ]
      },
      {
        day: "Day 2",
        title: "Aizawl Local",
        list: [
          "Solomon's Temple",
          "Local Market",
          "Night stay: Aizawl"
        ]
      },
      {
        day: "Day 3",
        title: "Reiek Village",
        list: [
          "Explore Reiek Village & Peak",
          "Night stay: Reiek"
        ]
      },
      {
        day: "Day 4",
        title: "Vantawng Falls",
        list: [
          "Visit Vantawng Falls & scenic spots",
          "Night stay: Thenzawl"
        ]
      },
      {
        day: "Day 5",
        title: "Tamdil Lake",
        list: [
          "Tamdil Lake boating and relaxation",
          "Night stay: Aizawl"
        ]
      },
      {
        day: "Day 6",
        title: "Return to Sivasagar",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Explore Tripura",
    title: "EXPLORE TRIPURA",
    duration: "5 Days / 4 Nights",
    price: "₹11,800",
    vehicle: "SUV / Ertiga",
    region: "Tripura",
    badge: "Heritage",
    class: "pkg-v4",
    includes: [
      "Ujjayanta Palace Heritage",
      "Neermahal Water Palace",
      "Unakoti Hill Rock Carvings"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Agartala",
        list: [
          "Travel to Agartala",
          "Night stay: Agartala"
        ]
      },
      {
        day: "Day 2",
        title: "Agartala Local",
        list: [
          "Ujjayanta Palace",
          "Heritage Park",
          "Night stay: Agartala"
        ]
      },
      {
        day: "Day 3",
        title: "Neermahal",
        list: [
          "Neermahal Water Palace tour",
          "Night stay: Melaghar"
        ]
      },
      {
        day: "Day 4",
        title: "Unakoti Rock Carvings",
        list: [
          "Visit Unakoti Rock Sculptures",
          "Night stay: Agartala"
        ]
      },
      {
        day: "Day 5",
        title: "Return to Sivasagar",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Explore Manipur",
    title: "EXPLORE MANIPUR",
    duration: "5 Days / 4 Nights",
    price: "₹12,800",
    vehicle: "SUV / Ertiga",
    region: "Manipur",
    badge: "Lakeside",
    class: "pkg-v5",
    includes: [
      "Kangla Fort Imphal",
      "Ima Keithel (Women's Market)",
      "Loktak Lake Sendra Island"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar → Imphal",
        list: [
          "Travel to Imphal",
          "Night stay: Imphal"
        ]
      },
      {
        day: "Day 2",
        title: "Imphal Local",
        list: [
          "Kangla Fort",
          "Ima Market",
          "Night stay: Imphal"
        ]
      },
      {
        day: "Day 3",
        title: "Loktak Lake",
        list: [
          "Sendra Island sightseeing",
          "Boating on Loktak Lake",
          "Night stay: Sendra"
        ]
      },
      {
        day: "Day 4",
        title: "Keibul Lamjao National Park",
        list: [
          "Sangai Deer Viewing",
          "Night stay: Imphal"
        ]
      },
      {
        day: "Day 5",
        title: "Return to Sivasagar",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  }
  /* HIDE NOT DELETE OLD PACKAGES
  ,
  {
    key: "Meghalaya & Dawki Highlights",
    title: "Meghalaya & Dawki Highlights",
    duration: "4 Days / 3 Nights",
    price: "₹9,800",
    vehicle: "Private Ertiga",
    region: "Meghalaya",
    badge: "Scenic",
    class: "pkg-v3",
    includes: [
      "Umiam Lake & Police Bazaar",
      "Cherrapunji Waterfalls Tour",
      "Dawki Umngot River Boating"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Shillong & Umiam Lake",
        list: [
          "05:00 AM – Depart from Sivasagar",
          "01:00 PM – Reach Shillong",
          "03:00 PM – Umiam Lake",
          "06:00 PM – Police Bazaar",
          "Overnight Shillong"
        ]
      },
      {
        day: "Day 2",
        title: "Cherrapunji Tour",
        list: [
          "08:00 AM – Cherrapunji Tour",
          "Nohkalikai Falls",
          "Mawsmai Cave",
          "Seven Sisters Falls",
          "Overnight Cherrapunji"
        ]
      },
      {
        day: "Day 3",
        title: "Dawki & Shnongpdeng Adventure",
        list: [
          "08:00 AM – Dawki & Shnongpdeng",
          "Umngot River boating",
          "Camping & bonfire",
          "Overnight Dawki"
        ]
      },
      {
        day: "Day 4",
        title: "Mawlynnong Village & Return",
        list: [
          "Mawlynnong Village",
          "Return to Sivasagar",
          "10:00 PM – Arrival"
        ]
      }
    ]
  },
  {
    key: "Northeast Explorer",
    title: "Northeast Explorer",
    duration: "7 Days / 6 Nights",
    price: "₹16,500",
    vehicle: "SUV / Ertiga",
    region: "Assam & Meghalaya",
    badge: "Popular",
    class: "pkg-v2",
    includes: [
      "Guwahati Kamakhya & Shillong",
      "Dawki, Mawlynnong & Kaziranga",
      "Majuli Island Satra Heritage"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Shillong",
        list: [
          "Sivasagar → Guwahati → Shillong"
        ]
      },
      {
        day: "Day 2",
        title: "Shillong Local Tour",
        list: [
          "Shillong Local Tour"
        ]
      },
      {
        day: "Day 3",
        title: "Cherrapunji Exploration",
        list: [
          "Cherrapunji"
        ]
      },
      {
        day: "Day 4",
        title: "Dawki & Mawlynnong Village",
        list: [
          "Dawki & Mawlynnong"
        ]
      },
      {
        day: "Day 5",
        title: "Kaziranga National Park",
        list: [
          "Kaziranga National Park"
        ]
      },
      {
        day: "Day 6",
        title: "Majuli Island",
        list: [
          "Majuli Island"
        ]
      },
      {
        day: "Day 7",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Arunachal Highlights",
    title: "Arunachal Highlights",
    duration: "5 Days / 4 Nights",
    price: "₹19,500",
    vehicle: "SUV Ertiga / Bolero",
    region: "Arunachal",
    badge: "Adventure",
    class: "pkg-v4",
    includes: [
      "Bhalukpong & Dirang Valley",
      "Tawang Monastery & War Memorial",
      "High Altitude Madhuri Lake"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Bhalukpong",
        list: [
          "Sivasagar → Bhalukpong"
        ]
      },
      {
        day: "Day 2",
        title: "Bhalukpong to Dirang",
        list: [
          "Bhalukpong → Dirang"
        ]
      },
      {
        day: "Day 3",
        title: "Dirang to Tawang via Sela Pass",
        list: [
          "Dirang → Tawang"
        ]
      },
      {
        day: "Day 4",
        title: "Tawang Local Sightseeing",
        list: [
          "Tawang Local Sightseeing",
          "Tawang Monastery",
          "War Memorial",
          "Madhuri Lake"
        ]
      },
      {
        day: "Day 5",
        title: "Return Journey",
        list: [
          "Sela Pass → Return Journey"
        ]
      }
    ]
  },
  {
    key: "Nagaland Cultural Tour",
    title: "Nagaland Cultural Tour",
    duration: "6 Days / 5 Nights",
    price: "₹14,800",
    vehicle: "SUV Ertiga",
    region: "Nagaland",
    badge: "Cultural",
    class: "pkg-v5",
    includes: [
      "Kisama Naga Heritage Village",
      "Khonoma Eco-Green Village",
      "Dzukou Valley Alpine Trek"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Kohima",
        list: [
          "Sivasagar → Kohima"
        ]
      },
      {
        day: "Day 2",
        title: "Kisama Heritage Village",
        list: [
          "Kisama Heritage Village"
        ]
      },
      {
        day: "Day 3",
        title: "Khonoma Green Village",
        list: [
          "Khonoma Green Village"
        ]
      },
      {
        day: "Day 4",
        title: "Dzükou Valley Trek",
        list: [
          "Dzükou Valley Trek"
        ]
      },
      {
        day: "Day 5",
        title: "Kohima Local Tour",
        list: [
          "Kohima Local Tour"
        ]
      },
      {
        day: "Day 6",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Darjeeling - Gangtok Tour",
    title: "Darjeeling & Gangtok Himalayan Sojourn",
    duration: "6 Days / 5 Nights",
    price: "₹21,000",
    vehicle: "SUV Ertiga",
    region: "Sikkim",
    badge: "Scenic",
    class: "pkg-v6",
    includes: [
      "Darjeeling Tiger Hill Sunrise",
      "Gangtok Ropeway & MG Marg",
      "Tsomgo Lake & Baba Mandir"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Siliguri",
        list: [
          "Sivasagar → Siliguri"
        ]
      },
      {
        day: "Day 2",
        title: "Darjeeling Sightseeing",
        list: [
          "Darjeeling Sightseeing"
        ]
      },
      {
        day: "Day 3",
        title: "Tiger Hill Sunrise & Gangtok Transfer",
        list: [
          "Tiger Hill & Transfer to Gangtok"
        ]
      },
      {
        day: "Day 4",
        title: "Gangtok Local Tour",
        list: [
          "Gangtok Local Tour"
        ]
      },
      {
        day: "Day 5",
        title: "Tsomgo Lake & Baba Mandir",
        list: [
          "Tsomgo Lake & Baba Mandir"
        ]
      },
      {
        day: "Day 6",
        title: "Return Journey",
        list: [
          "Return Journey"
        ]
      }
    ]
  },
  {
    key: "North Sikkim Alpine Adventure",
    title: "North Sikkim Alpine Adventure",
    duration: "6 Days / 5 Nights",
    price: "₹15,200",
    vehicle: "SUV Bolero / Ertiga",
    region: "Sikkim",
    badge: "Alpine",
    class: "pkg-v3",
    includes: [
      "Lachung Yumthang Valley",
      "Gurudongmar Lake (17,800 ft)",
      "Seven Sisters Waterfall"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Gangtok",
        list: [
          "04:00 AM – Departure from Sivasagar",
          "Travel to Gangtok",
          "Evening MG Marg visit",
          "Overnight Gangtok"
        ]
      },
      {
        day: "Day 2",
        title: "Gangtok to Lachung",
        list: [
          "Gangtok → Lachung",
          "Seven Sisters Waterfall",
          "Singhik View Point",
          "Overnight Lachung"
        ]
      },
      {
        day: "Day 3",
        title: "Yumthang Valley Tour",
        list: [
          "Yumthang Valley",
          "Zero Point (optional)",
          "Return Lachung",
          "Overnight stay"
        ]
      },
      {
        day: "Day 4",
        title: "Lachung to Lachen",
        list: [
          "Lachung → Lachen",
          "Gurudongmar route sightseeing",
          "Overnight Lachen"
        ]
      },
      {
        day: "Day 5",
        title: "Gurudongmar Lake",
        list: [
          "Gurudongmar Lake",
          "Return Gangtok",
          "Evening free time"
        ]
      },
      {
        day: "Day 6",
        title: "Return to Sivasagar",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Bhutan Kingdom Tour",
    title: "Bhutan Kingdom Tour",
    duration: "7 Days / 6 Nights",
    price: "₹24,500",
    vehicle: "SUV Ertiga",
    region: "Bhutan",
    badge: "International",
    class: "pkg-v2",
    includes: [
      "Tiger's Nest Monastery Trek",
      "Thimphu Clock Tower Square",
      "Punakha Suspension Bridge"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Phuentsholing",
        list: [
          "Sivasagar → Phuentsholing",
          "Bhutan immigration formalities",
          "Overnight Phuentsholing"
        ]
      },
      {
        day: "Day 2",
        title: "Phuentsholing to Thimphu",
        list: [
          "Drive to Thimphu",
          "Memorial Chorten",
          "Clock Tower Square"
        ]
      },
      {
        day: "Day 3",
        title: "Thimphu Sightseeing",
        list: [
          "Buddha Dordenma",
          "Tashichho Dzong",
          "Overnight Thimphu"
        ]
      },
      {
        day: "Day 4",
        title: "Thimphu to Punakha",
        list: [
          "Thimphu → Punakha",
          "Punakha Suspension Bridge",
          "Punakha Dzong"
        ]
      },
      {
        day: "Day 5",
        title: "Punakha to Paro",
        list: [
          "Punakha → Paro",
          "Local sightseeing"
        ]
      },
      {
        day: "Day 6",
        title: "Tiger's Nest Trek",
        list: [
          "Tiger's Nest Monastery Trek",
          "Cultural show",
          "Overnight Paro"
        ]
      },
      {
        day: "Day 7",
        title: "Return Journey",
        list: [
          "Return journey"
        ]
      }
    ]
  },
  {
    key: "Manas Wildlands Safari",
    title: "Manas Wildlands Safari",
    duration: "4 Days / 3 Nights",
    price: "₹8,800",
    vehicle: "SUV / Sedan",
    region: "Assam",
    badge: "Wilderness",
    class: "pkg-v1",
    includes: [
      "Elephant & Jeep Safaris",
      "Guided Forest Nature Walk",
      "Bodo Tribal Village Visit"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Manas",
        list: [
          "Sivasagar → Manas",
          "Resort check-in",
          "Nature walk"
        ]
      },
      {
        day: "Day 2",
        title: "Safari Day",
        list: [
          "Early Morning Elephant Safari",
          "Jungle Jeep Safari",
          "Cultural program"
        ]
      },
      {
        day: "Day 3",
        title: "Cultural & River Exploration",
        list: [
          "Bird Watching Tour",
          "Bodo Village Visit",
          "River side leisure"
        ]
      },
      {
        day: "Day 4",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Assam Riverine Heritage",
    title: "Assam Riverine Heritage",
    duration: "5 Days / 4 Nights",
    price: "₹11,500",
    vehicle: "SUV Ertiga",
    region: "Assam",
    badge: "Cultural",
    class: "pkg-v5",
    includes: [
      "Majuli Island Ferry & Satras",
      "Samaguri Mask Village Visit",
      "Kaziranga Safari & River Cruise"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Majuli",
        list: [
          "Sivasagar → Majuli",
          "Ferry crossing",
          "Satra visits"
        ]
      },
      {
        day: "Day 2",
        title: "Satra Cultural Day",
        list: [
          "Auniati Satra",
          "Samaguri Mask Village",
          "Cultural performance"
        ]
      },
      {
        day: "Day 3",
        title: "Majuli to Kaziranga",
        list: [
          "Majuli → Kaziranga",
          "Evening Orchid Park"
        ]
      },
      {
        day: "Day 4",
        title: "Kaziranga Safari",
        list: [
          "Jeep Safari",
          "Brahmaputra River Cruise"
        ]
      },
      {
        day: "Day 5",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Wetlands & Canyons",
    title: "Wetlands & Canyons",
    duration: "6 Days / 5 Nights",
    price: "₹14,200",
    vehicle: "SUV Ertiga",
    region: "Meghalaya",
    badge: "Scenic",
    class: "pkg-v3",
    includes: [
      "Mawsynram Caves Exploration",
      "Laitlum Canyon Sightseeing",
      "Double Decker Root Bridge Trek"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Shillong",
        list: [
          "Sivasagar → Shillong"
        ]
      },
      {
        day: "Day 2",
        title: "Mawsynram Tour",
        list: [
          "Mawsynram",
          "Mawjymbuin Cave"
        ]
      },
      {
        day: "Day 3",
        title: "Laitlum & Shillong Peak",
        list: [
          "Laitlum Canyon",
          "Shillong Peak"
        ]
      },
      {
        day: "Day 4",
        title: "Root Bridge Trek",
        list: [
          "Double Decker Root Bridge Trek",
          "Overnight Cherrapunji"
        ]
      },
      {
        day: "Day 5",
        title: "Cherrapunji Waterfalls",
        list: [
          "Nohkalikai Falls",
          "Seven Sisters Falls"
        ]
      },
      {
        day: "Day 6",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Gateway to Assam",
    title: "Gateway to Assam",
    duration: "4 Days / 3 Nights",
    price: "₹8,900",
    vehicle: "Sedan / Ertiga",
    region: "Assam",
    badge: "Quick Gateway",
    class: "pkg-v1",
    includes: [
      "Kamakhya Temple Darshan",
      "Kaziranga National Park Tour",
      "Sualkuchi Silk Village Walk"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Guwahati",
        list: [
          "Sivasagar → Guwahati",
          "Kamakhya Temple",
          "Brahmaputra Riverfront"
        ]
      },
      {
        day: "Day 2",
        title: "Guwahati to Kaziranga",
        list: [
          "Kaziranga National Park",
          "Evening cultural show"
        ]
      },
      {
        day: "Day 3",
        title: "Sualkuchi Tour",
        list: [
          "Sualkuchi Silk Village",
          "Local shopping"
        ]
      },
      {
        day: "Day 4",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Tripura Royal Heritage",
    title: "Tripura Royal Heritage",
    duration: "5 Days / 4 Nights",
    price: "₹12,500",
    vehicle: "SUV Ertiga",
    region: "Tripura",
    badge: "Royal",
    class: "pkg-v4",
    includes: [
      "Ujjayanta Palace Heritage Walk",
      "Neermahal Water Palace Tour",
      "Unakoti Hill Rock Cut Reliefs"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Agartala",
        list: [
          "Sivasagar → Agartala"
        ]
      },
      {
        day: "Day 2",
        title: "Agartala Sightseeing",
        list: [
          "Ujjayanta Palace",
          "Heritage Walk"
        ]
      },
      {
        day: "Day 3",
        title: "Neermahal Palace",
        list: [
          "Neermahal Water Palace",
          "Rudrasagar Lake"
        ]
      },
      {
        day: "Day 4",
        title: "Unakoti Hill Carvings",
        list: [
          "Unakoti Rock Sculptures",
          "Local market visit"
        ]
      },
      {
        day: "Day 5",
        title: "Return Journey",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Nagaland Tribal & Wilderness Expedition",
    title: "Nagaland Tribal & Wilderness Expedition",
    duration: "13 Days / 12 Nights",
    price: "₹32,000",
    vehicle: "4x4 Bolero / Ertiga",
    region: "Nagaland",
    badge: "Explorer",
    class: "pkg-v5",
    includes: [
      "Hornbill Kisama & Khonoma Village",
      "Dzukou Valley Trek & Camping",
      "Mokokchung Ao & Mon Konyak Tribes"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Kohima",
        list: [
          "Sivasagar → Kohima"
        ]
      },
      {
        day: "Day 2",
        title: "Kohima Sights",
        list: [
          "Kohima War Cemetery",
          "Cathedral Church"
        ]
      },
      {
        day: "Day 3",
        title: "Kisama Heritage Village",
        list: [
          "Kisama Heritage Village"
        ]
      },
      {
        day: "Day 4",
        title: "Khonoma Green Village",
        list: [
          "Khonoma Green Village"
        ]
      },
      {
        day: "Day 5-6",
        title: "Dzükou Valley Trek & Camping",
        list: [
          "Dzükou Valley Trek & Camping"
        ]
      },
      {
        day: "Day 7-8",
        title: "Mokokchung Ao Naga Culture",
        list: [
          "Mokokchung",
          "Ao Naga Culture"
        ]
      },
      {
        day: "Day 9-10",
        title: "Mon District Konyak Villages",
        list: [
          "Mon District",
          "Konyak Head Hunter Villages"
        ]
      },
      {
        day: "Day 11",
        title: "Longwa Village Border Excursion",
        list: [
          "Longwa Village"
        ]
      },
      {
        day: "Day 12",
        title: "Mon to Kohima Return",
        list: [
          "Return to Kohima"
        ]
      },
      {
        day: "Day 13",
        title: "Return to Sivasagar",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  },
  {
    key: "Double Park & Hills",
    title: "Double Park & Hills",
    duration: "6 Days / 5 Nights",
    price: "₹15,800",
    vehicle: "SUV Ertiga",
    region: "Assam & Meghalaya",
    badge: "Eco-Tour",
    class: "pkg-v6",
    includes: [
      "Kaziranga Wildlife Safaris",
      "Shillong Peak & Elephant Falls",
      "Dawki Umngot River Boating"
    ],
    days: [
      {
        day: "Day 1",
        title: "Sivasagar to Kaziranga",
        list: [
          "Sivasagar → Kaziranga",
          "Evening cultural program"
        ]
      },
      {
        day: "Day 2",
        title: "Kaziranga to Shillong",
        list: [
          "Jeep Safari",
          "Transfer to Shillong"
        ]
      },
      {
        day: "Day 3",
        title: "Shillong Sights",
        list: [
          "Shillong Peak",
          "Elephant Falls"
        ]
      },
      {
        day: "Day 4",
        title: "Dawki Day",
        list: [
          "Dawki",
          "Umngot River"
        ]
      },
      {
        day: "Day 5",
        title: "Laitlum & Police Bazaar",
        list: [
          "Laitlum Canyon",
          "Police Bazaar"
        ]
      },
      {
        day: "Day 6",
        title: "Return to Sivasagar",
        list: [
          "Return to Sivasagar"
        ]
      }
    ]
  }
  */
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = packagesData;
}
