import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ArrowLeft, Search, HelpCircle, MessageCircle, Phone, Mail, ChevronRight, ChevronDown } from 'lucide-react-native';

// Mock FAQs
const mockFaqs = [
  {
    id: '1',
    question: 'How do I add a new product to my inventory?',
    answer: 'To add a new product, go to the Inventory tab and tap the + button in the top right corner. Fill in the product details and save.',
    category: 'Inventory',
  },
  {
    id: '2',
    question: 'How do I track my orders?',
    answer: 'You can track your orders in the Supply Chain tab. Select an order to view its current status and tracking information.',
    category: 'Orders',
  },
  {
    id: '3',
    question: 'How do I generate reports?',
    answer: 'Go to your Profile tab, then select "Reports & Analytics". From there, you can generate various reports about your business performance.',
    category: 'Reports',
  },
  {
    id: '4',
    question: 'How do I update my payment information?',
    answer: 'Go to your Profile tab, then select "Payment Methods". You can add, edit, or remove payment methods from this screen.',
    category: 'Billing',
  },
  {
    id: '5',
    question: 'How do I connect with suppliers?',
    answer: 'In the Supply Chain tab, you can browse available suppliers and send connection requests to establish business relationships.',
    category: 'Supply Chain',
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [filteredFaqs, setFilteredFaqs] = useState(mockFaqs);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredFaqs(mockFaqs);
    } else {
      const filtered = mockFaqs.filter(
        faq => 
          faq.question.toLowerCase().includes(text.toLowerCase()) ||
          faq.answer.toLowerCase().includes(text.toLowerCase()) ||
          faq.category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  };

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactSupport = () => {
    // In a real app, you would navigate to a contact form or open email/phone
    alert('Contact support functionality would be implemented here');
  };

  const handleLiveChat = () => {
    // In a real app, you would open a live chat interface
    alert('Live chat functionality would be implemented here');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Help Center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.neutral.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.supportOptions}>
          <TouchableOpacity style={styles.supportOption} onPress={handleContactSupport}>
            <View style={[styles.supportIconContainer, { backgroundColor: Colors.primary.burgundyLight }]}>
              <Phone size={24} color={Colors.primary.burgundy} />
            </View>
            <Text style={styles.supportOptionText}>Contact Support</Text>
            <ChevronRight size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportOption} onPress={handleLiveChat}>
            <View style={[styles.supportIconContainer, { backgroundColor: Colors.status.info + '20' }]}>
              <MessageCircle size={24} color={Colors.status.info} />
            </View>
            <Text style={styles.supportOptionText}>Live Chat</Text>
            <ChevronRight size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportOption} onPress={handleContactSupport}>
            <View style={[styles.supportIconContainer, { backgroundColor: Colors.status.success + '20' }]}>
              <Mail size={24} color={Colors.status.success} />
            </View>
            <Text style={styles.supportOptionText}>Email Support</Text>
            <ChevronRight size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {filteredFaqs.map(faq => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleFaq(faq.id)}
              >
                <View style={styles.faqQuestionContent}>
                  <HelpCircle size={20} color={Colors.primary.burgundy} style={styles.faqIcon} />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
                {expandedFaq === faq.id ? (
                  <ChevronDown size={20} color={Colors.neutral.gray} />
                ) : (
                  <ChevronRight size={20} color={Colors.neutral.gray} />
                )}
              </TouchableOpacity>
              
              {expandedFaq === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  <View style={styles.faqCategory}>
                    <Text style={styles.faqCategoryText}>{faq.category}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
          
          {filteredFaqs.length === 0 && (
            <View style={styles.emptyContainer}>
              <HelpCircle size={48} color={Colors.neutral.lightGray} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try different keywords or contact support</Text>
            </View>
          )}
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Our support team is available Monday-Friday, 9am-5pm EST.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.neutral.black,
  },
  supportOptions: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  supportOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
  faqSection: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  faqIcon: {
    marginRight: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    color: Colors.neutral.black,
    flex: 1,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: Colors.neutral.extraLightGray + '40',
  },
  faqAnswerText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral.extraLightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  faqCategoryText: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
  },
  contactInfo: {
    padding: 24,
    backgroundColor: Colors.neutral.extraLightGray,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '500',
  },
});