import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const TiffinApp());
}

class TiffinApp extends StatelessWidget {
  const TiffinApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Jabalpur Tiffin',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFEA580C)),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}
