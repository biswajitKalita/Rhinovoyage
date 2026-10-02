import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      extendBodyBehindAppBar: true,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: AppBar(
              backgroundColor: AppTheme.primaryGreen.withOpacity(0.85),
              elevation: 0,
              centerTitle: false,
              title: Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: Image.asset('assets/images/logo.png', height: 45, fit: BoxFit.contain),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  },
                  child: Text(
                    'Login',
                    style: GoogleFonts.nunito(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.primaryOrange, Color(0xFFFF8C42)],
                      ),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryOrange.withOpacity(0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      ),
                      child: const Text('Book Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeroSection(context),
            _buildMarqueeStrip(),
            const SizedBox(height: 40),
            _buildAboutSection(context),
            const SizedBox(height: 60),
            _buildPackagesSection(context),
            const SizedBox(height: 60),
            _buildFleetSection(context),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    final height = MediaQuery.of(context).size.height * 0.85;
    return SizedBox(
      height: height,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image with Ken Burns effect simulation (scaled up slightly)
          Transform.scale(
            scale: 1.05,
            child: Image.asset(
              'assets/images/sivadol.jpg',
              fit: BoxFit.cover,
            ),
          ),
          // Gradient Overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppTheme.primaryGreen.withOpacity(0.95),
                  AppTheme.primaryGreen.withOpacity(0.6),
                  AppTheme.primaryGreen.withOpacity(0.95),
                ],
              ),
            ),
          ),
          // Content
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Text(
                      'EXPLORE THE UNEXPLORED',
                      style: GoogleFonts.nunito(
                        color: AppTheme.lightOrange,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 3,
                        fontSize: 11,
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  Text(
                    'Discover Northeast India\'s',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.playfairDisplay(
                      color: Colors.white,
                      fontSize: 42,
                      height: 1.1,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Majestic Beauty',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.playfairDisplay(
                      color: AppTheme.primaryOrange,
                      fontSize: 46,
                      height: 1.1,
                      fontStyle: FontStyle.italic,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Text(
                      'Assam\'s premier travel partner. Rent a premium car or book custom heritage tours with us today.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.nunito(
                        color: Colors.white.withOpacity(0.85),
                        fontSize: 16,
                        height: 1.6,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  _buildHeroButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroButtons() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primaryOrange, Color(0xFFFF8C42)],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryOrange.withOpacity(0.5),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Book Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(width: 16),
        OutlinedButton(
          onPressed: () {},
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.white,
            side: BorderSide(color: Colors.white.withOpacity(0.5), width: 1.5),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: const Row(
            children: [
              Text('Packages', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              SizedBox(width: 8),
              Icon(Icons.arrow_forward_rounded, size: 18),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMarqueeStrip() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: const BoxDecoration(
        color: AppTheme.primaryGreen,
        border: Border(bottom: BorderSide(color: AppTheme.primaryOrange, width: 3)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: const [
            _MarqueeItem('Sivasagar'),
            _MarqueeItem('Kaziranga'),
            _MarqueeItem('Majuli Island'),
            _MarqueeItem('Guwahati'),
            _MarqueeItem('Dibrugarh'),
            _MarqueeItem('Haflong Hills'),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader('Who We Are', 'Northeast India\'s Premier', 'Travel Partner'),
          const SizedBox(height: 32),
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                height: 280,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 30,
                      offset: const Offset(0, 15),
                    ),
                  ],
                  image: DecorationImage(
                    image: const AssetImage('assets/images/rang-ghar.jpg'),
                    fit: BoxFit.cover,
                    colorFilter: ColorFilter.mode(
                      AppTheme.primaryGreen.withOpacity(0.3),
                      BlendMode.darken,
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: -20,
                right: 20,
                left: 40,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryOrange.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.security, color: AppTheme.primaryOrange),
                          ),
                          const SizedBox(width: 16),
                          Text(
                            'Explore Safely',
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryGreen,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'RhinoVoyage opens up the wonders of Assam with sanitized premium fleets and expert local guides.',
                        style: GoogleFonts.nunito(
                          fontSize: 15,
                          color: Colors.grey.shade700,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildPackagesSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: _buildSectionHeader('Popular Packages', 'Curated Tour', 'Circuits'),
        ),
        const SizedBox(height: 24),
        SizedBox(
          height: 280,
          child: ListView(
            physics: const BouncingScrollPhysics(),
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            children: [
              _buildPackageCard('Sivasagar Heritage', '2 Days / 1 Night', 'assets/images/sivadol.jpg'),
              _buildPackageCard('Kaziranga Safari', '3 Days / 2 Nights', 'assets/images/rang-ghar.jpg'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPackageCard(String title, String duration, String imagePath) {
    return Container(
      width: 260,
      margin: const EdgeInsets.only(right: 20, bottom: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            child: Image.asset(imagePath, height: 140, width: double.infinity, fit: BoxFit.cover),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  duration,
                  style: GoogleFonts.nunito(
                    color: AppTheme.primaryOrange,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: GoogleFonts.playfairDisplay(
                    color: AppTheme.primaryGreen,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFleetSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: _buildSectionHeader('Our Fleet', 'Rent Our Premium', 'Cars'),
        ),
        const SizedBox(height: 32),
        SizedBox(
          height: 180,
          child: ListView(
            physics: const BouncingScrollPhysics(),
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            children: [
              _buildFleetCard('assets/images/sedan.png', 'SEDAN'),
              _buildFleetCard('assets/images/luxury.png', 'LUXURY'),
              _buildFleetCard('assets/images/suv.png', 'SUV'),
              _buildFleetCard('assets/images/bus.png', 'BUS'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFleetCard(String imagePath, String title) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 20, bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(imagePath, height: 75, fit: BoxFit.contain),
          const SizedBox(height: 16),
          Text(
            title,
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800, 
              color: AppTheme.primaryGreen,
              letterSpacing: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String label, String title, String emphasis) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 30,
              height: 2,
              color: AppTheme.primaryOrange,
              margin: const EdgeInsets.only(right: 12),
            ),
            Text(
              label.toUpperCase(),
              style: GoogleFonts.nunito(
                color: AppTheme.primaryOrange,
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
                fontSize: 12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(text: '$title\n'),
              TextSpan(
                text: emphasis,
                style: const TextStyle(
                  fontStyle: FontStyle.italic, 
                  color: AppTheme.primaryOrange,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
            style: GoogleFonts.playfairDisplay(
              fontSize: 36,
              height: 1.2,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryGreen,
            ),
          ),
        ),
      ],
    );
  }
}

class _MarqueeItem extends StatelessWidget {
  final String text;
  const _MarqueeItem(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Row(
        children: [
          const Icon(Icons.star, color: AppTheme.primaryOrange, size: 12),
          const SizedBox(width: 12),
          Text(
            text,
            style: GoogleFonts.nunito(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}
