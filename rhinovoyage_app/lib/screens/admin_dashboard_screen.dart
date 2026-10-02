import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/admin_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'invoice_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  bool isLoading = true;
  List<dynamic> bookings = [];
  List<dynamic> drivers = [];
  List<dynamic> fleet = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => isLoading = true);

    final results = await Future.wait([
      AdminService.getAllBookings(),
      AdminService.getDrivers(),
      AdminService.getFleet(),
    ]);

    if (!mounted) return;

    setState(() {
      if (results[0]['success']) bookings = results[0]['bookings'] ?? [];
      if (results[1]['success']) drivers = results[1]['drivers'] ?? [];
      if (results[2]['success']) fleet = results[2]['cars'] ?? [];
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppTheme.primaryGreen,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          children: [
            Text('Console', style: GoogleFonts.playfairDisplay(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: AppTheme.primaryOrange, borderRadius: BorderRadius.circular(6)),
              child: const Text('ADMIN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadData),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () async {
              await AuthService.logout();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primaryOrange,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: GoogleFonts.nunito(fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'Bookings'),
            Tab(text: 'Drivers'),
            Tab(text: 'Fleet'),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildBookingsTab(),
                _buildDriversTab(),
                _buildFleetTab(),
              ],
            ),
    );
  }

  void _showDriverSelectionDialog(String bookingId) {
    final availableDrivers = drivers.where((d) => d['verificationStatus'] == 'Approved').toList();
    
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Assign Driver', style: GoogleFonts.playfairDisplay(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold)),
          content: SizedBox(
            width: double.maxFinite,
            child: availableDrivers.isEmpty
                ? const Text('No approved drivers available.')
                : ListView.builder(
                    shrinkWrap: true,
                    itemCount: availableDrivers.length,
                    itemBuilder: (context, index) {
                      final driver = availableDrivers[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.green.shade50,
                          child: const Icon(Icons.person, color: Colors.green),
                        ),
                        title: Text(driver['name'] ?? 'Driver', style: GoogleFonts.nunito(fontWeight: FontWeight.bold)),
                        subtitle: Text(driver['phone'] ?? ''),
                        onTap: () async {
                          Navigator.pop(context); // close dialog
                          final result = await AdminService.assignDriver(bookingId, driver['id']);
                          if (result['success']) {
                            // ignore: use_build_context_synchronously
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Driver Assigned!'), backgroundColor: Colors.green));
                            _loadData();
                          } else {
                            // ignore: use_build_context_synchronously
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed to assign'), backgroundColor: Colors.red));
                          }
                        },
                      );
                    },
                  ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildBookingsTab() {
    int total = bookings.length;
    int pending = bookings.where((b) => b['status'] == 'Pending').length;
    int approved = bookings.where((b) => b['status'] == 'Approved').length;
    int completed = bookings.where((b) => b['status'] == 'Completed').length;
    int cancelled = bookings.where((b) => b['status'] == 'Cancelled').length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Booking Overview', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
          const SizedBox(height: 16),
          SizedBox(
            height: 100,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildMetricCard('Total', total.toString(), Icons.map, Colors.blue),
                _buildMetricCard('Pending', pending.toString(), Icons.hourglass_empty, Colors.orange),
                _buildMetricCard('Approved', approved.toString(), Icons.directions_car, Colors.green),
                _buildMetricCard('Completed', completed.toString(), Icons.check_circle, Colors.teal),
                _buildMetricCard('Cancelled', cancelled.toString(), Icons.cancel, Colors.red),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Text('Recent Requests', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
          const SizedBox(height: 16),
          if (bookings.isEmpty)
            const Text('No bookings found.')
          else
            ...bookings.reversed.map((b) {
              MaterialColor statusColor = Colors.grey;
              if (b['status'] == 'Pending') statusColor = Colors.orange;
              if (b['status'] == 'Approved') statusColor = Colors.blue;
              if (b['status'] == 'Completed') statusColor = Colors.green;
              if (b['status'] == 'Cancelled') statusColor = Colors.red;

              String dateStr = '';
              if (b['pickupDate'] != null) {
                try {
                  final d = DateTime.parse(b['pickupDate']);
                  dateStr = '${d.day}/${d.month}/${d.year}';
                } catch (_) {
                  dateStr = b['pickupDate'];
                }
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: _buildAdminBookingCard(
                  id: b['id'],
                  clientName: b['name'] ?? 'Guest',
                  phone: b['phone'] ?? '',
                  vehicle: b['vehicle'] ?? 'Vehicle',
                  serviceType: b['serviceType'] == 'tour_package' ? 'Tour Package' : 'Car Rental',
                  date: dateStr,
                  status: b['status'] ?? 'Pending',
                  statusColor: statusColor,
                  assignedDriver: b['driverName'],
                  onAssignDriver: () => _showDriverSelectionDialog(b['id']),
                  onCompleteBooking: () async {
                    final result = await AdminService.completeBooking(b['id']);
                    if (result['success']) {
                      // ignore: use_build_context_synchronously
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trip Completed! Invoice Generated.'), backgroundColor: Colors.green));
                      _loadData();
                    } else {
                      // ignore: use_build_context_synchronously
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed to complete'), backgroundColor: Colors.red));
                    }
                  },
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildDriversTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Driver Management', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
              TextButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, color: AppTheme.primaryOrange),
                label: Text('Add Driver', style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (drivers.isEmpty)
            const Text('No drivers found.')
          else
            ...drivers.map((d) {
              final status = d['verificationStatus'] ?? 'Pending';
              final isApproved = status == 'Approved';
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: isApproved ? Colors.green.shade50 : Colors.orange.shade50,
                      child: Icon(Icons.person, color: isApproved ? Colors.green : Colors.orange),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(d['name'] ?? 'Driver', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryGreen)),
                          Text(d['phone'] ?? 'No Phone', style: GoogleFonts.nunito(fontSize: 13, color: Colors.grey.shade600)),
                        ],
                      ),
                    ),
                    if (!isApproved)
                      ElevatedButton(
                        onPressed: () async {
                          await AdminService.verifyDriver(d['id'], 'Approved');
                          _loadData();
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryGreen, padding: const EdgeInsets.symmetric(horizontal: 12)),
                        child: const Text('Approve', style: TextStyle(fontSize: 12)),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                        child: Text('VERIFIED', style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green)),
                      ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildFleetTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Fleet Management', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
              TextButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, color: AppTheme.primaryOrange),
                label: Text('Add Car', style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (fleet.isEmpty)
            const Text('No cars found.')
          else
            ...fleet.map((c) {
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.directions_car, color: Colors.grey, size: 30),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c['name'] ?? 'Car Name', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryGreen)),
                          Text(c['type'] ?? 'Type', style: GoogleFonts.nunito(fontSize: 13, color: Colors.grey.shade600)),
                        ],
                      ),
                    ),
                    Text('₹${c['pricePerDay'] ?? 0}/day', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryOrange)),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, MaterialColor color) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color.shade50, borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: color, size: 20),
              ),
              const Spacer(),
              Text(value, style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
            ],
          ),
          const Spacer(),
          Text(label, style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade600, letterSpacing: 0.5)),
        ],
      ),
    );
  }

  Widget _buildAdminBookingCard({
    required String id,
    required String clientName,
    required String phone,
    required String vehicle,
    required String serviceType,
    required String date,
    required String status,
    required MaterialColor statusColor,
    String? assignedDriver,
    VoidCallback? onAssignDriver,
    VoidCallback? onCompleteBooking,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primaryOrange.withOpacity(0.1),
                  child: Text(clientName.isNotEmpty ? clientName[0] : '?', style: const TextStyle(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(clientName, style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                      Text(phone, style: GoogleFonts.nunito(fontSize: 13, color: Colors.grey.shade600)),
                      const SizedBox(height: 8),
                      Text('$vehicle • $serviceType', style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
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
                    const SizedBox(height: 8),
                    Text(date, style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                  ],
                ),
              ],
            ),
          ),
          if (assignedDriver != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                border: Border(top: BorderSide(color: Colors.grey.shade200), bottom: BorderSide(color: Colors.grey.shade200)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.person, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text('Driver: $assignedDriver', style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (status == 'Pending') ...[
                  ElevatedButton(
                    onPressed: () async {
                      final result = await AdminService.updateBookingStatus(id, 'Approved');
                      if (result['success']) {
                        // ignore: use_build_context_synchronously
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Booking Approved!'), backgroundColor: Colors.green));
                        _loadData();
                      } else {
                        // ignore: use_build_context_synchronously
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed to approve'), backgroundColor: Colors.red));
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryGreen),
                    child: const Text('Approve'),
                  ),
                ] else if (status == 'Approved' && assignedDriver == null) ...[
                  ElevatedButton(
                    onPressed: onAssignDriver,
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryOrange),
                    child: const Text('Assign Driver'),
                  ),
                ] else if (status == 'Approved' && assignedDriver != null) ...[
                  ElevatedButton(
                    onPressed: onCompleteBooking,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                    child: const Text('Complete Trip'),
                  ),
                ] else if (status == 'Completed') ...[
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => InvoiceScreen(bookingId: id)));
                    },
                    icon: const Icon(Icons.receipt, size: 16),
                    label: const Text('View Invoice'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade700),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
