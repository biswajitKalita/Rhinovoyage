import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AdminService {
  static const String baseUrl = 'http://localhost:5000/api';

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Bookings
  static Future<Map<String, dynamic>> getAllBookings() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bookings'), headers: await _getHeaders());
      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> updateBookingStatus(String bookingId, String status) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId/status'),
        headers: await _getHeaders(),
        body: jsonEncode({'status': status}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> assignDriver(String bookingId, String driverId) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId/assign-driver'),
        headers: await _getHeaders(),
        body: jsonEncode({'driverId': driverId}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> completeBooking(String bookingId) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId/complete'),
        headers: await _getHeaders(),
        body: jsonEncode({}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> getBookingInvoice(String bookingId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/$bookingId/invoice'),
        headers: await _getHeaders(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  // Drivers
  static Future<Map<String, dynamic>> getDrivers() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/users/drivers'), headers: await _getHeaders());
      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> verifyDriver(String driverId, String status) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/users/drivers/$driverId/verify'),
        headers: await _getHeaders(),
        body: jsonEncode({'status': status}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  // Fleet
  static Future<Map<String, dynamic>> getFleet() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/cars'), headers: await _getHeaders());
      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }
}
