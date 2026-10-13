import 'package:flutter/material.dart';
import '../api_client.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? user;
  List<dynamic> addresses = [];
  List<dynamic> payments = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final u = await ApiClient.instance.getMap('/api/auth/me');
      final addrs = await ApiClient.instance.getList('/api/addresses');
      final pays = await ApiClient.instance.getList('/api/payments');
      setState(() {
        user = u;
        addresses = addrs;
        payments = pays;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Future<void> _logout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('Are you sure you want to sign out from your Jabalpur Tiffin account?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (ok == true) {
      await ApiClient.instance.clearSession();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (error != null) {
      return Center(child: Text(error!));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account & Profile'),
        actions: [
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout, color: Colors.red)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: const Color(0xFFEA580C),
                  child: Text(
                    (user?['fullName'] ?? 'U')[0].toUpperCase(),
                    style: const TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  user?['fullName'] ?? '',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                Text(
                  '+91 ${user?['phone'] ?? ''} • ${user?['email'] ?? 'No email'}',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                if (user?['collegeOrHostel'] != null && user?['collegeOrHostel'].toString().isNotEmpty == true) ...[
                  const SizedBox(height: 6),
                  Text('🏫 ${user?['collegeOrHostel']}', style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.w600)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Saved Delivery Addresses', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (addresses.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('No saved addresses. Add an address during subscription checkout.', style: TextStyle(color: Colors.grey)),
              ),
            )
          else
            ...addresses.map((a) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const Icon(Icons.location_on, color: Color(0xFFEA580C)),
                    title: Text('${a['label'] ?? 'Address'} (PIN: ${a['pincode']})'),
                    subtitle: Text('${a['line1']}${a['line2'] != null ? ', ' + a['line2'] : ''}, Jabalpur'),
                  ),
                )),
          const SizedBox(height: 20),
          const Text('Recent Payment Receipts', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (payments.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('No payment history yet.', style: TextStyle(color: Colors.grey)),
              ),
            )
          else
            ...payments.take(5).map((p) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: Icon(
                      p['status'] == 'success' ? Icons.check_circle : Icons.receipt,
                      color: p['status'] == 'success' ? Colors.green : Colors.orange,
                    ),
                    title: Text('Receipt #${p['receiptNumber'] ?? ''}'),
                    subtitle: Text('Status: ${p['status']} • Purpose: ${(p['purpose'] ?? '').replaceAll('_', ' ')}'),
                    trailing: Text(
                      '₹${((p['amountPaise'] ?? 0) / 100).toStringAsFixed(0)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                )),
          const SizedBox(height: 24),
          Card(
            color: Colors.grey.shade100,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.contact_phone, color: Colors.teal),
                  title: const Text('Jabalpur Kitchen Help & WhatsApp'),
                  subtitle: const Text('+91 761 2400000 / info@jabalpurtiffin.in'),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Support line: +91 761 2400000 (Jabalpur, MP)')),
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.policy, color: Colors.blueGrey),
                  title: const Text('Refund & Holiday Policies'),
                  subtitle: const Text('Transparent pause, holiday, and advance terms'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout, color: Colors.red),
            label: const Text('Log Out', style: TextStyle(color: Colors.red)),
            onPressed: _logout,
          ),
        ],
      ),
    );
  }
}
