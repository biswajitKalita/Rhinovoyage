import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  
  const EditProfileScreen({super.key, required this.user});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user['name'] ?? '');
    _phoneController = TextEditingController(text: widget.user['phone'] ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _updateProfile() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    if (name.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    setState(() => _isLoading = true);
    
    final result = await AuthService.updateProfile(name, phone);
    
    setState(() => _isLoading = false);

    if (result['success']) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated successfully!', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green));
      Navigator.pop(context, true); // Return true to indicate success and trigger reload
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'])));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryGreen),
        title: Text(
          'Edit Profile',
          style: GoogleFonts.playfairDisplay(
            color: AppTheme.primaryGreen,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      _nameController.text.isNotEmpty ? _nameController.text[0].toUpperCase() : '?',
                      style: const TextStyle(fontSize: 40, color: AppTheme.primaryOrange, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              _buildInputField(label: 'Full Name', icon: Icons.person_outline, controller: _nameController),
              const SizedBox(height: 16),
              
              _buildInputField(label: 'WhatsApp Number', icon: Icons.phone_outlined, controller: _phoneController, keyboardType: TextInputType.phone),
              const SizedBox(height: 16),
              
              // Email is read-only usually, just display it
              _buildReadOnlyField(label: 'Email Address', icon: Icons.email_outlined, text: widget.user['email'] ?? ''),
              const SizedBox(height: 40),
              
              ElevatedButton(
                onPressed: _isLoading ? null : _updateProfile,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.primaryGreen,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading 
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Save Changes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({required String label, required IconData icon, required TextEditingController controller, TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          onChanged: (_) => setState(() {}), // Update initials if name changes
          decoration: InputDecoration(
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
        Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
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
              Expanded(child: Text(text, style: GoogleFonts.nunito(color: AppTheme.primaryGreen))),
            ],
          ),
        ),
      ],
    );
  }
}
