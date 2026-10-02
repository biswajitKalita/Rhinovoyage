import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryGreen),
        title: Text(
          'Terms of Service',
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
                'Welcome to RhinoVoyage! By accessing or using our website, travel booking portals, or coordinating with our driver partners, you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully before registering or requesting a tour.',
                style: GoogleFonts.nunito(fontSize: 15, color: Colors.grey.shade800, height: 1.5),
              ),
              const SizedBox(height: 24),
              
              _buildSectionTitle('1. Services Offered'),
              _buildSectionText('RhinoVoyage provides custom heritage tour packages, car rentals, and driver partner assignments starting and ending in Sivasagar, Assam. While we strive to ensure that all itineraries are executed precisely as planned, we reserve the right to modify routes or vehicle categories due to local road conditions, weather events, or vehicle maintenance constraints.'),
              
              _buildSectionTitle('2. User Accounts & Registration'),
              _buildSectionText('To access certain features, including requesting bookings, viewing assigned trips, or receiving status updates, you must register for an account. You agree to:'),
              _buildBulletPoint('Provide accurate, current, and complete details on registration forms.'),
              _buildBulletPoint('Maintain the security of your password and accept all responsibility for activities under your account.'),
              _buildBulletPoint('Notify us immediately of any unauthorized usage or security breaches.'),
              
              _buildSectionTitle('3. Driver Partner Terms & Verification'),
              _buildSectionText('Users who register as "Driver Partners" are subject to additional compliance checks:'),
              _buildBulletPoint('Document Submission: Drivers must submit accurate and legitimate Aadhar Card details, Driving Licenses, and uploaded photo proofs.'),
              _buildBulletPoint('Approval Status: Submission of credentials does not guarantee platform activation. Drivers default to "Pending" status and are only authorized to receive trip assignments once verified and "Approved" by a system administrator.'),
              _buildBulletPoint('Code of Conduct: Verified drivers must maintain passenger safety, operate clean and roadworthy vehicles, behave professionally, and respect scheduled pickup times. Non-compliance will result in immediate status revocation.'),
              
              _buildSectionTitle('4. Bookings, Payments, & Cancellations'),
              _buildBulletPoint('Requests: Submitting a booking form registers a trip query. A booking is only finalized when its status changes from "Pending" to "Approved" by our team.'),
              _buildBulletPoint('Payments: Payment options are flexible and settled according to the terms arranged during booking confirmation (typically settled in cash or via mobile UPI payments directly).'),
              _buildBulletPoint('Cancellations: Travel queries can be cancelled by travelers or modified by administrators. Notifications of updates or cancellations will be posted directly to your dashboard and WhatsApp log.'),
              
              _buildSectionTitle('5. Jurisdiction'),
              _buildSectionText('These Terms of Service shall be governed by and construed in accordance with the laws of India. Any legal action, dispute, or claim arising out of your use of our platform must be filed exclusively in the courts located in Sivasagar, Assam.'),
              
              _buildSectionTitle('6. Contact Us'),
              _buildSectionText('For any questions or clarifications regarding these Terms of Service, please contact our support team at rhinovoyage@gmail.com.'),
              
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
