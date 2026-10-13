import 'package:flutter/material.dart';
import '../api_client.dart';
import 'plans_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? user;
  List<dynamic> subscriptions = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final u = await ApiClient.instance.getMap('/api/auth/me');
      final subs = await ApiClient.instance.getList('/api/subscriptions');
      setState(() {
        user = u;
        subscriptions = subs;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              Text(error!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton(onPressed: _fetchData, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    final activeSub = subscriptions.firstWhere(
      (s) => s['status'] == 'active' || s['status'] == 'pending_payment',
      orElse: () => null,
    );

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFFFFF7ED),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFFFEDD5)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: const Color(0xFFEA580C),
                        radius: 24,
                        child: Text(
                          (user?['fullName'] ?? 'U')[0].toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Namaste, ${user?['fullName'] ?? 'Customer'}!',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Jabalpur Meal Service • ${user?['phone'] ?? ''}',
                              style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (user?['collegeOrHostel'] != null && user?['collegeOrHostel'].toString().isNotEmpty == true) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFEDD5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '📍 ${user?['collegeOrHostel']}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Subscription Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          if (activeSub != null) ...[
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          activeSub['planId']?['name'] ?? 'Meal Plan',
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                        Chip(
                          label: Text(
                            (activeSub['status'] as String).replaceAll('_', ' ').toUpperCase(),
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          backgroundColor: activeSub['status'] == 'active' ? Colors.green.shade100 : Colors.amber.shade100,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Dates: ${activeSub['startDate']} → ${activeSub['endDate']}',
                      style: TextStyle(color: Colors.grey.shade800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Scheduled Meals: ${activeSub['scheduledMealsCount'] ?? activeSub['mealSchedule']?.length ?? 0}',
                      style: TextStyle(color: Colors.grey.shade800),
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Paid', style: TextStyle(color: Colors.grey, fontSize: 12)),
                            Text('₹${((activeSub['paidPaise'] ?? 0) / 100).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('Outstanding Balance', style: TextStyle(color: Colors.grey, fontSize: 12)),
                            Text('₹${((activeSub['outstandingPaise'] ?? 0) / 100).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.deepOrange)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(Icons.lunch_dining, size: 48, color: Color(0xFFEA580C)),
                    const SizedBox(height: 12),
                    const Text('No active subscription', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 6),
                    const Text('Choose a homemade healthy tiffin plan for college or work in Jabalpur.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 13)),
                    const SizedBox(height: 16),
                    FilledButton(
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFFEA580C)),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const PlansScreen()));
                      },
                      child: const Text('Browse Tiffin Plans'),
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),
          const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: [
              _ActionCard(
                icon: Icons.calendar_month,
                label: 'Meal Calendar & Holiday',
                color: Colors.teal,
                onTap: () {
                  // Navigate to holiday / pause management
                  DefaultTabController.of(context).animateTo(3);
                },
              ),
              _ActionCard(
                icon: Icons.add_shopping_cart,
                label: 'Order Extra Food',
                color: Colors.orange,
                onTap: () {
                  DefaultTabController.of(context).animateTo(1);
                },
              ),
              _ActionCard(
                icon: Icons.receipt_long,
                label: 'Receipts & Payments',
                color: Colors.indigo,
                onTap: () {
                  DefaultTabController.of(context).animateTo(4);
                },
              ),
              _ActionCard(
                icon: Icons.support_agent,
                label: 'Support & Help',
                color: Colors.purple,
                onTap: () {
                  DefaultTabController.of(context).animateTo(4);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
