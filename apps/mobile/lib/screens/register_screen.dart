import 'package:flutter/material.dart';
import '../api_client.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final fullName = TextEditingController();
  final phone = TextEditingController();
  final password = TextEditingController();
  final otp = TextEditingController(text: '123456');
  String? error;

  Future<void> sendOtp() async {
    await ApiClient.instance.post('/api/auth/otp/request', {
      'phone': phone.text,
      'purpose': 'register',
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP sent (dev: use 123456 or server log)')),
      );
    }
  }

  Future<void> register() async {
    try {
      final data = await ApiClient.instance.post('/api/auth/register', {
        'fullName': fullName.text,
        'phone': phone.text,
        'password': password.text,
        'otp': otp.text,
      });
      await ApiClient.instance.saveSession(data['accessToken'] as String);
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (_) => false,
      );
    } catch (e) {
      setState(() => error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: fullName, decoration: const InputDecoration(labelText: 'Full name')),
          TextField(controller: phone, decoration: const InputDecoration(labelText: 'Mobile')),
          TextField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
          TextField(controller: otp, decoration: const InputDecoration(labelText: 'OTP')),
          TextButton(onPressed: sendOtp, child: const Text('Send OTP')),
          if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
          FilledButton(onPressed: register, child: const Text('Create account')),
        ],
      ),
    );
  }
}
