import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/booking_service.dart';

class BookingEngineScreen extends StatefulWidget {
  final String? initialPackage;
  final String? initialVehicle;
  final String? selectedServiceType;

  const BookingEngineScreen({super.key, this.initialPackage, this.initialVehicle, this.selectedServiceType});

  @override
  State<BookingEngineScreen> createState() => _BookingEngineScreenState();
}

class _BookingEngineScreenState extends State<BookingEngineScreen> {
  late String selectedService;
  DateTime? pickupDate;
  DateTime? toDate;
  bool isLoading = false;
  
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _pickupPointController = TextEditingController();
  final _dropPointController = TextEditingController();
  final _daysController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    if (widget.selectedServiceType != null) {
      selectedService = widget.selectedServiceType!;
    } else if (widget.initialPackage != null) {
      selectedService = 'tour_package';
    } else if (widget.initialVehicle != null) {
      selectedService = 'car_rental';
    } else {
      selectedService = 'car_rental';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _pickupPointController.dispose();
    _dropPointController.dispose();
    _daysController.dispose();
    super.dispose();
  }

  void _submitBooking() async {
    if (_nameController.text.trim().isEmpty || 
        _phoneController.text.trim().isEmpty || 
        _pickupPointController.text.trim().isEmpty ||
        _dropPointController.text.trim().isEmpty ||
        pickupDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields.')));
      return;
    }

    if (selectedService == 'custom_tour' || selectedService == 'car_rental') {
      if (_daysController.text.trim().isEmpty || toDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter number of days and select To Date.')));
        return;
      }
    }

    setState(() => isLoading = true);

    final vehicle = selectedService == 'tour_package' 
        ? (widget.initialPackage ?? 'Custom Package') 
        : (widget.initialVehicle ?? 'Sedan');

    String details = 'Pickup Point: ${_pickupPointController.text.trim()}, Drop Point: ${_dropPointController.text.trim()}';
    if (selectedService == 'custom_tour' || selectedService == 'car_rental') {
      details += ', Days: ${_daysController.text.trim()}, To Date: ${toDate!.day}/${toDate!.month}/${toDate!.year}';
    }

    final result = await BookingService.createBooking(
      serviceType: selectedService,
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      pickupDate: pickupDate!.toIso8601String(),
      vehicle: vehicle,
      details: details,
    );

    setState(() => isLoading = false);

    if (result['success']) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking request submitted successfully!'), backgroundColor: Colors.green),
      );
      Navigator.pop(context); // Go back to previous screen
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final needsExtendedDates = selectedService == 'custom_tour' || selectedService == 'car_rental';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryGreen),
        title: Text(
          'Booking Request',
          style: GoogleFonts.playfairDisplay(
            color: AppTheme.primaryGreen,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryOrange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: AppTheme.primaryOrange),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Submit your request and our team will confirm your booking via WhatsApp within 30 minutes.',
                      style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            if (widget.selectedServiceType == null) ...[
              Text('Service Type', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 16)),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildServiceTypeBtn('car_rental', 'Car Rental', Icons.directions_car_rounded),
                  const SizedBox(width: 12),
                  _buildServiceTypeBtn('tour_package', 'Tour Package', Icons.map_rounded),
                  const SizedBox(width: 12),
                  _buildServiceTypeBtn('custom_tour', 'Custom Tour', Icons.explore_rounded),
                ],
              ),
              const SizedBox(height: 24),
            ],

            _buildInputField(label: 'Full Name', icon: Icons.person_outline, hint: 'Enter full name', controller: _nameController),
            const SizedBox(height: 16),
            _buildInputField(label: 'WhatsApp Number', icon: Icons.phone_outlined, hint: '+91 98765 43210', controller: _phoneController, keyboardType: TextInputType.phone),
            const SizedBox(height: 16),

            _buildInputField(label: 'Pickup Point', icon: Icons.location_on_outlined, hint: 'Where should we pick you up?', controller: _pickupPointController),
            const SizedBox(height: 16),
            
            _buildInputField(label: 'Drop Point', icon: Icons.flag_outlined, hint: 'Where is your destination?', controller: _dropPointController),
            const SizedBox(height: 16),

            if (needsExtendedDates) ...[
              _buildInputField(label: 'Number of Days', icon: Icons.timer_outlined, hint: 'E.g. 3', controller: _daysController, keyboardType: TextInputType.number),
              const SizedBox(height: 16),
            ],
            
            // Date Picker Field
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(needsExtendedDates ? 'From Date (Pickup)' : 'Pickup Date', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 14)),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now().add(const Duration(days: 1)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) {
                      setState(() { pickupDate = date; });
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, color: Colors.grey),
                        const SizedBox(width: 16),
                        Text(
                          pickupDate == null ? 'Select Date' : '${pickupDate!.day}/${pickupDate!.month}/${pickupDate!.year}',
                          style: GoogleFonts.nunito(color: pickupDate == null ? Colors.grey : AppTheme.primaryGreen, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (needsExtendedDates) ...[
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('To Date (Drop)', style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 14)),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: pickupDate ?? DateTime.now().add(const Duration(days: 1)),
                        firstDate: pickupDate ?? DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (date != null) {
                        setState(() { toDate = date; });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.event_outlined, color: Colors.grey),
                          const SizedBox(width: 16),
                          Text(
                            toDate == null ? 'Select End Date' : '${toDate!.day}/${toDate!.month}/${toDate!.year}',
                            style: GoogleFonts.nunito(color: toDate == null ? Colors.grey : AppTheme.primaryGreen, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            if (selectedService == 'tour_package')
              _buildReadOnlyField(label: 'Selected Package', icon: Icons.map, text: widget.initialPackage ?? 'Custom Package')
            else
              _buildReadOnlyField(label: 'Selected Vehicle', icon: Icons.directions_car, text: widget.initialVehicle ?? 'Sedan (Swift Dzire or similar)'),

            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: isLoading ? null : _submitBooking,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                backgroundColor: AppTheme.primaryGreen,
              ),
              child: isLoading 
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Submit Booking Request', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceTypeBtn(String value, String title, IconData icon) {
    final isSelected = selectedService == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedService = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primaryOrange : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? AppTheme.primaryOrange : Colors.grey.shade300),
            boxShadow: isSelected ? [
              BoxShadow(color: AppTheme.primaryOrange.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))
            ] : null,
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : Colors.grey.shade600),
              const SizedBox(height: 8),
              Text(
                title,
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({required String label, required IconData icon, required String hint, required TextEditingController controller, TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 14)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, color: Colors.grey),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppTheme.primaryOrange, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReadOnlyField({required String label, required IconData icon, required String text}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 14)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Row(
            children: [
              Icon(icon, color: Colors.grey),
              const SizedBox(width: 16),
              Expanded(child: Text(text, style: GoogleFonts.nunito(color: AppTheme.primaryGreen, fontSize: 16))),
            ],
          ),
        ),
      ],
    );
  }
}
