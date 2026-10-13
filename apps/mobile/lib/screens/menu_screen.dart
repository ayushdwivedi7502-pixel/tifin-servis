import 'package:flutter/material.dart';
import '../api_client.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  List<dynamic> addOns = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchAddOns();
  }

  Future<void> _fetchAddOns() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final items = await ApiClient.instance.getList('/api/addons');
      setState(() {
        addOns = items;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  final List<Map<String, String>> dailyMenu = const [
    {
      'day': 'Monday',
      'lunch': 'Arhar Dal Tadka, Paneer Butter Masala, Jeera Rice, 4 Phulkas, Salad & Pickle',
      'dinner': 'Sev Tamatar Sabzi, Moong Dal, Steamed Rice, 4 Chapatis, Gulab Jamun',
    },
    {
      'day': 'Tuesday',
      'lunch': 'Chole Masala, Aloo Gobhi Dry, Pulao, 4 Rotis, Raita & Salad',
      'dinner': 'Mix Veg Curry, Dal Fry, Jeera Rice, 4 Phulkas, Kheer',
    },
    {
      'day': 'Wednesday',
      'lunch': 'Rajma Masala, Bhindi Fry, Steamed Rice, 4 Chapatis, Roasted Papad',
      'dinner': 'Kadhai Paneer, Yellow Dal Tadka, Peas Pulao, 4 Phulkas, Salad',
    },
    {
      'day': 'Thursday',
      'lunch': 'Kadhi Pakoda, Aloo Jeera, Steamed Rice, 4 Phulkas, Green Salad',
      'dinner': 'Dum Aloo, Chana Dal Fry, Jeera Rice, 4 Rotis, Sweet Semiya',
    },
    {
      'day': 'Friday',
      'lunch': 'Shahi Paneer, Baingan Bharta, Veg Biryani, 4 Phulkas, Boondi Raita',
      'dinner': 'Dal Makhani, Seasonal Sabzi, Steamed Rice, 4 Chapatis, Pickle',
    },
    {
      'day': 'Saturday',
      'lunch': 'Palak Paneer, Masoor Dal Tadka, Steamed Rice, 4 Rotis, Salad',
      'dinner': 'Special Thali, Puri, Chole, Pulao, Halwa',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Menu & Add-ons'),
          bottom: const TabBar(
            indicatorColor: Color(0xFFEA580C),
            labelColor: Color(0xFFEA580C),
            tabs: [
              Tab(icon: Icon(Icons.restaurant_menu), text: 'Weekly Menu'),
              Tab(icon: Icon(Icons.add_shopping_cart), text: 'Order Add-ons'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: dailyMenu.length,
              itemBuilder: (context, index) {
                final item = dailyMenu[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEA580C).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                item['day']!,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFEA580C)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('☀️ Lunch: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            Expanded(child: Text(item['lunch']!, style: const TextStyle(fontSize: 13))),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('🌙 Dinner: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            Expanded(child: Text(item['dinner']!, style: const TextStyle(fontSize: 13))),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            loading
                ? const Center(child: CircularProgressIndicator())
                : error != null
                    ? Center(child: Text(error!))
                    : addOns.isEmpty
                        ? const Center(child: Text('No add-on items available.'))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: addOns.length,
                            itemBuilder: (context, index) {
                              final addon = addOns[index];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(14),
                                  title: Text(addon['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  subtitle: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(addon['description'] ?? '', style: const TextStyle(fontSize: 13)),
                                      const SizedBox(height: 4),
                                      Text(
                                        '₹${((addon['pricePaise'] ?? 0) / 100).toStringAsFixed(0)}',
                                        style: const TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.bold, fontSize: 15),
                                      ),
                                    ],
                                  ),
                                  trailing: FilledButton.tonal(
                                    onPressed: () {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Added ${addon['name']} to extra order cart!')),
                                      );
                                    },
                                    child: const Text('Add'),
                                  ),
                                ),
                              );
                            },
                          ),
          ],
        ),
      ),
    );
  }
}
