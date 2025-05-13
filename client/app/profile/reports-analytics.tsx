import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ArrowLeft, BarChart, LineChart, PieChart, Download, Calendar, Filter } from 'lucide-react-native';
import AppBar from '@/components/AppBar';

// Mock data for charts
const mockSalesData = [
  { month: 'Jan', sales: 12000 },
  { month: 'Feb', sales: 15000 },
  { month: 'Mar', sales: 18000 },
  { month: 'Apr', sales: 16000 },
  { month: 'May', sales: 21000 },
  { month: 'Jun', sales: 24000 },
];

const mockProductData = [
  { name: 'Coffee Beans', percentage: 35 },
  { name: 'Tea', percentage: 25 },
  { name: 'Pastries', percentage: 20 },
  { name: 'Merchandise', percentage: 15 },
  { name: 'Other', percentage: 5 },
];

export default function ReportsAnalyticsScreen() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y
  
  const handleExportReport = () => {
    // In a real app, you would implement report export functionality
    alert('Export report functionality would be implemented here');
  };

  const handleFilterOptions = () => {
    // In a real app, you would show filter options
    alert('Filter options would be shown here');
  };

  return (
    <>
    <AppBar title="Reports & Analytics"  isCanGoBack/>
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Reports & Analytics',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.header}>
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === '1m' && styles.activeTimeRange]}
            onPress={() => setTimeRange('1m')}
          >
            <Text style={[styles.timeRangeText, timeRange === '1m' && styles.activeTimeRangeText]}>1M</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === '3m' && styles.activeTimeRange]}
            onPress={() => setTimeRange('3m')}
          >
            <Text style={[styles.timeRangeText, timeRange === '3m' && styles.activeTimeRangeText]}>3M</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === '6m' && styles.activeTimeRange]}
            onPress={() => setTimeRange('6m')}
          >
            <Text style={[styles.timeRangeText, timeRange === '6m' && styles.activeTimeRangeText]}>6M</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === '1y' && styles.activeTimeRange]}
            onPress={() => setTimeRange('1y')}
          >
            <Text style={[styles.timeRangeText, timeRange === '1y' && styles.activeTimeRangeText]}>1Y</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFilterOptions}>
            <Filter size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
            <Download size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Sales</Text>
            <Text style={styles.summaryValue}>$106,000</Text>
            <Text style={styles.summaryChange}>+12% from last period</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Orders</Text>
            <Text style={styles.summaryValue}>1,240</Text>
            <Text style={styles.summaryChange}>+8% from last period</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Avg. Order Value</Text>
            <Text style={styles.summaryValue}>$85.48</Text>
            <Text style={styles.summaryChange}>+3% from last period</Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales Trend</Text>
            <LineChart size={20} color={Colors.primary.burgundy} />
          </View>
          
          {/* This would be a real chart in a production app */}
          <View style={styles.chartPlaceholder}>
            <View style={styles.barChartContainer}>
              {mockSalesData.map((item, index) => (
                <View key={index} style={styles.barChartColumn}>
                  <View 
                    style={[
                      styles.barChartBar, 
                      { 
                        height: (item.sales / 24000) * 150,
                        backgroundColor: index === 5 ? Colors.primary.burgundy : Colors.primary.burgundyLight
                      }
                    ]} 
                  />
                  <Text style={styles.barChartLabel}>{item.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Product Categories</Text>
            <PieChart size={20} color={Colors.primary.burgundy} />
          </View>
          
          {/* This would be a real chart in a production app */}
          <View style={styles.chartPlaceholder}>
            <View style={styles.pieChartContainer}>
              <View style={styles.pieChartVisual}>
                {/* Simplified pie chart visualization */}
                <View style={styles.pieChartCircle} />
              </View>
              
              <View style={styles.pieChartLegend}>
                {mockProductData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View 
                      style={[
                        styles.legendColor, 
                        { backgroundColor: getColorForIndex(index) }
                      ]} 
                    />
                    <Text style={styles.legendText}>{item.name}</Text>
                    <Text style={styles.legendPercentage}>{item.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.viewAllReportsButton}>
          <Text style={styles.viewAllReportsText}>View All Reports</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

// Helper function to get colors for pie chart
const getColorForIndex = (index: number) => {
  const colors = [
    Colors.primary.burgundy,
    Colors.primary.burgundyLight,
    Colors.status.info,
    Colors.status.warning,
    Colors.neutral.gray
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTimeRange: {
    backgroundColor: Colors.primary.burgundy,
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: Colors.neutral.white,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  summaryCard: {
    width: '31%',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginRight: '3.5%',
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  summaryChange: {
    fontSize: 10,
    color: Colors.status.success,
  },
  chartSection: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 180,
    paddingBottom: 20,
  },
  barChartColumn: {
    alignItems: 'center',
    width: '16%',
  },
  barChartBar: {
    width: '80%',
    borderRadius: 4,
  },
  barChartLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 8,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pieChartVisual: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 20,
    borderColor: Colors.primary.burgundy,
    borderTopColor: Colors.primary.burgundyLight,
    borderRightColor: Colors.status.info,
    borderBottomColor: Colors.status.warning,
    transform: [{ rotate: '45deg' }],
  },
  pieChartLegend: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.neutral.black,
    flex: 1,
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
  viewAllReportsButton: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
  },
  viewAllReportsText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary.burgundy,
  },
});