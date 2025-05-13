import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Share2,
  Heart,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { Event } from "@/types";
import api from "@/utils/apiClient";
import AppBar from "@/components/AppBar";
import { useAuthStore } from "@/store/auth-store";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]); // Replace with your ticket type

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        const soldRes = await api.get("/reservations");
        setEvents(res.data);
        setSoldTickets(soldRes.data);
      } catch (error) {
        console.error("Error fetching events or tickets:", error);
      }
    };

    fetchEvents();
  }, []);

  const event = useMemo(() => events.find((e) => e._id === id), [events, id]);

  // Check if the user is registered
  const { user } = useAuthStore();
  const isRegistered = soldTickets.some(
    (ticket) =>
      ticket.eventId._id === event?._id &&
      ticket.attendeeName === user.name &&
      ticket.attendeeEmail === user.email
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const handleRegister = () => {
    if (!event) return;

    if (isRegistered) {
      return Alert.alert("Already Registered", "You're already registered.");
    }

    if (!event.price || event.price === 0) {
      return Alert.alert(
        "Confirm Registration",
        `Register for "${event.title}"? This event is free.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Register",
            onPress: () =>
              Alert.alert("Success", "You've successfully registered!", [
                { text: "OK" },
              ]),
          },
        ]
      );
    }

    // Redirect to payment
    router.push({
      pathname: "/event-payment",
      params: {
        id: event._id,
        title: event.title,
        price: event.price.toString(),
        date: event.date,
        time: event.time,
      },
    });
  };

  const handleShare = () => {
    Alert.alert("Share Event", "Share this event with your contacts");
  };

  const handleSave = () => {
    Alert.alert("Saved", "This event was added to your favorites");
  };

  if (!event) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Loading event...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar title="Event Details" isCanGoBack={true} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.image }}
            style={styles.eventImage}
            resizeMode="cover"
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Share2 size={20} color={Colors.neutral.black} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
              <Heart size={20} color={Colors.neutral.black} />
            </TouchableOpacity>
          </View>

          {isRegistered && (
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.category}>{event.category || "General"}</Text>

          <View style={styles.infoSection}>
            <InfoItem icon={Calendar} text={formatDate(event.date)} />
            <InfoItem icon={Clock} text={event.time} />
            <InfoItem icon={MapPin} text={event.location} />
            <InfoItem icon={User} text={`Organized by ${event.organizerName}`} />
          </View>

          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>
              {!event.price || event.price === 0
                ? "Free"
                : `$${event.price.toFixed(2)}`}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.registerButton,
            isRegistered && styles.registeredButton,
          ]}
          onPress={handleRegister}
        >
          <Text
            style={[
              styles.registerButtonText,
              isRegistered && styles.registeredButtonText,
            ]}
          >
            {isRegistered ? "Already Registered" : "Register Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Reusable InfoItem component
function InfoItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
      <Icon size={20} color={Colors.neutral.gray} style={{ marginRight: 8 }} />
      <Text>{text}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.neutral.darkGray,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontWeight: "500",
  },
  imageContainer: {
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: 250,
  },
  backIconButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  actionButtons: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    zIndex: 10,
  },
  actionButton: {
    marginLeft: 8,
  },
  iconBackground: {
    backgroundColor: Colors.neutral.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  registeredBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  registeredText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: Colors.neutral.extraLightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  category: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    lineHeight: 24,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.neutral.darkGray,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  registerButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  registeredButton: {
    backgroundColor: Colors.neutral.extraLightGray,
  },
  registerButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
  registeredButtonText: {
    color: Colors.neutral.darkGray,
  },
  promptOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  promptContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 16,
    textAlign: "center",
  },
  promptDescription: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  promptButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  promptCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    alignItems: "center",
  },
  promptCancelText: {
    color: Colors.neutral.darkGray,
    fontSize: 16,
    fontWeight: "500",
  },
  promptConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 8,
    alignItems: "center",
  },
  promptConfirmText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "500",
  },
});
