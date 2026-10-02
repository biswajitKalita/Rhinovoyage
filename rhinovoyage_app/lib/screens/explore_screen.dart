import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../data/packages_data.dart';
import 'booking_engine_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Our Services',
          style: GoogleFonts.playfairDisplay(
            color: AppTheme.primaryGreen,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primaryOrange,
          indicatorWeight: 3,
          labelColor: AppTheme.primaryGreen,
          unselectedLabelColor: Colors.grey.shade500,
          labelStyle: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Tour Packages'),
            Tab(text: 'Car Rentals'),
            Tab(text: 'Custom Tours'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPackagesTab(),
          _buildCarsTab(),
          _buildCustomTab(),
        ],
      ),
    );
  }

  // ==============================
  // TAB 1: TOUR PACKAGES
  // ==============================
  Widget _buildPackagesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: const TextField(
              decoration: InputDecoration(
                hintText: 'Search destinations...',
                border: InputBorder.none,
                icon: Icon(Icons.search, color: Colors.grey),
              ),
            ),
          ),
          const SizedBox(height: 24),
          ...allPackages.map((pkg) => _buildInteractivePackageCard(context, pkg)).toList(),
        ],
      ),
    );
  }

  String _getImageForRegion(String region) {
    if (region.contains('Assam')) return 'assets/images/sivadol.jpg';
    if (region.contains('Meghalaya') || region.contains('Arunachal')) return 'assets/images/rang-ghar.jpg';
    return 'assets/images/sivadol.jpg'; // fallback
  }

  Widget _buildInteractivePackageCard(BuildContext context, TourPackage pkg) {
    final imagePath = _getImageForRegion(pkg.region);
    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
          builder: (context) => _buildPackageDetailsSheet(context, pkg, imagePath),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 5)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              child: Container(
                height: 180,
                color: Colors.grey.shade300,
                // Replace with Image.asset in a real app if assets exist
                child: Center(child: Icon(Icons.image, size: 50, color: Colors.grey.shade400)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppTheme.primaryOrange.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                        child: Text(pkg.duration, style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      Text('${pkg.price}', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryGreen)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(pkg.title, style: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(pkg.region, style: GoogleFonts.nunito(color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPackageDetailsSheet(BuildContext context, TourPackage pkg, String imagePath) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            height: 200,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Center(child: Icon(Icons.image, size: 50, color: Colors.grey.shade400)),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppTheme.primaryOrange.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                        child: Text(pkg.duration, style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      Text('From ${pkg.price}', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 20, color: AppTheme.primaryGreen)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(pkg.title, style: GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                  const SizedBox(height: 8),
                  Text(pkg.includes.join(' • '), style: GoogleFonts.nunito(fontSize: 15, color: Colors.grey.shade700, height: 1.5)),
                  const SizedBox(height: 24),
                  Text('Destinations Included', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryGreen)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: pkg.includes.map((d) => Chip(
                      label: Text(d),
                      backgroundColor: Colors.grey.shade100,
                      labelStyle: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.bold),
                    )).toList(),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (context) => BookingEngineScreen(initialPackage: pkg.title, selectedServiceType: 'tour_package')));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Book This Package', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==============================
  // TAB 2: CAR RENTALS
  // ==============================
  Widget _buildCarsTab() {
    final cars = [
      {'name': 'Sedan (Swift Dzire or similar)', 'type': '4 Seater + Driver', 'price': '2,500/day'},
      {'name': 'SUV (Innova Crysta)', 'type': '6 Seater + Driver', 'price': '4,500/day'},
      {'name': 'Tempo Traveller', 'type': '12 Seater + Driver', 'price': '7,000/day'},
      {'name': 'Premium SUV (Fortuner)', 'type': '6 Seater + Driver', 'price': '8,500/day'},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.primaryGreen, AppTheme.secondaryGreen]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Premium Fleet', style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 8),
                Text('Rent a car with a verified local driver for your Northeast journey.', style: GoogleFonts.nunito(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          ...cars.map((car) => Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(car['name']!, style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                    Text('₹${car['price']}', style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(car['type']!, style: GoogleFonts.nunito(color: Colors.grey.shade600)),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => BookingEngineScreen(initialVehicle: car['name'], selectedServiceType: 'car_rental')));
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primaryGreen,
                      side: const BorderSide(color: AppTheme.primaryGreen),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Book This Vehicle'),
                  ),
                ),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  // ==============================
  // TAB 3: CUSTOM TOURS
  // ==============================
  Widget _buildCustomTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.explore, size: 40, color: AppTheme.primaryOrange),
                const SizedBox(height: 16),
                Text('Design Your Own Journey', style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                const SizedBox(height: 12),
                Text('Don\'t see a package that fits your exact needs? We can design a custom itinerary specifically for you or your group.', style: GoogleFonts.nunito(color: Colors.grey.shade700, fontSize: 15, height: 1.5)),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const BookingEngineScreen(selectedServiceType: 'custom_tour', initialVehicle: 'Custom')));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryOrange,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Request Custom Tour', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
