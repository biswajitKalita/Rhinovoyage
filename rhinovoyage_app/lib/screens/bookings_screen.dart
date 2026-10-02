import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/booking_service.dart';
import '../services/auth_service.dart';
import 'invoice_screen.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  bool isLoading = true;
  List<dynamic> bookings = [];
  Map<String, dynamic>? currentUser;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => isLoading = true);
    final user = await AuthService.getCurrentUser();
    
    if (user != null) {
      final result = await BookingService.getMyBookings();
      if (result['success']) {
        if (mounted) {
          setState(() {
            bookings = result['bookings'];
            currentUser = user;
            isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => isLoading = false);
      }
    } else {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8F9FA),
        body: Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen)),
      );
    }

    if (currentUser == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8F9FA),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: Text('Dashboard', style: GoogleFonts.playfairDisplay(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold)),
          centerTitle: false,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline, size: 48, color: Colors.grey),
              const SizedBox(height: 16),
              Text('Login to view your bookings', style: GoogleFonts.nunito(fontSize: 16, color: Colors.grey.shade600)),
            ],
          ),
        ),
      );
    }

    int total = bookings.length;
    int approved = bookings.where((b) => b['status'] == 'Approved').length;
    int completed = bookings.where((b) => b['status'] == 'Completed').length;
    int pending = bookings.where((b) => b['status'] == 'Pending').length;

    String userName = currentUser?['name']?.split(' ')?[0] ?? 'Traveler';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Dashboard',
          style: GoogleFonts.playfairDisplay(
            color: AppTheme.primaryGreen,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppTheme.primaryGreen,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome Banner
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryGreen, AppTheme.secondaryGreen],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: AppTheme.primaryGreen.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                child: Stack(
                  children: [
                    Positioned(
                      right: -20,
                      bottom: -30,
                      child: Opacity(
                        opacity: 0.1,
                        child: Text('🦏', style: TextStyle(fontSize: 80)),
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome back, $userName!',
                          style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Track your heritage trips, manage car assignments, and plan your next northeast tour with RhinoVoyage.',
                          style: GoogleFonts.nunito(color: Colors.white.withOpacity(0.85), fontSize: 14, height: 1.5),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              // Stats Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.6,
                children: [
                  _buildStatCard('Total Trips', total.toString(), Icons.map, Colors.green.shade100, Colors.green.shade800),
                  _buildStatCard('Approved', approved.toString(), Icons.directions_car, Colors.blue.shade100, Colors.blue.shade800),
                  _buildStatCard('Completed', completed.toString(), Icons.check_circle, Colors.teal.shade100, Colors.teal.shade800),
                  _buildStatCard('Pending', pending.toString(), Icons.hourglass_empty, Colors.orange.shade100, Colors.orange.shade800),
                ],
              ),
              
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('My Bookings', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                ],
              ),
              const SizedBox(height: 16),
              
              if (bookings.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text('You have no bookings yet.', style: GoogleFonts.nunito(color: Colors.grey.shade600)),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: bookings.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final b = bookings[index];
                    
                    MaterialColor statusColor = Colors.grey;
                    if (b['status'] == 'Approved') statusColor = Colors.blue;
                    if (b['status'] == 'Pending') statusColor = Colors.orange;
                    if (b['status'] == 'Completed') statusColor = Colors.green;
                    if (b['status'] == 'Cancelled') statusColor = Colors.red;

                    String serviceTypeLabel = b['serviceType'] == 'car_rental' ? 'Car Rental' : 'Tour Package';
                    String priceStr = b['totalAmount'] != null ? '₹${b['totalAmount']}' : '₹--';

                    // Parse date safely
                    String dateStr = '';
                    if (b['pickupDate'] != null) {
                      try {
                        final date = DateTime.parse(b['pickupDate']);
                        dateStr = '${date.day}/${date.month}/${date.year}';
                      } catch (e) {
                        dateStr = b['pickupDate'].toString();
                      }
                    }

                    return _buildBookingCard(
                      title: b['vehicle'] ?? 'Vehicle',
                      type: serviceTypeLabel,
                      date: dateStr,
                      price: priceStr,
                      status: b['status'] ?? 'Unknown',
                      statusColor: statusColor,
                      driverInfo: b['driverName'],
                      bookingId: b['id'],
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color bgColor, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(value, style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                Text(label, style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade600, letterSpacing: 0.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingCard({
    required String title,
    required String type,
    required String date,
    required String price,
    required String status,
    required MaterialColor statusColor,
    String? driverInfo,
    String? bookingId,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.shade200, width: 2),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                      const SizedBox(height: 4),
                      Text(type, style: GoogleFonts.nunito(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                          const SizedBox(width: 6),
                          Text(date, style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusColor.shade200),
                      ),
                      child: Text(status.toUpperCase(), style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor.shade800)),
                    ),
                    const SizedBox(height: 12),
                    Text(price, style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                  ],
                ),
              ],
            ),
          ),
          if (driverInfo != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.02),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                border: Border(top: BorderSide(color: Colors.grey.shade100)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 16),
                  const SizedBox(width: 8),
                  Text('Assigned Driver:', style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                  const SizedBox(width: 8),
                  Text(driverInfo, style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                ],
              ),
            ),
          if (status == 'Completed' && bookingId != null)
            Padding(
              padding: const EdgeInsets.all(16.0).copyWith(top: 0),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => InvoiceScreen(bookingId: bookingId)));
                  },
                  icon: const Icon(Icons.receipt, size: 18),
                  label: const Text('View Invoice & Receipt'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal.shade700,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
