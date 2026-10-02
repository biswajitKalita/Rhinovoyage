import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:5000/api/auth';

  // Login
  static Future<Map<String, dynamic>> login(String email, String password, String role) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password, 'role': role}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Login failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Please try again.'};
    }
  }

  // Register
  static Future<Map<String, dynamic>> register(String name, String email, String password, String phone, String role) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'phone': phone,
          'role': role,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success']) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Registration failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Please try again.'};
    }
  }

  // Update Profile
  static Future<Map<String, dynamic>> updateProfile(String name, String phone) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) return {'success': false, 'message': 'Not logged in'};

      final response = await http.put(
        Uri.parse('$baseUrl/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'name': name,
          'phone': phone,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        await prefs.setString('user', jsonEncode(data['user']));
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Profile update failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Please try again.'};
    }
  }

  // Logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  // Get current user details from local storage
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr != null) {
      return jsonDecode(userStr);
    }
    return null;
  }
}
