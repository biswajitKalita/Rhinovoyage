import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class BookingService {
  static const String baseUrl = 'http://localhost:5000/api/bookings';

  // Create Booking
  static Future<Map<String, dynamic>> createBooking({
    required String serviceType,
    required String name,
    required String phone,
    required String pickupDate,
    required String vehicle,
    String details = '',
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final headers = {
        'Content-Type': 'application/json',
      };
      
      // If user is logged in, attach token
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http.post(
        Uri.parse(baseUrl),
        headers: headers,
        body: jsonEncode({
          'serviceType': serviceType,
          'name': name,
          'phone': phone,
          'pickupDate': pickupDate,
          'vehicle': vehicle,
          'details': details,
          'paymentMethod': 'pay_later', // Defaulting to pay later
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success']) {
        return {'success': true, 'booking': data['booking']};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Booking failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Please try again.'};
    }
  }

  // Get My Bookings
  static Future<Map<String, dynamic>> getMyBookings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        return {'success': false, 'message': 'Not logged in.'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/my-bookings'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        return {'success': true, 'bookings': data['bookings']};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Failed to load bookings.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Please try again.'};
    }
  }
}
