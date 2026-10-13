import 'package:flutter/material.dart';
import 'dashboard_screen.dart';
import 'menu_screen.dart';
import 'plans_screen.dart';
import 'holiday_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    MenuScreen(),
    PlansScreen(),
    HolidayScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFFEA580C)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_menu_outlined),
            selectedIcon: Icon(Icons.restaurant_menu, color: Color(0xFFEA580C)),
            label: 'Menu',
          ),
          NavigationDestination(
            icon: Icon(Icons.lunch_dining_outlined),
            selectedIcon: Icon(Icons.lunch_dining, color: Color(0xFFEA580C)),
            label: 'Plans',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_busy_outlined),
            selectedIcon: Icon(Icons.event_busy, color: Color(0xFFEA580C)),
            label: 'Holidays',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: Color(0xFFEA580C)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
