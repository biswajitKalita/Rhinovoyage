import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/booking_service.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
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
      if (mounted) {
        setState(() {
          currentUser = user;
          // Result might be false if unverified
          if (result['success']) {
            bookings = result['bookings'];
          }
          isLoading = false;
        });
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
        body: Center(child: CircularProgressIndicator(color: AppTheme.primaryOrange)),
      );
    }

    if (currentUser == null) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8F9FA),
        body: Center(child: Text("Not logged in")),
      );
    }

    String userName = currentUser?['name'] ?? 'Driver';
    String initial = userName.isNotEmpty ? userName[0].toUpperCase() : 'D';
    String email = currentUser?['email'] ?? 'N/A';
    String phone = currentUser?['phone'] ?? 'N/A';
    String aadhar = currentUser?['aadhar'] ?? 'N/A';
    String license = currentUser?['license'] ?? 'N/A';
    String status = currentUser?['verificationStatus'] ?? 'Pending';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppTheme.primaryGreen,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          children: [
            Text('RhinoVoyage', style: GoogleFonts.playfairDisplay(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: AppTheme.primaryOrange, borderRadius: BorderRadius.circular(6)),
              child: const Text('DRIVER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppTheme.primaryOrange,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Profile Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 35,
                      backgroundColor: AppTheme.primaryOrange.withOpacity(0.1),
                      child: Text(initial, style: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
                    ),
                    const SizedBox(height: 16),
                    Text(userName, style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(color: AppTheme.primaryGreen, borderRadius: BorderRadius.circular(20)),
                      child: Text('DRIVER PARTNER', style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                    const SizedBox(height: 24),
                    _buildProfileDetail('Email Address', email),
                    const SizedBox(height: 12),
                    _buildProfileDetail('WhatsApp Number', phone),
                    const SizedBox(height: 12),
                    _buildProfileDetail('Aadhar Card Number', aadhar),
                    const SizedBox(height: 12),
                    _buildProfileDetail('Driving License', license),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Verification Banner
              if (status == 'Approved')
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green.shade200)),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.green, size: 28),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Verification Status: Approved', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: Colors.green.shade800, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text('Your account is fully verified! You are active and ready to receive trips.', style: GoogleFonts.nunito(color: Colors.green.shade700, fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.orange.shade200)),
                  child: Row(
                    children: [
                      const Icon(Icons.hourglass_empty, color: Colors.orange, size: 28),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Verification Status: Pending', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: Colors.orange.shade800, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text('Your profile is under review by admins.', style: GoogleFonts.nunito(color: Colors.orange.shade700, fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 32),

              Text('Assigned Trips', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
              const SizedBox(height: 16),
              
              if (status != 'Approved')
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Text('Your account must be approved to view assigned trips.', textAlign: TextAlign.center, style: GoogleFonts.nunito(color: Colors.grey.shade600)),
                )
              else if (bookings.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Text('No trips assigned yet.', textAlign: TextAlign.center, style: GoogleFonts.nunito(color: Colors.grey.shade600)),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: bookings.length,
                  separatorBuilder: (c, i) => const SizedBox(height: 16),
                  itemBuilder: (c, i) {
                    final b = bookings[i];
                    String dateStr = '';
                    if (b['pickupDate'] != null) {
                      try {
                        final d = DateTime.parse(b['pickupDate']);
                        dateStr = '${d.day}/${d.month}/${d.year}';
                      } catch (e) {
                        dateStr = b['pickupDate'];
                      }
                    }
                    return _buildDriverTripCard(
                      context: context,
                      vehicle: b['vehicle'] ?? 'Vehicle',
                      serviceType: b['serviceType'] == 'tour_package' ? 'Tour Package' : 'Car Rental',
                      date: dateStr,
                      clientName: b['name'] ?? 'Passenger',
                      phone: b['phone'] ?? '',
                      status: b['status'] ?? 'Approved',
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600, letterSpacing: 0.5)),
        const SizedBox(height: 2),
        Text(value, style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.primaryGreen)),
        const Divider(),
      ],
    );
  }

  Widget _buildDriverTripCard({
    required BuildContext context,
    required String vehicle,
    required String serviceType,
    required String date,
    required String clientName,
    required String phone,
    required String status,
  }) {
    final isCompleted = status == 'Completed';
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(vehicle, style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                    Text(serviceType, style: GoogleFonts.nunito(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isCompleted ? Colors.green.shade50 : Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isCompleted ? Colors.green.shade200 : Colors.blue.shade200),
                ),
                child: Text(status.toUpperCase(), style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: isCompleted ? Colors.green.shade800 : Colors.blue.shade800)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('PICKUP DATE', style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600, letterSpacing: 0.5)),
                    Text(date, style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.primaryGreen)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('PASSENGER DETAILS', style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600, letterSpacing: 0.5)),
                    Text(clientName, style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.primaryGreen)),
                    Text(phone, style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (!isCompleted)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _showCompleteTripModal(context, vehicle, clientName),
                icon: const Icon(Icons.flag, size: 18),
                label: const Text('Complete Journey'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.receipt_long, size: 18),
                label: const Text('View Tax Invoice'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primaryOrange,
                  side: const BorderSide(color: AppTheme.primaryOrange),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showCompleteTripModal(BuildContext context, String vehicle, String clientName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('🏁 Complete Journey', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
              child: Text('$vehicle with passenger $clientName', style: GoogleFonts.nunito(color: Colors.grey.shade700, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 20),
            
            Text('EXTRA DISTANCE TRAVELED (KM)', style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
            const SizedBox(height: 4),
            TextField(decoration: InputDecoration(hintText: '0', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))), keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            
            Text('TOLLS / PARKING (₹)', style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
            const SizedBox(height: 4),
            TextField(decoration: InputDecoration(hintText: '0', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))), keyboardType: TextInputType.number),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trip Completed! Invoice Generated.')));
                _loadData();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Complete & Generate Invoice', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
