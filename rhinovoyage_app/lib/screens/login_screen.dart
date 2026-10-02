import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import 'main_navigation.dart';
import 'admin_dashboard_screen.dart';
import 'driver_dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool isLogin = true;
  bool isLoading = false;
  String selectedRole = 'user'; // 'user', 'driver', 'admin'
  
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _aadharController = TextEditingController(); // For drivers
  final _licenseController = TextEditingController(); // For drivers

  void _submit() async {
    setState(() => isLoading = true);
    
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    
    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields')));
      setState(() => isLoading = false);
      return;
    }

    Map<String, dynamic> result;
    if (isLogin) {
      result = await AuthService.login(email, password, selectedRole);
    } else {
      final name = _nameController.text.trim();
      final phone = _phoneController.text.trim();
      if (name.isEmpty || phone.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields')));
        setState(() => isLoading = false);
        return;
      }
      
      // Note: Full driver registration (with photos) requires multi-part form data which is not fully implemented in the basic register API call yet.
      // We will attempt normal registration passing the role. The backend might fail if it strictly requires photos for drivers, 
      // but let's assume it passes or returns a validation error.
      result = await AuthService.register(name, email, password, phone, selectedRole);
    }

    setState(() => isLoading = false);

    if (result['success']) {
      if (!mounted) return;
      
      final role = result['user']['role'];
      
      Widget nextScreen = const MainNavigation();
      if (role == 'admin') {
        nextScreen = const AdminDashboardScreen();
      } else if (role == 'driver') {
        nextScreen = const DriverDashboardScreen();
      }

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => nextScreen),
        (route) => false,
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'])));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppTheme.primaryGreen),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                isLogin ? 'Welcome Back' : 'Create Account',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryGreen,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isLogin ? 'Sign in to access your dashboard' : 'Join RhinoVoyage today',
                style: GoogleFonts.nunito(
                  fontSize: 16,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 24),

              // Role Selector
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _buildRoleTab('user', 'Traveler'),
                    _buildRoleTab('driver', 'Driver'),
                    if (isLogin) _buildRoleTab('admin', 'Admin'),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              if (!isLogin) ...[
                _buildTextField(label: 'Full Name', icon: Icons.person_outline, controller: _nameController),
                const SizedBox(height: 16),
                _buildTextField(label: 'Phone Number', icon: Icons.phone_outlined, controller: _phoneController, keyboardType: TextInputType.phone),
                const SizedBox(height: 16),
                
                if (selectedRole == 'driver') ...[
                  _buildTextField(label: 'Aadhar Number', icon: Icons.badge_outlined, controller: _aadharController),
                  const SizedBox(height: 16),
                  _buildTextField(label: 'License Number', icon: Icons.drive_eta_outlined, controller: _licenseController),
                  const SizedBox(height: 16),
                ],
              ],
              
              _buildTextField(label: 'Email Address', icon: Icons.email_outlined, controller: _emailController, keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 16),
              _buildTextField(label: 'Password', icon: Icons.lock_outline, isPassword: true, controller: _passwordController),
              
              if (isLogin)
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: Text('Forgot Password?', style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold)),
                  ),
                ),
                
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.primaryGreen,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isLoading
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(
                        isLogin ? 'Log In as ${selectedRole.toUpperCase()}' : 'Sign Up as ${selectedRole.toUpperCase()}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
              
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isLogin ? "Don't have an account? " : "Already have an account? ",
                    style: GoogleFonts.nunito(color: Colors.grey.shade600),
                  ),
                  GestureDetector(
                    onTap: () => setState(() {
                      isLogin = !isLogin;
                      if (selectedRole == 'admin') selectedRole = 'user'; // Admins can't sign up from app
                      _emailController.clear();
                      _passwordController.clear();
                      _nameController.clear();
                      _phoneController.clear();
                    }),
                    child: Text(
                      isLogin ? 'Sign Up' : 'Log In',
                      style: GoogleFonts.nunito(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleTab(String role, String label) {
    final isSelected = selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedRole = role),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primaryGreen : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : Colors.grey.shade600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required IconData icon,
    required TextEditingController controller,
    bool isPassword = false,
    TextInputType? keyboardType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: isPassword,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: Colors.grey),
            filled: true,
            fillColor: Colors.grey.shade50,
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

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _aadharController.dispose();
    _licenseController.dispose();
    super.dispose();
  }
}
