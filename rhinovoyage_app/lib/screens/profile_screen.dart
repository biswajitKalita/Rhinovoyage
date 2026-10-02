import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';
import 'admin_dashboard_screen.dart';
import 'driver_dashboard_screen.dart';
import 'edit_profile_screen.dart';
import 'terms_screen.dart';
import 'privacy_screen.dart';
import '../services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await AuthService.getCurrentUser();
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  Future<void> _logout() async {
    await AuthService.logout();
    setState(() {
      _user = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8F9FA),
        body: Center(child: CircularProgressIndicator(color: AppTheme.primaryOrange)),
      );
    }

    final isLoggedIn = _user != null;
    final userName = isLoggedIn ? _user!['name'] : 'Guest User';
    final userEmail = isLoggedIn ? _user!['email'] : 'Join us to unlock premium features.';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 40),
              Container(
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
                  child: isLoggedIn
                      ? Text(
                          userName[0].toUpperCase(),
                          style: const TextStyle(fontSize: 40, color: AppTheme.primaryOrange, fontWeight: FontWeight.bold),
                        )
                      : const Icon(Icons.person_outline, size: 50, color: AppTheme.primaryOrange),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                userName,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryGreen,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                userEmail,
                style: GoogleFonts.nunito(
                  fontSize: 16,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 32),
              if (!isLoggedIn)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const LoginScreen())).then((_) {
                        _loadUser(); // Refresh user if we popped back from login without pushing new route
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                      backgroundColor: AppTheme.primaryGreen,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Log In / Sign Up', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              const SizedBox(height: 20),
              _buildSettingsList(context, isLoggedIn),
              if (isLoggedIn) ...[
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: ElevatedButton(
                    onPressed: _logout,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                      backgroundColor: Colors.red.shade50,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text('Log Out', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.red.shade700)),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsList(BuildContext context, bool isLoggedIn) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          if (isLoggedIn) ...[
            _buildSettingsTile(context, Icons.person_outline, 'Edit Profile', () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => EditProfileScreen(user: _user!)),
              ).then((shouldReload) {
                if (shouldReload == true) {
                  _loadUser(); // Refresh user if profile was updated
                }
              });
            }),
            _buildDivider(),
            _buildSettingsTile(context, Icons.lock_outline, 'Change Password', () {}),
            _buildDivider(),
          ],
          _buildSettingsTile(context, Icons.help_outline, 'Help & Support', () {}),
          _buildDivider(),
          _buildSettingsTile(context, Icons.description_outlined, 'Terms & Conditions', () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const TermsScreen()),
            );
          }),
          _buildDivider(),
          _buildSettingsTile(context, Icons.privacy_tip_outlined, 'Privacy Policy', () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const PrivacyScreen()),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppTheme.primaryOrange.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppTheme.primaryOrange, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.nunito(
          fontWeight: FontWeight.w700,
          color: AppTheme.primaryGreen,
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
      onTap: onTap,
    );
  }

  Widget _buildDivider() {
    return Divider(height: 1, thickness: 1, color: Colors.grey.shade100, indent: 24, endIndent: 24);
  }
}
