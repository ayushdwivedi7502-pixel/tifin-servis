import 'package:flutter/material.dart';
import '../api_client.dart';

class HolidayScreen extends StatefulWidget {
  const HolidayScreen({super.key});

  @override
  State<HolidayScreen> createState() => _HolidayScreenState();
}

class _HolidayScreenState extends State<HolidayScreen> {
  List<dynamic> holidayRequests = [];
  List<dynamic> subscriptions = [];
  bool loading = true;
  String? error;
  DateTime selectedDate = DateTime.now().add(const Duration(days: 2));
  String selectedSlot = 'both';
  String reason = '';

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
      final reqs = await ApiClient.instance.getList('/api/holidays');
      final subs = await ApiClient.instance.getList('/api/subscriptions');
      setState(() {
        holidayRequests = reqs;
        subscriptions = subs.where((s) => s['status'] == 'active').toList();
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Future<void> _submitHoliday() async {
    if (subscriptions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No active subscription found to pause meals for.')),
      );
      return;
    }

    final activeSub = subscriptions.first;
    final dateStr = '${selectedDate.year.toString().padLeft(4, '0')}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}';

    try {
      await ApiClient.instance.post(
        '/api/holidays',
        {
          'subscriptionId': activeSub['_id'],
          'dates': [dateStr],
          'mealSlot': selectedSlot,
          'reason': reason.isEmpty ? 'Personal leave' : reason,
        },
        auth: true,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Holiday request submitted successfully! Meal schedule updated.')),
      );
      _fetchData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Holiday & Meal Pause')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    color: Colors.blue.shade50,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: BorderSide(color: Colors.blue.shade200),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, color: Colors.indigo),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('Cutoff Time Policy', style: TextStyle(fontWeight: FontWeight.bold)),
                                SizedBox(height: 4),
                                Text(
                                  'Submit lunch pauses by 8:00 AM & dinner pauses by 3:00 PM on the delivery date. Approved pause days adjust your subscription cycle.',
                                  style: TextStyle(fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('Request a Meal Pause', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Card(
                    elevation: 1,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Select Date', style: TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${selectedDate.day}/${selectedDate.month}/${selectedDate.year}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.calendar_today),
                              onPressed: () async {
                                final d = await showDatePicker(
                                  context: context,
                                  initialDate: selectedDate,
                                  firstDate: DateTime.now().add(const Duration(days: 1)),
                                  lastDate: DateTime.now().add(const Duration(days: 60)),
                                );
                                if (d != null) {
                                  setState(() => selectedDate = d);
                                }
                              },
                            ),
                          ),
                          const Divider(),
                          const Text('Meal Slot to Pause', style: TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            children: [
                              ChoiceChip(
                                label: const Text('Both Lunch & Dinner'),
                                selected: selectedSlot == 'both',
                                onSelected: (s) => setState(() => selectedSlot = 'both'),
                              ),
                              ChoiceChip(
                                label: const Text('Lunch Only'),
                                selected: selectedSlot == 'lunch',
                                onSelected: (s) => setState(() => selectedSlot = 'lunch'),
                              ),
                              ChoiceChip(
                                label: const Text('Dinner Only'),
                                selected: selectedSlot == 'dinner',
                                onSelected: (s) => setState(() => selectedSlot = 'dinner'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            decoration: const InputDecoration(
                              labelText: 'Reason (optional)',
                              hintText: 'e.g. Traveling home for weekend, exam leave',
                              border: OutlineInputBorder(),
                            ),
                            onChanged: (v) => reason = v,
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFFEA580C),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              onPressed: _submitHoliday,
                              child: const Text('Submit Pause Request'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('Past Holiday Requests', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (holidayRequests.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('No previous pause requests found.', style: TextStyle(color: Colors.grey)),
                      ),
                    )
                  else
                    ...holidayRequests.map((req) => Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: ListTile(
                            leading: Icon(
                              req['status'] == 'approved' ? Icons.check_circle : Icons.pending,
                              color: req['status'] == 'approved' ? Colors.green : Colors.orange,
                            ),
                            title: Text('Dates: ${(req['dates'] as List?)?.join(', ') ?? ''}'),
                            subtitle: Text('Slot: ${req['mealSlot']} • Status: ${req['status']}'),
                          ),
                        )),
                ],
              ),
            ),
    );
  }
}
