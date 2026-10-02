import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF0D2B1E);
  static const Color secondaryGreen = Color(0xFF1B4332);
  static const Color primaryOrange = Color(0xFFE8651A);
  static const Color lightOrange = Color(0xFFF39C12);
  static const Color backgroundColor = Color(0xFFF5F5F5);
  static const Color cream = Color(0xFFFBF7F0);
  static const Color textColor = Color(0xFF333333);

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primaryGreen,
      scaffoldBackgroundColor: backgroundColor,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryGreen,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        titleTextStyle: GoogleFonts.playfairDisplay(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        secondary: primaryOrange,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.bold, color: primaryGreen),
        bodyLarge: GoogleFonts.nunito(fontSize: 16, color: textColor),
        bodyMedium: GoogleFonts.nunito(fontSize: 14, color: textColor),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}
