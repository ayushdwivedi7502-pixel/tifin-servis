import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class ApiClient {
  final _storage = const FlutterSecureStorage();
  static final ApiClient instance = ApiClient._();
  ApiClient._();

  Future<String?> get token => _storage.read(key: 'accessToken');

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body, {bool auth = false}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final t = await token;
      if (t != null) headers['Authorization'] = 'Bearer $t';
    }
    final res = await http.post(Uri.parse('$apiBaseUrl$path'), headers: headers, body: jsonEncode(body));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw Exception(data['error'] ?? 'Request failed');
    }
    return data;
  }

  Future<List<dynamic>> getList(String path, {bool auth = true}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth) {
      final t = await token;
      if (t != null) headers['Authorization'] = 'Bearer $t';
    }
    final res = await http.get(Uri.parse('$apiBaseUrl$path'), headers: headers);
    if (res.statusCode >= 400) throw Exception('Request failed (${res.statusCode})');
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> getMap(String path, {bool auth = true}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth) {
      final t = await token;
      if (t != null) headers['Authorization'] = 'Bearer $t';
    }
    final res = await http.get(Uri.parse('$apiBaseUrl$path'), headers: headers);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw Exception(data['error'] ?? 'Request failed (${res.statusCode})');
    }
    return data;
  }

  Future<void> saveSession(String accessToken) async {
    await _storage.write(key: 'accessToken', value: accessToken);
  }

  Future<void> clearSession() async {
    await _storage.delete(key: 'accessToken');
  }
}
