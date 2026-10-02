import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryGreen),
        title: Text(
          'Privacy Policy',
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Last Updated: June 18, 2026',
                style: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryOrange,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'At RhinoVoyage, we are committed to protecting the privacy and security of our travelers and driver partners. This Privacy Policy explains how we collect, use, store, and protect your information when you request a booking, register an account, or interact with our services in Sivasagar, Assam, and the wider Northeast region.',
                style: GoogleFonts.nunito(fontSize: 15, color: Colors.grey.shade800, height: 1.5),
              ),
              const SizedBox(height: 24),
              
              _buildSectionTitle('1. Information We Collect'),
              _buildSectionText('To provide reliable travel itineraries, car rentals, and driver partner coordination, we collect the following types of information:'),
              _buildBulletPoint('Personal Information: Name, email address, password, and WhatsApp-enabled phone number.'),
              _buildBulletPoint('Driver Verification Documents: Aadhar Card Numbers, Driving License Numbers, and uploaded photo attachments of these physical documents.'),
              _buildBulletPoint('Booking Details: Selected travel packages, pickup date/time, selected vehicle category, pickup location, drop location, and payment preferences.'),
              
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.1),
                  border: Border.all(color: Colors.amber.shade300),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Document Security: Driver verification documents (Aadhar and Driving Licenses) are collected solely to establish credentials and check safety compliance. These files are stored securely and reviewed exclusively by authorized administrators.',
                        style: GoogleFonts.nunito(fontSize: 14, color: Colors.grey.shade800, height: 1.5),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              _buildSectionTitle('2. How We Use Your Information'),
              _buildSectionText('We process your information to deliver seamless tour services, specifically for:'),
              _buildBulletPoint('Verifying driver partner identities and licensing records before assigning trips.'),
              _buildBulletPoint('Matching and assigning verified driver partners to confirmed passenger bookings.'),
              _buildBulletPoint('Sending real-time alerts, notifications, and booking status confirmations via WhatsApp.'),
              _buildBulletPoint('Syncing log records and booking requests to online spreadsheets to coordinate fleet operations.'),
              _buildBulletPoint('Fulfilling customer support requests and resolving disputes.'),
              
              _buildSectionTitle('3. Data Storage & Google Sheets Sync'),
              _buildSectionText('Your details are stored securely inside our private local database. To facilitate coordinate logistics, booking details and user logs are synced in real-time to a secure Google Spreadsheet managed by RhinoVoyage. We implement strict server configuration rules and data access limits to protect database files against unauthorized access, modification, or exposure.'),
              
              _buildSectionTitle('4. Sharing of Data'),
              _buildSectionText('We do not sell, trade, or rent your personal information to third parties. Your data is only shared in the following scenarios:'),
              _buildBulletPoint('Between Passengers and Drivers: When a booking is approved and a driver is assigned, the passenger\'s name and contact number are shared with the driver to coordinate the pickup.'),
              _buildBulletPoint('Service Providers: Sharing data with service channels (such as Google Apps Script webhook engines) purely to sync bookings.'),
              _buildBulletPoint('Legal Requirements: Disclosing information when legally required by law enforcement or government authorities under applicable jurisdictions.'),
              
              _buildSectionTitle('5. User Rights & Choices'),
              _buildSectionText('You have the right to request access to the personal data we hold about you. You can update your contact profile information at any time by logging into your dashboard or by sending a request to our administrator. If you wish to delete your account, please contact us at rhinovoyage@gmail.com.'),
              
              _buildSectionTitle('6. Governing Jurisdiction'),
              _buildSectionText('RhinoVoyage operates out of Sivasagar, Assam. This Privacy Policy and all data handling activities are governed by the laws of India and are subject to the exclusive jurisdiction of the courts located in Assam.'),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 24.0, bottom: 8.0),
      child: Text(
        title,
        style: GoogleFonts.nunito(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryGreen,
        ),
      ),
    );
  }

  Widget _buildSectionText(String text) {
    return Text(
      text,
      style: GoogleFonts.nunito(
        fontSize: 15,
        color: Colors.grey.shade800,
        height: 1.5,
      ),
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('• ', style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.nunito(
                fontSize: 15,
                color: Colors.grey.shade800,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
