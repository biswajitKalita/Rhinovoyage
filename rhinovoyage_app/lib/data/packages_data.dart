class TourPackage {
  final String id;
  final String title;
  final String duration;
  final String price;
  final String vehicle;
  final String region;
  final String badge;
  final List<String> includes;
  final List<dynamic> days;

  TourPackage({
    required this.id,
    required this.title,
    required this.duration,
    required this.price,
    required this.vehicle,
    required this.region,
    required this.badge,
    required this.includes,
    required this.days,
  });
}

final List<TourPackage> allPackages = [
  TourPackage(
    id: 'Sivasagar Heritage Trail',
    title: 'Sivasagar Heritage Trail',
    duration: '2 Days / 1 Night',
    price: '₹1,999*',
    vehicle: 'Private Vehicle',
    region: 'Assam',
    badge: 'Best Seller',
    includes: ["Rang Ghar & Talatal Ghar Tour","Kareng Ghar Sightseeing","Charaideo Maidams Heritage"],
    days: [{"day":"Day 1","title":"Ahom Capital & Royal Palaces","list":["08:00 AM – Pickup from Sivasagar town","09:00 AM – Rang Ghar","11:00 AM – Talatal Ghar","01:00 PM – Lunch","03:00 PM – Kareng Ghar","05:30 PM – Joysagar Lake sunset","08:00 PM – Dinner & overnight stay"]},{"day":"Day 2","title":"Charaideo Maidams & Departure","list":["07:00 AM – Breakfast","08:30 AM – Charaideo Maidams","12:00 PM – Lunch","02:00 PM – Drop at Sivasagar"]}],
  ),
  TourPackage(
    id: 'Explore Assam',
    title: 'EXPLORE ASSAM',
    duration: '7 Days / 6 Nights',
    price: '₹16,500',
    vehicle: 'SUV / Ertiga',
    region: 'Assam',
    badge: 'Eco-Tour',
    includes: ["Kaziranga Wildlife Safaris","Brahmaputra Cruise & Umananda","Majuli Island Satra Heritage"],
    days: [{"day":"Day 1","title":"Sivasagar → Kaziranga","list":["Pickup from Sivasagar","Visit Orchid Park","Evening cultural show","Night stay: Kaziranga"]},{"day":"Day 2","title":"Kaziranga","list":["Early morning Jeep Safari","Elephant Safari","Central Range sightseeing","Night stay: Kaziranga"]},{"day":"Day 3","title":"Kaziranga → Guwahati","list":["Visit Umananda Island","Brahmaputra River Cruise","Night stay: Guwahati"]},{"day":"Day 4","title":"Guwahati","list":["Visit Kamakhya Temple","Assam State Museum","Srimanta Sankardev Kalakshetra","Night stay: Guwahati"]},{"day":"Day 5","title":"Guwahati → Shillong (Day Excursion)","list":["Umiam Lake","Police Bazaar","Return to Guwahati","Night stay: Guwahati"]},{"day":"Day 6","title":"Guwahati → Majuli","list":["Ferry to Majuli","Satra visits","Sunset photography","Night stay: Majuli"]},{"day":"Day 7","title":"Majuli → Sivasagar","list":["Return journey","Visit Charaideo Maidam","Tour Ends"]}],
  ),
  TourPackage(
    id: 'Explore Meghalaya',
    title: 'EXPLORE MEGHALAYA',
    duration: '6 Days / 5 Nights',
    price: '₹14,800',
    vehicle: 'SUV / Ertiga',
    region: 'Meghalaya',
    badge: 'Scenic',
    includes: ["Umiam Lake & Police Bazaar","Cherrapunji Falls & Caves","Dawki Umngot River Boating"],
    days: [{"day":"Day 1","title":"Sivasagar → Shillong","list":["Umiam Lake","Police Bazaar","Night stay: Shillong"]},{"day":"Day 2","title":"Shillong Local","list":["Elephant Falls","Shillong Peak","Ward's Lake","Night stay: Shillong"]},{"day":"Day 3","title":"Shillong → Cherrapunji","list":["Nohkalikai Falls","Seven Sisters Falls","Mawsmai Cave","Night stay: Cherrapunji"]},{"day":"Day 4","title":"Living Root Bridge Trek","list":["Double Decker Root Bridge","Rainbow Falls","Night stay: Cherrapunji"]},{"day":"Day 5","title":"Cherrapunji → Dawki","list":["Crystal Clear Umngot River","India-Bangladesh Border","Shnongpdeng","Night stay: Dawki"]},{"day":"Day 6","title":"Dawki → Sivasagar","list":["Tour Ends"]}],
  ),
  TourPackage(
    id: 'Explore Arunachal',
    title: 'EXPLORE ARUNACHAL PRADESH',
    duration: '8 Days / 7 Nights',
    price: '₹19,800',
    vehicle: '4x4 SUV / Ertiga',
    region: 'Arunachal',
    badge: 'Adventure',
    includes: ["Sela Pass & Tawang Monastery","Dirang Valley & Sangti Valley","Bum La Pass & Madhuri Lake"],
    days: [{"day":"Day 1","title":"Sivasagar → Bhalukpong","list":["Night stay"]},{"day":"Day 2","title":"Bhalukpong → Dirang","list":["Orchid Centre","Sangti Valley","Night stay: Dirang"]},{"day":"Day 3","title":"Dirang → Tawang","list":["Sela Pass","Jaswant Garh","Night stay: Tawang"]},{"day":"Day 4","title":"Tawang Local","list":["Tawang Monastery","War Memorial","Night stay"]},{"day":"Day 5","title":"Bum La Pass Excursion","list":["Bum La","Madhuri Lake","PTSO Lake","Night stay"]},{"day":"Day 6","title":"Tawang → Dirang","list":["Night stay"]},{"day":"Day 7","title":"Dirang → Tezpur","list":["Night stay"]},{"day":"Day 8","title":"Tezpur → Sivasagar","list":["Tour Ends"]}],
  ),
  TourPackage(
    id: 'Explore Nagaland',
    title: 'EXPLORE NAGALAND',
    duration: '5 Days / 4 Nights',
    price: '₹12,500',
    vehicle: 'SUV / Bolero',
    region: 'Nagaland',
    badge: 'Cultural',
    includes: ["Kohima War Cemetery","Khonoma Eco-Green Village","Dzukou Valley Alpine Trek"],
    days: [{"day":"Day 1","title":"Sivasagar → Kohima","list":["Night stay"]},{"day":"Day 2","title":"Kohima Local","list":["War Cemetery","Cathedral Church","Night stay"]},{"day":"Day 3","title":"Khonoma Village","list":["Traditional Naga Culture","Night stay"]},{"day":"Day 4","title":"Dzukou Valley Trek","list":["Full day trek","Night stay"]},{"day":"Day 5","title":"Return to Sivasagar","list":["Tour Ends"]}],
  ),
  TourPackage(
    id: 'Explore Sikkim',
    title: 'EXPLORE SIKKIM',
    duration: '8 Days / 7 Nights',
    price: '₹21,500',
    vehicle: 'SUV / Ertiga',
    region: 'Sikkim',
    badge: 'Himalayan',
    includes: ["Gangtok MG Marg & Ropeway","Tsomgo Lake & Baba Mandir","Yumthang Valley & Pelling Skywalk"],
    days: [{"day":"Day 1","title":"Sivasagar → Gangtok","list":["Travel to Gangtok","Night stay: Gangtok"]},{"day":"Day 2","title":"Gangtok Local","list":["MG Marg","Ropeway","Monastery","Night stay: Gangtok"]},{"day":"Day 3","title":"Tsomgo Lake","list":["Baba Mandir","Nathula Pass"]},{"day":"Day 4","title":"Gangtok → Lachung","list":["Travel to Lachung","Night stay: Lachung"]},{"day":"Day 5","title":"Yumthang Valley","list":["Zero Point","Night stay: Lachung"]},{"day":"Day 6","title":"Lachung → Gangtok","list":["Return to Gangtok","Night stay: Gangtok"]},{"day":"Day 7","title":"Gangtok → Pelling","list":["Sky Walk","Pemayangtse Monastery","Night stay: Pelling"]},{"day":"Day 8","title":"Return to Sivasagar","list":["Tour Ends"]}],
  ),
  TourPackage(
    id: 'Explore Mizoram',
    title: 'EXPLORE MIZORAM',
    duration: '6 Days / 5 Nights',
    price: '₹15,000',
    vehicle: 'SUV / Maxx',
    region: 'Mizoram',
    badge: 'Hill Station',
    includes: ["Solomon's Temple Aizawl","Reiek Peak Trek","Vantawng Falls & Tamdil Lake"],
    days: [{"day":"Day 1","title":"Sivasagar → Aizawl","list":["Travel to Aizawl","Night stay: Aizawl"]},{"day":"Day 2","title":"Aizawl Local","list":["Solomon's Temple","Local Market","Night stay: Aizawl"]},{"day":"Day 3","title":"Reiek Village","list":["Explore Reiek Village & Peak","Night stay: Reiek"]},{"day":"Day 4","title":"Vantawng Falls","list":["Visit Vantawng Falls & scenic spots","Night stay: Thenzawl"]},{"day":"Day 5","title":"Tamdil Lake","list":["Tamdil Lake boating and relaxation","Night stay: Aizawl"]},{"day":"Day 6","title":"Return to Sivasagar","list":["Return to Sivasagar"]}],
  ),
  TourPackage(
    id: 'Explore Tripura',
    title: 'EXPLORE TRIPURA',
    duration: '5 Days / 4 Nights',
    price: '₹11,800',
    vehicle: 'SUV / Ertiga',
    region: 'Tripura',
    badge: 'Heritage',
    includes: ["Ujjayanta Palace Heritage","Neermahal Water Palace","Unakoti Hill Rock Carvings"],
    days: [{"day":"Day 1","title":"Sivasagar → Agartala","list":["Travel to Agartala","Night stay: Agartala"]},{"day":"Day 2","title":"Agartala Local","list":["Ujjayanta Palace","Heritage Park","Night stay: Agartala"]},{"day":"Day 3","title":"Neermahal","list":["Neermahal Water Palace tour","Night stay: Melaghar"]},{"day":"Day 4","title":"Unakoti Rock Carvings","list":["Visit Unakoti Rock Sculptures","Night stay: Agartala"]},{"day":"Day 5","title":"Return to Sivasagar","list":["Return to Sivasagar"]}],
  ),
  TourPackage(
    id: 'Explore Manipur',
    title: 'EXPLORE MANIPUR',
    duration: '5 Days / 4 Nights',
    price: '₹12,800',
    vehicle: 'SUV / Ertiga',
    region: 'Manipur',
    badge: 'Lakeside',
    includes: ["Kangla Fort Imphal","Ima Keithel (Women's Market)","Loktak Lake Sendra Island"],
    days: [{"day":"Day 1","title":"Sivasagar → Imphal","list":["Travel to Imphal","Night stay: Imphal"]},{"day":"Day 2","title":"Imphal Local","list":["Kangla Fort","Ima Market","Night stay: Imphal"]},{"day":"Day 3","title":"Loktak Lake","list":["Sendra Island sightseeing","Boating on Loktak Lake","Night stay: Sendra"]},{"day":"Day 4","title":"Keibul Lamjao National Park","list":["Sangai Deer Viewing","Night stay: Imphal"]},{"day":"Day 5","title":"Return to Sivasagar","list":["Return to Sivasagar"]}],
  ),
];
