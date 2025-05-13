import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Event } from "@/types";
import {
  Calendar,
  MapPin,
  Clock,
  Check,
  X,
  Ticket,
  User,
  DollarSign,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/apiClient";

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const router = useRouter();
  const { user } = useAuthStore();
  const userType = user?.userType || "business";
  const [events, setEvents] = useState<Event[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]); // Replace with actual type if available
  const [soldAllTickets, setAllSoldTickets] = useState<any[]>([]); // Replace with actual type if available

  // For event managers, show event requests instead of regular events
  const isEventManager = userType === "organizer";

  // Combine original events with additional events
  const allEvents = [...events];

  const upcomingEvents = allEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );
  const pastEvents = allEvents.filter(
    (event) => new Date(event.date) < new Date()
  );

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await api.get("/events");
      let sold = await api.get("/reservations");

      setEvents(res.data);
      setAllSoldTickets(sold.data);
      console.log(`all sold tickets are ${JSON.stringify(sold.data)}`);
      sold.data = sold.data.filter(
        (s) => s.eventId.organizerName === user?.name
      );

      setSoldTickets(sold.data);
      console.log(res.data);
      console.log(`Sold tickets are: ${JSON.stringify(sold.data)}`);
    };

    fetchEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    // Navigate to event details
    router.push(`/event-details?id=${event._id}&register=false`);
  };

  const handleReserveSpot = (event: Event) => {
    const isPurchased = soldAllTickets.some(
      (ticket) =>
        ticket.attendeeName === user?.name &&
        ticket.attendeeEmail === user?.email &&
        ticket.eventId._id === event._id
    );
    if (isPurchased) {
      // If already registered, just view details
      handleEventPress(event);
    } else {
      // If not registered, show confirmation dialog
      Alert.alert(
        "Reserve Spot",
        `Would you like to reserve a spot for "${event.title}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reserve",
            onPress: () => {
              // Navigate to event details for registration and payment
              router.push(`/event-details?id=${event._id}&register=true`);
            },
          },
        ]
      );
    }
  };

  const handleEventRequestAction = (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    Alert.alert(
      action === "approve" ? "Approve Event" : "Reject Event",
      `Are you sure you want to ${action} this event request?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: action === "approve" ? "Approve" : "Reject",
          style: action === "approve" ? "default" : "destructive",
          onPress: () => {
            // In a real app, this would call an API to approve/reject the event
            Alert.alert(
              "Success",
              `Event request has been ${
                action === "approve" ? "approved" : "rejected"
              }.`,
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleViewTicketDetails = (ticket: any) => {
    Alert.alert(
      "Ticket Details",
      `Attendee: ${ticket.attendeeName}
Email: ${ticket.attendeeEmail}
Event: ${ticket.eventId.title}
Date: ${formatDate(ticket.createdAt)}
Ticket Type: ${ticket.ticketType}
Price: $${ticket.price.toFixed(2)}`,
      [{ text: "OK" }]
    );
  };
  const renderEventCard = ({ item }: { item: Event }) => {
    // Check if the user has already reserved a spot for this event
    const isPurchased = soldAllTickets.some(
      (ticket) =>
        ticket.eventId._id === item._id &&
        ticket.attendeeName === user.name &&
        ticket.attendeeEmail === user.email
    );
    const isOrganizer = user.name === item.organizerName;

    if (isOrganizer && !isPurchased) {
      return (
        <TouchableOpacity
          style={styles.eventCard}
          onPress={() => handleEventPress(item)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          {isOrganizer && (
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>Reserved</Text>
            </View>
          )}

          <View style={styles.eventContent}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.eventCategory}>
              {item.category || "General"}
            </Text>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetailItem}>
                <Calendar
                  size={16}
                  color={Colors.neutral.gray}
                  style={styles.eventDetailIcon}
                />
                <Text style={styles.eventDetailText}>
                  {formatDate(item.date)}
                </Text>
              </View>

              <View style={styles.eventDetailItem}>
                <Clock
                  size={16}
                  color={Colors.neutral.gray}
                  style={styles.eventDetailIcon}
                />
                <Text style={styles.eventDetailText}>{item.time}</Text>
              </View>

              <View style={styles.eventDetailItem}>
                <MapPin
                  size={16}
                  color={Colors.neutral.gray}
                  style={styles.eventDetailIcon}
                />
                <Text style={styles.eventDetailText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            </View>

            <View style={styles.eventFooter}>
              <Text style={styles.eventPrice}>
                {item.price === 0 || item.price === undefined
                  ? "Free"
                  : `$${item.price}`}
              </Text>
              {/* Show the Delete button for the organizer */}
              {isOrganizer && (
                <TouchableOpacity style={styles.eventButton} onPress={() => {
                  Alert.alert(
                    "Delete Event",
                    `Are you sure you want to delete "${item.title}"?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        onPress: async () => {
                          await api.delete(`/events/${item._id}`);
                          setEvents((prevEvents) =>
                            prevEvents.filter((event) => event._id !== item._id)
                          );
                          setSoldTickets((prevTickets) =>
                            prevTickets.filter(
                              (ticket) => ticket.eventId._id !== item._id
                            )
                          );
                        },
                      },
                    ]
                  );
                }}>
                  <Text style={styles.eventButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        {isPurchased && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredText}>Reserved</Text>
          </View>
        )}

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.eventCategory}>{item.category || "General"}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetailItem}>
              <Calendar
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText}>
                {formatDate(item.date)}
              </Text>
            </View>

            <View style={styles.eventDetailItem}>
              <Clock
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText}>{item.time}</Text>
            </View>

            <View style={styles.eventDetailItem}>
              <MapPin
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <Text style={styles.eventPrice}>
              {item.price === 0 || item.price === undefined
                ? "Free"
                : `$${item.price}`}
            </Text>
            <TouchableOpacity
              style={[
                styles.eventButton,
                isPurchased && styles.registeredButton,
              ]}
              onPress={() => handleReserveSpot(item)}
            >
              <Text
                style={[
                  styles.eventButtonText,
                  isPurchased && styles.registeredButtonText,
                ]}
              >
                {isPurchased ? "View Details" : "Reserve Spot"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventRequestCard = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestOrganizer}>By: {item.organizer}</Text>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailItem}>
          <Calendar
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.eventDetailItem}>
          <Clock
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText}>{item.time}</Text>
        </View>

        <View style={styles.eventDetailItem}>
          <MapPin
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>

      <Text style={styles.requestDescription}>{item.description}</Text>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleEventRequestAction(item._id, "reject")}
        >
          <X size={16} color={Colors.status.error} style={styles.actionIcon} />
          <Text style={[styles.actionText, styles.rejectText]}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleEventRequestAction(item._id, "approve")}
        >
          <Check
            size={16}
            color={Colors.status.success}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, styles.approveText]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSoldTicketCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => handleViewTicketDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketIconContainer}>
          <Ticket size={24} color={Colors.primary.burgundy} />
        </View>
        <View style={styles.ticketHeaderContent}>
          <Text style={styles.ticketEventTitle} numberOfLines={1}>
            {item.eventTitle}
          </Text>
          <Text style={styles.ticketPurchaseDate}>
            Purchased: {formatDate(item.purchaseDate)}
          </Text>
        </View>
      </View>

      <View style={styles.ticketDivider} />

      <View style={styles.ticketDetails}>
        <View style={styles.ticketDetailItem}>
          <User
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailLabel}>Attendee:</Text>
          <Text style={styles.ticketDetailText} numberOfLines={1}>
            {item.attendeeName}
          </Text>
        </View>

        <View style={styles.ticketDetailItem}>
          <Calendar
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailLabel}>Event Date:</Text>
          <Text style={styles.ticketDetailText}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <View style={styles.ticketDetailItem}>
          <DollarSign
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailLabel}>Price:</Text>
          <Text style={styles.ticketDetailText}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEventManager ? "Event Management" : "Events"}
        </Text>

        {!isEventManager && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.activeTabText,
                ]}
              >
                Upcoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.activeTab]}
              onPress={() => setActiveTab("past")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "past" && styles.activeTabText,
                ]}
              >
                Past
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isEventManager && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.activeTabText,
                ]}
              >
                Sold Tickets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.activeTab]}
              onPress={() => setActiveTab("past")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "past" && styles.activeTabText,
                ]}
              >
                Events
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

{isEventManager && activeTab === "upcoming" ? (
        <FlatList
          data={soldTickets}
          renderItem={renderSoldTicketCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : isEventManager && activeTab === "past" ? (
        <FlatList
          data={events.filter(event => event.organizerName === user.name)}
          renderItem={renderEventCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={activeTab === "upcoming" ? upcomingEvents : pastEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Only show add button for event organizers */}
      {isEventManager && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-event")}
        >
          <View style={styles.addButtonGradient}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary.burgundy,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.gray,
  },
  activeTabText: {
    color: Colors.neutral.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  eventCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  registeredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailIcon: {
    marginRight: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.burgundy,
  },
  eventButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registeredButton: {
    backgroundColor: Colors.neutral.extraLightGray,
  },
  eventButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "500",
  },
  registeredButtonText: {
    color: Colors.neutral.darkGray,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.burgundy,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  // Event request card styles
  requestCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  requestOrganizer: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  approveButton: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    borderWidth: 1,
    borderColor: Colors.status.success,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  rejectText: {
    color: Colors.status.error,
  },
  approveText: {
    color: Colors.status.success,
  },
  // Sold ticket card styles
  ticketCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },
  ticketIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.burgundy + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ticketHeaderContent: {
    flex: 1,
  },
  ticketEventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  ticketPurchaseDate: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  ticketDetails: {
    padding: 16,
  },
  ticketDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketDetailIcon: {
    marginRight: 8,
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
    width: 80,
  },
  ticketDetailText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  ticketTypeBadge: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketTypeText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary.burgundy,
    fontWeight: "500",
  },
});
/*
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Event } from "@/types";
import {
  Calendar,
  MapPin,
  Clock,
  Check,
  X,
  Ticket,
  User,
  DollarSign,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/apiClient";

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const router = useRouter();
  const { user } = useAuthStore();
  const userType = user?.userType || "business";
  const [events, setEvents] = useState<Event[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]); // Replace with actual type if available

  // For event managers, show event requests instead of regular events
  const isEventManager = userType === "organizer";

  // Combine original events with additional events
  const allEvents = [...events];

  const upcomingEvents = allEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );
  const pastEvents = allEvents.filter(
    (event) => new Date(event.date) < new Date()
  );

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await api.get("/events");
      const sold = await api.get("/reservations");

      setEvents(res.data);
      setSoldTickets(sold.data);
      console.log(sold.data);
    };

    fetchEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    // Navigate to event details
    router.push(`/event-details?id=${event._id}`);
  };

  const handleReserveSpot = (event: Event) => {
    if (event.isRegistered) {
      // If already registered, just view details
      handleEventPress(event);
    } else {
      // If not registered, show confirmation dialog
      Alert.alert(
        "Reserve Spot",
        `Would you like to reserve a spot for "${event.title}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reserve",
            onPress: () => {
              // Navigate to event details for registration and payment
              router.push(`/event-details?id=${event._id}&register=true`);
            },
          },
        ]
      );
    }
  };

  const handleEventRequestAction = (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    Alert.alert(
      action === "approve" ? "Approve Event" : "Reject Event",
      `Are you sure you want to ${action} this event request?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: action === "approve" ? "Approve" : "Reject",
          style: action === "approve" ? "default" : "destructive",
          onPress: () => {
            // In a real app, this would call an API to approve/reject the event
            Alert.alert(
              "Success",
              `Event request has been ${
                action === "approve" ? "approved" : "rejected"
              }.`,
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleViewTicketDetails = (ticket: any) => {
    Alert.alert(
      "Ticket Details",
      `Attendee: ${ticket.attendeeName}
Email: ${ticket.attendeeEmail}
Event: ${ticket.eventId.title}
Date: ${formatDate(ticket.createdAt)}
Ticket Type: ${ticket.ticketType}
Price: $${ticket.price.toFixed(2)}`,
      [{ text: "OK" }]
    );
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      {item.isRegistered && (
        <View style={styles.registeredBadge}>
          <Text style={styles.registeredText}>Registered</Text>
        </View>
      )}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.eventCategory}>{item.category || "General"}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailItem}>
            <Calendar
              size={16}
              color={Colors.neutral.gray}
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
          </View>

          <View style={styles.eventDetailItem}>
            <Clock
              size={16}
              color={Colors.neutral.gray}
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>{item.time}</Text>
          </View>

          <View style={styles.eventDetailItem}>
            <MapPin
              size={16}
              color={Colors.neutral.gray}
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.eventPrice}>
            {item.price === 0 || item.price === undefined
              ? "Free"
              : `$${item.price}`}
          </Text>
          <TouchableOpacity
            style={[
              styles.eventButton,
              item.isRegistered && styles.registeredButton,
            ]}
            onPress={() => handleReserveSpot(item)}
          >
            <Text
              style={[
                styles.eventButtonText,
                item.isRegistered && styles.registeredButtonText,
              ]}
            >
              {item.isRegistered ? "View Details" : "Reserve Spot"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEventRequestCard = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestOrganizer}>By: {item.organizer}</Text>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailItem}>
          <Calendar
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.eventDetailItem}>
          <Clock
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText}>{item.time}</Text>
        </View>

        <View style={styles.eventDetailItem}>
          <MapPin
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>

      <Text style={styles.requestDescription}>{item.description}</Text>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleEventRequestAction(item._id, "reject")}
        >
          <X size={16} color={Colors.status.error} style={styles.actionIcon} />
          <Text style={[styles.actionText, styles.rejectText]}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleEventRequestAction(item._id, "approve")}
        >
          <Check
            size={16}
            color={Colors.status.success}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, styles.approveText]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSoldTicketCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => handleViewTicketDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketIconContainer}>
          <Ticket size={24} color={Colors.primary.burgundy} />
        </View>
        <View style={styles.ticketHeaderContent}>
          <Text style={styles.ticketEventTitle} numberOfLines={1}>
            {item.eventTitle}
          </Text>
          <Text style={styles.ticketPurchaseDate}>
            Purchased: {formatDate(item.purchaseDate)}
          </Text>
        </View>
      </View>

      <View style={styles.ticketDivider} />

      <View style={styles.ticketDetails}>
        <View style={styles.ticketDetailItem}>
          <User
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailText}>{item.attendeeName}</Text>
        </View>

        <View style={styles.ticketDetailItem}>
          <DollarSign
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailText}>
            ${item.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.ticketDetailItem}>
          <Text style={styles.ticketDetailText}>
            Type: {item.ticketType}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "upcoming" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming Events
          </Text>
        </TouchableOpacity>
        {isEventManager && (
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "eventRequests" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("eventRequests")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "eventRequests" && styles.activeTabText,
              ]}
            >
              Event Requests
            </Text>
          </TouchableOpacity>
        )}
        {userType === "admin" && (
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "soldTickets" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("soldTickets")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "soldTickets" && styles.activeTabText,
              ]}
            >
              Sold Tickets
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={
          activeTab === "upcoming"
            ? upcomingEvents
            : activeTab === "pastEvents"
            ? pastEvents
            : activeTab === "eventRequests"
            ? [] // Replace with actual data for event requests
            : soldTickets
        }
        keyExtractor={(item) => item._id}
        renderItem={
          activeTab === "upcoming"
            ? renderEventCard
            : activeTab === "soldTickets"
            ? renderSoldTicketCard
            : renderEventRequestCard
        }
        style={styles.flatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.burgundy,
  },
  tabText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
  },
  activeTabText: {
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  eventCard: {
    backgroundColor: Colors.neutral.white,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  registeredBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.status.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  registeredText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  eventCategory: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginVertical: 5,
  },
  eventDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 5,
  },
  eventDetailIcon: {
    marginRight: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  eventButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  registeredButton: {
    backgroundColor: Colors.neutral.gray,
  },
  eventButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  registeredButtonText: {
    color: Colors.neutral.white,
  },
  flatList: {
    paddingHorizontal: 15,
  },
  ticketCard: {
    backgroundColor: Colors.neutral.white,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 15,
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ticketIconContainer: {
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 30,
    padding: 10,
    marginRight: 15,
  },
  ticketHeaderContent: {
    flex: 1,
  },
  ticketEventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  ticketPurchaseDate: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginVertical: 10,
  },
  ticketDetails: {
    marginVertical: 10,
  },
  ticketDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ticketDetailIcon: {
    marginRight: 10,
  },
  ticketDetailText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  requestCard: {
    backgroundColor: Colors.neutral.white,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  requestHeader: {
    marginBottom: 15,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  requestOrganizer: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  eventDetailIcon: {
    marginRight: 10,
  },
  requestDescription: {
    marginBottom: 10,
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: Colors.status.error,
  },
  approveButton: {
    backgroundColor: Colors.status.success,
  },
  actionIcon: {
    marginRight: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  rejectText: {
    color: Colors.neutral.white,
  },
  approveText: {
    color: Colors.neutral.white,
  },
});
*/
