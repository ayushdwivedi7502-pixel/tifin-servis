import 'package:flutter/material.dart';
import '../api_client.dart';
import 'home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final phone = TextEditingController();
  final password = TextEditingController();
  String? error;

  Future<void> login() async {
    setState(() => error = null);
    try {
      final data = await ApiClient.instance.post('/api/auth/login', {
        'phone': phone.text,
        'password': password.text,
      });
      await ApiClient.instance.saveSession(data['accessToken'] as String);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
    } catch (e) {
      setState(() => error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: phone, decoration: const InputDecoration(labelText: 'Mobile')),
            TextField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
            if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 12),
            FilledButton(onPressed: login, child: const Text('Login')),
            TextButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
              child: const Text('Register'),
            ),
          ],
        ),
      ),
    );
  }
}
