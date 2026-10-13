import 'package:flutter/material.dart';
import '../api_client.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  List<dynamic> plans = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final list = await ApiClient.instance.getList('/api/plans', auth: false);
      setState(() {
        plans = list;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  void _openSubscriptionModal(Map<String, dynamic> plan) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _SubscriptionSheet(plan: plan),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tiffin Plans (Jabalpur)')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : RefreshIndicator(
                  onRefresh: load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: plans.length,
                    itemBuilder: (_, i) {
                      final p = plans[i] as Map<String, dynamic>;
                      final price = ((p['pricePaise'] as num? ?? 0) / 100).toStringAsFixed(0);
                      final advance = p['advanceFixedPaise'] != null
                          ? '₹${((p['advanceFixedPaise'] as num) / 100).toStringAsFixed(0)} advance'
                          : p['advancePercent'] != null
                              ? '${p['advancePercent']}% advance'
                              : 'Full payment';

                      final foodItems = (p['includedFoodItems'] as List?)?.join(', ') ?? 'Homemade Dal, Sabzi, Rotis, Rice';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      p['name'] as String,
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEA580C).withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '₹$price',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFFEA580C),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(p['description'] as String? ?? '', style: TextStyle(color: Colors.grey.shade700, fontSize: 13)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  const Icon(Icons.restaurant, size: 16, color: Colors.grey),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      foodItems,
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.payments_outlined, size: 16, color: Colors.grey),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Advance Rule: $advance',
                                    style: const TextStyle(fontSize: 12, color: Colors.teal, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: FilledButton(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: const Color(0xFFEA580C),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: () => _openSubscriptionModal(p),
                                  child: const Text('Subscribe & Select Date'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class _SubscriptionSheet extends StatefulWidget {
  final Map<String, dynamic> plan;

  const _SubscriptionSheet({required this.plan});

  @override
  State<_SubscriptionSheet> createState() => _SubscriptionSheetState();
}

class _SubscriptionSheetState extends State<_SubscriptionSheet> {
  DateTime startDate = DateTime.now().add(const Duration(days: 2));
  final TextEditingController _addressController = TextEditingController(text: 'Wright Town, Jabalpur');
  final TextEditingController _pincodeController = TextEditingController(text: '482002');
  bool calculating = false;
  Map<String, dynamic>? quote;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchQuote();
  }

  Future<void> _fetchQuote() async {
    setState(() => calculating = true);
    final dateStr = '${startDate.year.toString().padLeft(4, '0')}-${startDate.month.toString().padLeft(2, '0')}-${startDate.day.toString().padLeft(2, '0')}';
    try {
      final q = await ApiClient.instance.post(
        '/api/subscriptions/quote',
        {
          'planId': widget.plan['_id'],
          'startDate': dateStr,
        },
        auth: true,
      );
      setState(() {
        quote = q;
        calculating = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        calculating = false;
      });
    }
  }

  Future<void> _subscribeAndPay() async {
    final token = await ApiClient.instance.token;
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to confirm subscription')),
      );
      return;
    }

    try {
      // 1. Create address
      final addr = await ApiClient.instance.post(
        '/api/addresses',
        {
          'label': 'Delivery',
          'line1': _addressController.text.trim(),
          'pincode': _pincodeController.text.trim(),
        },
        auth: true,
      );

      final dateStr = '${startDate.year.toString().padLeft(4, '0')}-${startDate.month.toString().padLeft(2, '0')}-${startDate.day.toString().padLeft(2, '0')}';

      // 2. Create subscription
      final sub = await ApiClient.instance.post(
        '/api/subscriptions',
        {
          'planId': widget.plan['_id'],
          'startDate': dateStr,
          'addressId': addr['_id'],
        },
        auth: true,
      );

      // 3. Initiate advance payment
      final advancePaise = sub['advanceRequiredPaise'] as int;
      final payInit = await ApiClient.instance.post(
        '/api/payments/initiate',
        {
          'subscriptionId': sub['_id'],
          'purpose': 'subscription_advance',
          'amountPaise': advancePaise,
          'idempotencyKey': 'app-sub-${sub['_id']}-${DateTime.now().millisecondsSinceEpoch}',
        },
        auth: true,
      );

      // 4. Confirm mock payment
      final paymentId = payInit['payment']['_id'];
      await ApiClient.instance.post(
        '/api/payments/mock/confirm',
        {
          'paymentId': paymentId,
          'simulateSuccess': true,
        },
        auth: true,
      );

      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🎉 Subscription activated! Welcome to Jabalpur Tiffin.')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final priceTotal = ((widget.plan['pricePaise'] as num? ?? 0) / 100).toStringAsFixed(0);

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Subscribe: ${widget.plan['name']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.calendar_month, color: Color(0xFFEA580C)),
            title: const Text('Start Date'),
            subtitle: Text('${startDate.day}/${startDate.month}/${startDate.year} (IST)'),
            trailing: TextButton(
              onPressed: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: startDate,
                  firstDate: DateTime.now().add(const Duration(days: 1)),
                  lastDate: DateTime.now().add(const Duration(days: 60)),
                );
                if (d != null) {
                  setState(() => startDate = d);
                  _fetchQuote();
                }
              },
              child: const Text('Change'),
            ),
          ),
          if (calculating)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: LinearProgressIndicator(),
            )
          else if (quote != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('End Date:'),
                      Text('${quote!['endDate']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Scheduled Meals:'),
                      Text('${quote!['scheduledMeals']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Plan Price:'),
                      Text('₹$priceTotal', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Advance Payable Now (Demo):', style: TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.bold)),
                      Text(
                        '₹${((quote!['pricing']?['advanceRequiredPaise'] ?? 0) / 100).toStringAsFixed(0)}',
                        style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          TextField(
            controller: _addressController,
            decoration: const InputDecoration(
              labelText: 'Delivery Address (Hostel / PG / House)',
              border: OutlineInputBorder(),
              isDense: true,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _pincodeController,
            decoration: const InputDecoration(
              labelText: 'Jabalpur PIN Code (e.g. 482001, 482002)',
              border: OutlineInputBorder(),
              isDense: true,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFEA580C),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: _subscribeAndPay,
              child: const Text('Pay Advance & Confirm Subscription'),
            ),
          ),
        ],
      ),
    );
  }
}
